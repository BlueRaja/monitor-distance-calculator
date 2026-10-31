import { removeCustomResolution } from "../store.js";
import {
  DIAGONAL_MIN_IN,
  DIAGONAL_MAX_IN,
  DISTANCE_MIN_M,
  DISTANCE_MAX_M,
  GAUGE_ZONE_LOW,
  GAUGE_ZONE_HIGH,
  PPD_P50,
} from "../physics/constants.js";
import { formatDistance, formatDiagonal, snapDistance, feetToMeters } from "../units.js";
import { screenDimensions } from "../physics/geometry.js";

const WORLD_X = 2.2;
const WORLD_Y0 = -0.3;
const WORLD_Y1 = 6.3;
const MOBILE_LAYOUT_MQ = "(max-width: 1023px)";

function isMobileLayout() {
  return window.matchMedia(MOBILE_LAYOUT_MQ).matches;
}

/** Horizontal world extent (m); wider on mobile so max diagonal fills the view. */
function worldHalfX(state) {
  if (isMobileLayout()) {
    const k = Math.sqrt(state.aspect.w ** 2 + state.aspect.h ** 2);
    const Wmax = (DIAGONAL_MAX_IN * 0.0254 * state.aspect.w) / k;
    return (Wmax / 2) * 1.03;
  }
  return WORLD_X;
}

/**
 * @param {HTMLElement} root
 * @param {{ getResult: () => object, onChange: (p: object) => void }} ctx
 */
export function mountRoomPlan(root, ctx) {
  root.innerHTML = `
    <h2 class="card-title">Bird's Eye View</h2>
    <div class="chart-panel room-plan-panel" id="room-plan-panel">
      <svg id="room-plan-svg" class="room-plan-svg" viewBox="0 0 800 600" role="img" aria-label="Bird's eye view of screen and viewing distance"></svg>
    </div>
  `;
  const svg = root.querySelector("#room-plan-svg");
  const panel = root.querySelector("#room-plan-panel");

  let dragging = null;
  let activePointerId = null;

  function endDrag() {
    dragging = null;
    activePointerId = null;
  }

  function worldToSvg(x, y, w, h, halfX) {
    const sx = ((x + halfX) / (2 * halfX)) * w;
    const sy = ((y - WORLD_Y0) / (WORLD_Y1 - WORLD_Y0)) * h;
    return { sx, sy };
  }

  function svgToWorld(sx, sy, w, h, halfX) {
    const x = (sx / w) * (2 * halfX) - halfX;
    const y = (sy / h) * (WORLD_Y1 - WORLD_Y0) + WORLD_Y0;
    return { x, y };
  }

  function render() {
    const { state, computed } = ctx.getResult();
    const w = 800;
    const h = 600;
    const halfX = worldHalfX(state);
    const mobile = isMobileLayout();
    const distBadgeW = mobile ? 96 : 64;
    const distBadgeH = mobile ? 30 : 22;
    const screenTagW = mobile ? 80 : 56;
    const screenTagH = mobile ? 26 : 20;
    const screenTagOffset = mobile ? 26 : 18;
    const diagM = state.diagonalIn * 0.0254;
    const { W } = screenDimensions(diagM, state.aspect);
    const dist = state.distanceM;
    const halfW = W / 2;

    const tl = worldToSvg(-halfW, 0, w, h, halfX);
    const tr = worldToSvg(halfW, 0, w, h, halfX);
    const vc = worldToSvg(0, dist, w, h, halfX);

    const gridLines = [];
    const step = state.units === "metric" ? 0.5 : feetToMeters(1);
    for (let y = 0; y <= WORLD_Y1; y += step) {
      const p = worldToSvg(-halfX, y, w, h, halfX);
      const p2 = worldToSvg(halfX, y, w, h, halfX);
      gridLines.push(
        `<line x1="${p.sx}" y1="${p.sy}" x2="${p2.sx}" y2="${p2.sy}" class="grid-line"/>`
      );
    }

    svg.innerHTML = `
      <defs>
        <linearGradient id="fovGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.03"/>
        </linearGradient>
      </defs>
      ${gridLines.join("")}
      <polygon points="${tl.sx},${tl.sy} ${tr.sx},${tr.sy} ${vc.sx},${vc.sy}" fill="url(#fovGrad)" />
      <line x1="${tl.sx}" y1="${tl.sy}" x2="${vc.sx}" y2="${vc.sy}" class="fov-ray"/>
      <line x1="${tr.sx}" y1="${tr.sy}" x2="${vc.sx}" y2="${vc.sy}" class="fov-ray"/>
      <line x1="${vc.sx}" y1="${tl.sy}" x2="${vc.sx}" y2="${vc.sy}" class="dist-line"/>
      <g transform="translate(${vc.sx},${(tl.sy + vc.sy) / 2})">
        <rect x="${-distBadgeW / 2}" y="${-distBadgeH / 2}" width="${distBadgeW}" height="${distBadgeH}" rx="4" class="dist-badge"/>
        <text text-anchor="middle" dy="4" class="dist-badge-text">${formatDistance(dist, state.units)}</text>
      </g>
      <rect x="${tl.sx}" y="${tl.sy - 6}" width="${tr.sx - tl.sx}" height="12" rx="3" class="screen-bar"/>
      <g transform="translate(${(tl.sx + tr.sx) / 2}, ${tl.sy - screenTagOffset})">
        <rect x="${-screenTagW / 2}" y="${-screenTagH / 2}" width="${screenTagW}" height="${screenTagH}" rx="4" class="screen-tag"/>
        <text text-anchor="middle" dy="4" class="screen-tag-text">${formatDiagonal(state.diagonalIn, state.units)}</text>
      </g>
      <circle cx="${tl.sx}" cy="${tl.sy}" r="12" class="handle" data-handle="left" tabindex="0" role="slider" aria-label="Screen size left"/>
      <circle cx="${tr.sx}" cy="${tl.sy}" r="12" class="handle" data-handle="right" tabindex="0" role="slider" aria-label="Screen size right"/>
      <g class="viewer" transform="translate(${vc.sx}, ${vc.sy})" data-handle="viewer" tabindex="0" role="slider" aria-label="Viewing distance">
        <circle r="28" class="viewer-halo"/>
        <ellipse rx="18" ry="10" class="viewer-shoulders"/>
        <circle cy="-4" r="8" class="viewer-head"/>
        <polygon points="0,-18 -4,-12 4,-12" class="viewer-gaze"/>
      </g>
    `;
  }

  function setDiagonalFromHalfWidth(halfWM) {
    const { state } = ctx.getResult();
    const k = Math.sqrt(state.aspect.w ** 2 + state.aspect.h ** 2);
    const W = halfWM * 2;
    let diagIn = (W * k) / (state.aspect.w * 0.0254);
    diagIn = Math.round(Math.min(DIAGONAL_MAX_IN, Math.max(DIAGONAL_MIN_IN, diagIn)));
    ctx.onChange({ diagonalIn: diagIn });
  }

  function onPointerDown(e) {
    const t = e.target.closest("[data-handle]");
    if (!t) return;
    dragging = t.dataset.handle;
    activePointerId = e.pointerId;
    t.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (dragging === null || e.pointerId !== activePointerId) return;
    if (e.buttons === 0) {
      endDrag();
      return;
    }
    const rect = svg.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / rect.width) * 800;
    const sy = ((e.clientY - rect.top) / rect.height) * 600;
    const { x, y } = svgToWorld(sx, sy, 800, 600, worldHalfX(state));
    const { state } = ctx.getResult();

    if (dragging === "left" || dragging === "right") {
      const halfW = Math.abs(x);
      setDiagonalFromHalfWidth(halfW);
    } else if (dragging === "viewer") {
      const d = snapDistance(
        Math.min(DISTANCE_MAX_M, Math.max(DISTANCE_MIN_M, y)),
        state.units
      );
      ctx.onChange({ distanceM: d });
    }
  }

  function onPointerUp(e) {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    endDrag();
  }

  panel.addEventListener("pointerdown", onPointerDown);
  panel.addEventListener("pointermove", onPointerMove);
  panel.addEventListener("pointerup", onPointerUp);
  panel.addEventListener("pointercancel", onPointerUp);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);
  panel.style.touchAction = "none";

  return { render };
}

/**
 * @param {HTMLElement} root
 */
export function mountAcuityCard(root, ctx) {
  root.innerHTML = `
    <h2 class="card-title">Visual acuity</h2>
    <div id="acuity-body"></div>
  `;
  const body = root.querySelector("#acuity-body");

  function zoneFor(ppd) {
    if (ppd < GAUGE_ZONE_LOW.value) return "Detail limited by display";
    if (ppd <= GAUGE_ZONE_HIGH.value) return "At the eye's limit";
    return "Wasted pixels";
  }

  function formatPopulationPercent(pVisible) {
    return String(Math.floor(pVisible * 100));
  }

  function populationLine(pVisible) {
    const pctStr = formatPopulationPercent(pVisible);
    let line = `${pctStr}% of people could tell this from a perfect display`;
    return line;
  }

  function render() {
    const { state, computed } = ctx.getResult();
    const sel = computed.selected;
    const popLine = populationLine(sel.pVisible);
    const zone = zoneFor(sel.ppdEff);
    const maxGauge = 160;
    const needle = Math.min(100, (sel.ppdEff / maxGauge) * 100);
    const lowPct = (GAUGE_ZONE_LOW.value / maxGauge) * 100;
    const highPct = (GAUGE_ZONE_HIGH.value / maxGauge) * 100;
    const medianPct = (PPD_P50.value / maxGauge) * 100;

    const subline =
      Math.abs(sel.ppdH - sel.ppdV) > 0.5
        ? `<p class="muted">Nominal: ${sel.ppdH.toFixed(1)} × ${sel.ppdV.toFixed(1)} PPD (H × V)</p>`
        : "";

    body.innerHTML = `
      <div class="ppd-headline">
        <span class="ppd-value">${sel.ppdEff.toFixed(1)}</span>
        <span class="ppd-unit">Pixels per degree</span>
      </div>
      ${subline}
      <p class="pop-line">${popLine}</p>
      <span class="zone-badge">${zone}</span>
      <div class="gauge" aria-hidden="true">
        <div class="gauge-zones">
          <div class="gauge-zone gauge-zone--low" style="width:${lowPct}%"></div>
          <div class="gauge-zone gauge-zone--mid" style="left:${lowPct}%;width:${highPct - lowPct}%"></div>
          <div class="gauge-zone gauge-zone--high" style="left:${highPct}%;width:${100 - highPct}%"></div>
        </div>
        <div class="gauge-needle" style="left:${needle}%"></div>
        <div class="gauge-ref" style="left:${medianPct}%">
          <div class="gauge-ref-mark"></div>
          <span class="gauge-ref-label">95 (Median eye)</span>
        </div>
      </div>
      <p class="hyper-line">Jagged lines might still be noticable until ${formatDistance(sel.hyperM, state.units)}. This is known as <a href="https://en.wikipedia.org/wiki/Hyperacuity" target="_blank" rel="noopener noreferrer">hyperacuity</a>.</p>
    `;
  }

  return { render };
}

export function mountCutoffList(root, ctx) {
  root.innerHTML = `<h2 class="card-title" id="cutoff-title"></h2><div id="cutoff-rows" class="cutoff-rows" role="radiogroup"></div>`;
  const title = root.querySelector("#cutoff-title");
  const rowsEl = root.querySelector("#cutoff-rows");

  function render() {
    const { state, computed } = ctx.getResult();
    title.textContent = "Resolution";
    rowsEl.innerHTML = computed.rows
      .map((row, index) => {
        const selected = row.id === state.selectedRowId;
        const prev = index > 0 ? computed.rows[index - 1] : null;
        let badgeHtml;
        let badgeTitle = "";
        if (row.upgradeLabel === "Baseline") {
          badgeHtml = row.upgradeLabel;
        } else if (prev) {
          badgeTitle = `JND Limen: +${row.deltaJ.toFixed(1)}`;
          badgeHtml = `${row.upgradeLabel} <span class="cutoff-badge-vs">from ${prev.label}</span>`;
        } else {
          badgeHtml = row.upgradeLabel;
        }
        const titleAttr = badgeTitle
          ? ` title="${badgeTitle.replace(/"/g, "&quot;")}"`
          : "";
        const descHtml = selected
          ? `<p class="cutoff-desc">Indistinguishable from perfect beyond <strong>${formatDistance(row.cutoffM, state.units)}</strong></p>`
          : "";
        const isCustom = row.id.startsWith("custom-");
        const removeBtn = isCustom
          ? `<button type="button" class="cutoff-remove" data-remove-id="${row.id}" aria-label="Remove ${row.label}"></button>`
          : "";
        return `
          <div class="cutoff-row-wrap">
          <button type="button" class="cutoff-row ${selected ? "cutoff-row--selected" : ""}" data-id="${row.id}" role="radio" aria-checked="${selected}">
            <div class="cutoff-row-main">
              <span class="cutoff-label">${row.label}</span>
              ${isCustom ? "" : `<span class="cutoff-dims">${row.resX}×${row.resY}</span>`}
            </div>
            <span class="cutoff-badge"${titleAttr}>${badgeHtml}</span>
            ${descHtml}
          </button>
          ${removeBtn}
          </div>`;
      })
      .join("");

    rowsEl.querySelectorAll(".cutoff-row").forEach((btn) => {
      btn.addEventListener("click", () => {
        ctx.onChange({ selectedRowId: btn.dataset.id });
      });
    });
    rowsEl.querySelectorAll(".cutoff-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeCustomResolution(btn.dataset.removeId);
      });
    });
  }

  return { render };
}
