/**
 * Screen geometry and PPD (center of flat display).
 * Ref [2]: center PPD formula.
 */

/**
 * @param {number} diagonalM - diagonal in meters
 * @param {{ w: number, h: number }} aspect
 */
export function screenDimensions(diagonalM, aspect) {
  const k = Math.sqrt(aspect.w * aspect.w + aspect.h * aspect.h);
  const W = (diagonalM * aspect.w) / k;
  const H = (diagonalM * aspect.h) / k;
  return { W, H, k };
}

/**
 * @param {number} pitchM - pixel pitch in meters
 * @param {number} distanceM - viewing distance in meters
 */
export function ppd(pitchM, distanceM) {
  if (pitchM <= 0 || distanceM <= 0) return 0;
  return Math.PI / (360 * Math.atan(pitchM / (2 * distanceM)));
}

/**
 * @param {number} pitchM
 * @param {number} targetPpd
 */
export function distanceForPpd(pitchM, targetPpd) {
  if (pitchM <= 0 || targetPpd <= 0) return Infinity;
  return pitchM / (2 * Math.tan(Math.PI / (360 * targetPpd)));
}

/**
 * @param {number} W
 * @param {number} H
 * @param {number} distanceM
 */
export function fieldOfViewAndX0(W, H, distanceM) {
  const fovH = (2 * Math.atan(W / (2 * distanceM)) * 180) / Math.PI;
  const fovV = (2 * Math.atan(H / (2 * distanceM)) * 180) / Math.PI;
  const X0 = Math.sqrt(fovH * fovV);
  return { fovH, fovV, X0 };
}

/**
 * @param {number} diagonalIn
 * @param {{ w: number, h: number }} aspect
 * @param {number} distanceM
 * @param {number} resX
 * @param {number} resY
 */
export function computePpdAxes(diagonalIn, aspect, distanceM, resX, resY) {
  const diagonalM = diagonalIn * 0.0254;
  const { W, H } = screenDimensions(diagonalM, aspect);
  const px = W / resX;
  const py = H / resY;
  const ppdH = ppd(px, distanceM);
  const ppdV = ppd(py, distanceM);
  const { fovH, fovV, X0 } = fieldOfViewAndX0(W, H, distanceM);
  return { W, H, px, py, ppdH, ppdV, fovH, fovV, X0 };
}
