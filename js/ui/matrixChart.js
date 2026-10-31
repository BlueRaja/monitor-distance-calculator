import * as d3 from "d3";
import { INCH_TO_M } from "../physics/constants.js";
import {
  formatDistance,
  formatDiagonal,
  snapDistance,
  feetToMeters,
  metersToFeet,
  diagonalDisplayRange,
  formatDiagonalAxisTick,
  diagonalInchesFromDisplay,
  snapDiagonalInches,
  inchesToCm,
} from "../units.js";

const MARGIN = { top: 24, right: 24, bottom: 44, left: 52 };

/**
 * row.slope = cutoffM / diagonalM. Chart Y vs display diagonal X:
 * imperial: y_ft = (slope/12) * x_in
 * metric: y_m = (slope * INCH_TO_M / 2.54) * x_cm
 */
function slopeInDisplayUnits(row, units) {
  if (units === "metric") {
    return (row.slope * INCH_TO_M.value) / 2.54;
  }
  return row.slope / 12;
}

/**
 * True cutoff boundary: rises as slope×diagonal until distance cap, then flat.
 * @returns {[number, number][]} polyline in display units (x diagonal, y distance)
 */
function cutoffPolyline(slope, xMin, xMax, yMax) {
  const yAt = (xd) => Math.min(yMax, Math.max(0, slope * xd));
  if (slope <= 0) {
    return [
      [xMin, 0],
      [xMax, 0],
    ];
  }
  const xCap = yMax / slope;
  if (xCap >= xMax) {
    return [
      [xMin, yAt(xMin)],
      [xMax, yAt(xMax)],
    ];
  }
  /** @type {[number, number][]} */
  const pts = [[xMin, yAt(xMin)], [xCap, yMax]];
  if (xMax > xCap) pts.push([xMax, yMax]);
  return pts;
}

function polylineLength(pts) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  }
  return len;
}

/** @param {number} frac 0..1 along polyline arc length */
function pointOnPolyline(pts, frac) {
  if (pts.length === 0) return [0, 0];
  if (pts.length === 1) return pts[0];
  const total = polylineLength(pts);
  if (total <= 0) return pts[0];
  let t = frac * total;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (t <= seg) {
      const u = seg > 0 ? t / seg : 0;
      return [a[0] + u * (b[0] - a[0]), a[1] + u * (b[1] - a[1])];
    }
    t -= seg;
  }
  return pts[pts.length - 1];
}

function bandPolygonPoints(botSlope, topSlope, xMin, xMax, yMax) {
  const topPts = cutoffPolyline(topSlope, xMin, xMax, yMax);
  /** @type {[number, number][]} */
  let botPts;
  if (botSlope == null) {
    botPts = [
      [xMin, 0],
      [xMax, 0],
    ];
  } else {
    botPts = cutoffPolyline(botSlope, xMin, xMax, yMax);
  }
  const ring = [...botPts];
  for (let i = topPts.length - 1; i >= 0; i--) {
    const p = topPts[i];
    const last = ring[ring.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) ring.push(p);
  }
  return ring;
}

function svgPolylinePoints(pts, xScale, yScale) {
  return pts.map(([xd, yd]) => `${xScale(xd)},${yScale(yd)}`).join(" ");
}

function svgPathD(pts, xScale, yScale) {
  return pts
    .map(([xd, yd], i) => `${i === 0 ? "M" : "L"} ${xScale(xd)} ${yScale(yd)}`)
    .join(" ");
}

/**
 * @param {HTMLElement} root
 * @param {{ getResult: () => object, onChange: (p: object) => void }} ctx
 */
export function mountMatrixChart(root, ctx) {
  root.innerHTML = `
    <h2 class="card-title">Human Vision Limits</h2>
    <div class="chart-panel matrix-panel" id="matrix-panel">
      <svg id="matrix-svg" class="matrix-svg"></svg>
    </div>
  `;
  const svg = d3.select("#matrix-svg");
  const panel = root.querySelector("#matrix-panel");
  let width = 700;
  let height = 390;

  function distMax(units) {
    return units === "metric" ? 6.096 : 20;
  }

  function displayToDist(v, units) {
    return units === "metric" ? v : feetToMeters(v);
  }

  function distToDisplay(m, units) {
    return units === "metric" ? m : metersToFeet(m);
  }

  function markerXDisplay(state) {
    return state.units === "metric"
      ? inchesToCm(state.diagonalIn)
      : state.diagonalIn;
  }

  function render() {
    const { state, computed } = ctx.getResult();
    const rect = panel.getBoundingClientRect();
    width = Math.max(400, rect.width);
    height = Math.round(width * (390 / 700));
    svg.attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;
    const yMax = distMax(state.units);
    const { min: xMin, max: xMax } = diagonalDisplayRange(state.units);

    const x = d3.scaleLinear().domain([xMin, xMax]).range([0, innerW]);
    const y = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]);

    svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const markerY = distToDisplay(state.distanceM, state.units);
    const markerX = markerXDisplay(state);

    const rows = computed.rows;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const slopeTop = slopeInDisplayUnits(row, state.units);
      const slopeBot =
        i > 0 ? slopeInDisplayUnits(rows[i - 1], state.units) : null;
      const isSel = row.id === state.selectedRowId;
      const bandPts = bandPolygonPoints(slopeBot, slopeTop, xMin, xMax, yMax);
      g.append("polygon")
        .attr("points", svgPolylinePoints(bandPts, x, y))
        .attr("class", isSel ? "res-band res-band--selected" : "res-band");
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const slope = slopeInDisplayUnits(row, state.units);
      const isSel = row.id === state.selectedRowId;
      const linePts = cutoffPolyline(slope, xMin, xMax, yMax);
      g.append("path")
        .attr("d", svgPathD(linePts, x, y))
        .attr("class", isSel ? "res-line res-line--selected" : "res-line");
    }

    const labelsG = g.append("g").attr("class", "res-line-labels");
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const slope = slopeInDisplayUnits(row, state.units);
      const isSel = row.id === state.selectedRowId;
      const linePts = cutoffPolyline(slope, xMin, xMax, yMax);
      const labelFrac = rows.length <= 1 ? 0.5 : (i + 0.5) / rows.length;
      const [labelXDisp, labelYDisp] = pointOnPolyline(linePts, labelFrac);
      labelsG
        .append("text")
        .attr("x", x(labelXDisp))
        .attr("y", y(labelYDisp))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("class", isSel ? "res-line-label res-line-label--selected" : "res-line-label")
        .text(row.label);
    }

    g.append("line")
      .attr("x1", x(markerX))
      .attr("x2", x(markerX))
      .attr("y1", 0)
      .attr("y2", y(markerY))
      .attr("class", "crosshair");
    g.append("line")
      .attr("x1", 0)
      .attr("x2", x(markerX))
      .attr("y1", y(markerY))
      .attr("y2", y(markerY))
      .attr("class", "crosshair");

    const markerG = g
      .append("g")
      .attr("class", "matrix-marker")
      .attr("transform", `translate(${x(markerX)},${y(markerY)})`);
    markerG.append("circle").attr("r", 8).attr("class", "marker-dot");
    markerG
      .append("text")
      .attr("y", -14)
      .attr("text-anchor", "middle")
      .attr("class", "marker-label")
      .text(
        `${formatDiagonal(state.diagonalIn, state.units)} @ ${formatDistance(state.distanceM, state.units)}`
      );

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(8)
          .tickFormat((d) => formatDiagonalAxisTick(d, state.units))
      );
    g.append("g").call(
      d3
        .axisLeft(y)
        .ticks(8)
        .tickFormat((d) => (state.units === "metric" ? `${d} m` : `${d} ft`))
    );
    g.append("text")
      .attr("x", innerW / 2)
      .attr("y", innerH + 36)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text(
        state.units === "metric" ? "Screen diagonal (cm)" : "Screen diagonal (in)"
      );
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerH / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text(state.units === "metric" ? "Distance (m)" : "Distance (ft)");
  }

  function pointerToData(evt) {
    const { state } = ctx.getResult();
    const rect = panel.querySelector("svg").getBoundingClientRect();
    const px = evt.clientX - rect.left - MARGIN.left;
    const py = evt.clientY - rect.top - MARGIN.top;
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;
    const { min: xMin, max: xMax } = diagonalDisplayRange(state.units);
    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, innerW]);
    const yMax = distMax(state.units);
    const yScale = d3.scaleLinear().domain([0, yMax]).range([innerH, 0]);
    const diagDisplay = xScale.invert(px);
    const diagIn = snapDiagonalInches(
      diagonalInchesFromDisplay(diagDisplay, state.units),
      state.units
    );
    let distDisp = yScale.invert(py);
    distDisp = Math.min(yMax, Math.max(0, distDisp));
    const distM = snapDistance(displayToDist(distDisp, state.units), state.units);
    return { diagonalIn: diagIn, distanceM: distM };
  }

  let dragMarker = false;
  let dragStart = null;
  let activePointerId = null;

  function endPointerInteraction() {
    dragMarker = false;
    dragStart = null;
    activePointerId = null;
  }

  panel.addEventListener("pointerdown", (e) => {
    dragStart = { x: e.clientX, y: e.clientY };
    dragMarker = false;
    activePointerId = e.pointerId;
    if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
  });
  panel.addEventListener("pointermove", (e) => {
    if (dragStart === null || e.pointerId !== activePointerId) return;
    if (e.buttons === 0) {
      endPointerInteraction();
      return;
    }
    const moved =
      Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > 4;
    if (moved) dragMarker = true;
    if (!dragMarker) return;
    ctx.onChange(pointerToData(e));
  });
  function onPointerEnd(e) {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    if (!dragMarker && dragStart) {
      ctx.onChange(pointerToData(e));
    }
    endPointerInteraction();
  }
  panel.addEventListener("pointerup", onPointerEnd);
  panel.addEventListener("pointercancel", onPointerEnd);
  window.addEventListener("pointerup", onPointerEnd);
  window.addEventListener("pointercancel", onPointerEnd);
  panel.style.touchAction = "none";

  return { render };
}
