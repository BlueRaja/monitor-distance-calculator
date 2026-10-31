import { DIAGONAL_MIN_IN, DIAGONAL_MAX_IN } from "./physics/constants.js";

const FT_TO_M = 0.3048;
const M_TO_FT = 1 / FT_TO_M;

export function metersToFeet(m) {
  return m * M_TO_FT;
}

export function feetToMeters(ft) {
  return ft * FT_TO_M;
}

export function inchesToCm(inches) {
  return inches * 2.54;
}

/**
 * @param {number} distanceM
 * @param {"imperial"|"metric"} units
 */
export function formatDistance(distanceM, units) {
  if (units === "metric") {
    return `${distanceM.toFixed(2)} m`;
  }
  return `${metersToFeet(distanceM).toFixed(1)} ft`;
}

/**
 * @param {number} diagonalIn
 * @param {"imperial"|"metric"} units
 */
export function formatDiagonal(diagonalIn, units) {
  if (units === "metric") {
    return `${Math.round(inchesToCm(diagonalIn))} cm`;
  }
  return `${Math.round(diagonalIn)}"`;
}

/** Chart / axis range in display units (inches or cm). */
export function diagonalDisplayRange(units) {
  if (units === "metric") {
    return {
      min: inchesToCm(DIAGONAL_MIN_IN),
      max: inchesToCm(DIAGONAL_MAX_IN),
    };
  }
  return { min: DIAGONAL_MIN_IN, max: DIAGONAL_MAX_IN };
}

export function diagonalInchesFromDisplay(value, units) {
  if (units === "metric") {
    return value / 2.54;
  }
  return value;
}

export function formatDiagonalAxisTick(value, units) {
  if (units === "metric") {
    return `${Math.round(value)} cm`;
  }
  return `${value}"`;
}

export function snapDiagonalInches(diagonalIn, units) {
  if (units === "metric") {
    const cm = Math.round(inchesToCm(diagonalIn));
    const clamped = Math.min(
      inchesToCm(DIAGONAL_MAX_IN),
      Math.max(inchesToCm(DIAGONAL_MIN_IN), cm)
    );
    return clamped / 2.54;
  }
  return Math.round(
    Math.min(DIAGONAL_MAX_IN, Math.max(DIAGONAL_MIN_IN, diagonalIn))
  );
}

export function snapDistance(distanceM, units) {
  if (units === "metric") {
    const step = 0.05;
    return Math.round(distanceM / step) * step;
  }
  const ft = metersToFeet(distanceM);
  const snapped = Math.round(ft * 10) / 10;
  return feetToMeters(Math.min(20, Math.max(0.5, snapped)));
}

export { FT_TO_M, M_TO_FT };
