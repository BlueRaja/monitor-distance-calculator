import {
  LUMINANCE_CD_M2,
  SQRI_INTEGRATION_N,
  K_REF_PPD,
  K_REF_X0,
} from "./constants.js";
import { contrastSensitivity } from "./csf.js";
import { mtf, getLayoutAxes, LAYOUTS } from "./mtf.js";

/**
 * SQRI per axis [5], clamped where M·S < 1
 * @param {number} P - nominal PPD on this axis
 * @param {import('./mtf.js').SubpixelStrip[]} subs
 * @param {number} X0
 * @param {number} [L]
 */
export function sqriAxis(P, subs, X0, L = LUMINANCE_CD_M2.value) {
  if (P <= 0 || X0 <= 0) return 0;
  const umin = 1 / X0;
  const umax = P / 2;
  if (umax <= umin) return 0;

  const N = SQRI_INTEGRATION_N.value;
  const lnUmin = Math.log(umin);
  const lnUmax = Math.log(umax);
  const h = (lnUmax - lnUmin) / N;
  let sum = 0;

  for (let i = 0; i <= N; i++) {
    const u = Math.exp(lnUmin + i * h);
    const M = mtf(subs, u / P);
    const S = contrastSensitivity(u, X0, L);
    const ratio = M * S;
    const g = ratio >= 1 ? Math.sqrt(ratio) : 0;
    const weight = i === 0 || i === N ? 0.5 : 1;
    sum += weight * g * h;
  }
  return sum / Math.LN2;
}

/**
 * @param {number} ppdH
 * @param {number} ppdV
 * @param {string} layout
 * @param {number} X0
 */
export function sqriTotal(ppdH, ppdV, layout, X0) {
  const axes = getLayoutAxes(layout);
  const rgbRef = LAYOUTS.rgb;
  const Jh = sqriAxis(ppdH, axes.h, X0);
  const Jv = sqriAxis(ppdV, axes.v, X0);
  return (Jh + Jv) / 2;
}

/** @type {Record<string, { kH: number, kV: number }>} */
const kCache = {};

/**
 * PPD factor k ≤ 1 for layout vs RGB reference [10]
 * @param {string} layout
 */
export function getLayoutK(layout) {
  if (layout === "rgb" || layout === "bgr") {
    return { kH: 1, kV: 1 };
  }
  if (kCache[layout]) return kCache[layout];

  const axes = getLayoutAxes(layout);
  const rgb = LAYOUTS.rgb;
  const P = K_REF_PPD.value;
  const X0 = K_REF_X0.value;

  const targetH = sqriAxis(P, axes.h, X0);
  const targetV = sqriAxis(P, axes.v, X0);

  function bisectK(target, layoutSubs, refSubs) {
    let lo = P * 0.5;
    let hi = P * 1.5;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      const jRef = sqriAxis(mid, refSubs, X0);
      if (jRef < target) lo = mid;
      else hi = mid;
    }
    const k = lo / P;
    return Math.min(1, k);
  }

  const kH = bisectK(targetH, axes.h, rgb.h);
  const kV = bisectK(targetV, axes.v, rgb.v);
  kCache[layout] = { kH, kV };
  return kCache[layout];
}

export function clearLayoutKCache() {
  for (const key of Object.keys(kCache)) delete kCache[key];
}
