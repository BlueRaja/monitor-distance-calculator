import {
  POPULATION_MU,
  POPULATION_SIGMA,
  Z_P95,
} from "./constants.js";

/** Abramowitz & Stegun 7.1.26 [17] */
function erf(x) {
  const sign = Math.sign(x);
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-x * x);
  return sign * y;
}

/** Standard normal CDF */
export function normalCdf(z) {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Fraction of population that can tell P PPD from perfect.
 * @param {number} P - effective PPD
 */
export function pVisible(P) {
  if (P <= 0) return 0;
  const cbrtHalf = Math.cbrt(P / 2);
  const z = (cbrtHalf - POPULATION_MU.value) / POPULATION_SIGMA.value;
  return 1 - normalCdf(z);
}

/**
 * @param {number} z - standard normal quantile
 */
export function ppdAtPercentile(z) {
  const c = POPULATION_MU.value + z * POPULATION_SIGMA.value;
  return 2 * c * c * c;
}

export function ppdP95() {
  return ppdAtPercentile(Z_P95.value);
}
