import {
  P_VISIBLE_IMPOSSIBLE,
  JND_BARELY,
  JND_SUBTLE,
  JND_NOTICEABLE,
  JND_LARGE,
  HYPERACUITY_PPD,
  INCH_TO_M,
} from "./constants.js";
import { computePpdAxes, distanceForPpd } from "./geometry.js";
import { pVisible, ppdP95 } from "./population.js";
import { sqriTotal } from "./sqri.js";
import { getLayoutK } from "./sqri.js";
import {
  resolutionsForAspectKey,
  customResolutionId,
  customResolutionLabel,
} from "../data/resolutions.js";

/**
 * @param {number} deltaJ
 * @param {number} prevPpdEff
 * @param {number} currentPpdEff
 */
export function upgradeTier(deltaJ, prevPpdEff, currentPpdEff) {
  if (pVisible(prevPpdEff) < P_VISIBLE_IMPOSSIBLE.value) {
    return "Impossible to tell";
  }
  if (pVisible(currentPpdEff) < P_VISIBLE_IMPOSSIBLE.value) {
    return "Impossible to tell";
  }
  if (deltaJ < JND_BARELY.value) return "Barely Noticable Difference";
  if (deltaJ < JND_SUBTLE.value) return "Subtle Difference";
  if (deltaJ < JND_NOTICEABLE.value) return "Noticable Difference";
  if (deltaJ < JND_LARGE.value) return "Very Noticable Difference";
  return "Massive Difference";
}

/**
 * @typedef {object} AppState
 * @property {number} diagonalIn
 * @property {number} distanceM
 * @property {{ w: number, h: number }} aspect
 * @property {string} layout
 * @property {{ x: number, y: number }[]} customResolutions
 * @property {string} selectedRowId
 * @property {string} units
 * @property {string} [aspectKey]
 */

/**
 * @param {AppState} state
 */
export function computeAll(state) {
  const aspectKey = state.aspectKey || "16:9";
  const baseRows = resolutionsForAspectKey(aspectKey);
  /** @type {typeof baseRows} */
  let rowDefs = [...baseRows];

  for (const { x, y } of state.customResolutions || []) {
    rowDefs.push({
      id: customResolutionId(x, y),
      label: customResolutionLabel(x, y),
      resX: x,
      resY: y,
    });
  }

  const { kH, kV } = getLayoutK(state.layout);
  const P95 = ppdP95();

  /** @type {Array<object>} */
  const rows = [];

  for (const def of rowDefs) {
    const geom = computePpdAxes(
      state.diagonalIn,
      state.aspect,
      state.distanceM,
      def.resX,
      def.resY
    );
    const ppdEff = Math.min(kH * geom.ppdH, kV * geom.ppdV);
    const J = sqriTotal(geom.ppdH, geom.ppdV, state.layout, geom.X0);
    const cutoffM = Math.max(
      distanceForPpd(geom.px, P95 / kH),
      distanceForPpd(geom.py, P95 / kV)
    );
    const hyperM = Math.max(
      distanceForPpd(geom.px, HYPERACUITY_PPD.value),
      distanceForPpd(geom.py, HYPERACUITY_PPD.value)
    );
    const diagonalM = state.diagonalIn * INCH_TO_M.value;
    const slope = cutoffM / diagonalM;

    rows.push({
      ...def,
      ppdH: geom.ppdH,
      ppdV: geom.ppdV,
      ppdEff,
      pVisible: pVisible(ppdEff),
      J,
      cutoffM,
      hyperM,
      slope,
      X0: geom.X0,
      pitchH: geom.px,
      pitchV: geom.py,
    });
  }

  rows.sort((a, b) => a.ppdEff - b.ppdEff);

  let prev = null;
  for (const row of rows) {
    if (!prev) {
      row.upgradeLabel = "Baseline";
      row.deltaJ = 0;
    } else {
      row.deltaJ = row.J - prev.J;
      row.upgradeLabel = upgradeTier(row.deltaJ, prev.ppdEff, row.ppdEff);
    }
    prev = row;
  }

  let selected =
    rows.find((r) => r.id === state.selectedRowId) ||
    rows.find((r) => r.id === "2160") ||
    rows[Math.floor(rows.length / 2)] ||
    rows[0];

  return { rows, selected, kH, kV, P95 };
}
