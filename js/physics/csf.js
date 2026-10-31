import { LUMINANCE_CD_M2 } from "./constants.js";

/**
 * Barten (2003) simplified CSF, Eq. 11 p.234 [4]
 * @param {number} u - spatial frequency cpd
 * @param {number} X0 - visual angle degrees
 * @param {number} [L] - luminance cd/m²
 */
export function contrastSensitivity(u, X0, L = LUMINANCE_CD_M2.value) {
  if (u <= 0 || X0 <= 0) return 0;
  const num =
    5200 *
    Math.exp(-0.0016 * u * u * Math.pow(1 + 100 / L, 0.08));
  const denom = Math.sqrt(
    (1 + 144 / (X0 * X0) + 0.64 * u * u) *
      (63 / Math.pow(L, 0.83) + 1 / (1 - Math.exp(-0.02 * u * u)))
  );
  return num / denom;
}

/** Modulation threshold m_t = 1/S */
export function modulationThreshold(u, X0, L) {
  const s = contrastSensitivity(u, X0, L);
  return s > 0 ? 1 / s : Infinity;
}
