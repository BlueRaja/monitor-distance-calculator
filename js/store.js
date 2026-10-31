import {
  DIAGONAL_MIN_IN,
  DIAGONAL_MAX_IN,
  DISTANCE_MIN_M,
  DISTANCE_MAX_M,
} from "./physics/constants.js";
import { customResolutionId } from "./data/resolutions.js";

/**
 * @typedef {import('./physics/verdict.js').AppState} AppState
 */

const STORAGE_KEY = "monitor-acuity-calculator:v1";

/** @type {AppState} */
const defaultState = {
  diagonalIn: 65,
  distanceM: 2.4384,
  aspect: { w: 16, h: 9 },
  aspectKey: "16:9",
  layout: "rgb",
  customResolutions: [],
  selectedRowId: "2160",
  units: "imperial",
};

const LAYOUTS = new Set([
  "rgb",
  "bgr",
  "pentile",
  "woledRWBG",
  "woledRGWB",
  "qdoled",
]);

const ASPECT_KEYS = new Set(["16:9", "16:10", "21:9", "32:9", "4:3", "custom"]);

/** @param {unknown} raw */
function sanitizeState(raw) {
  if (!raw || typeof raw !== "object") return { ...defaultState };

  /** @type {Record<string, unknown>} */
  const o = raw;

  /** @type {AppState} */
  const next = { ...defaultState };

  if (typeof o.diagonalIn === "number" && Number.isFinite(o.diagonalIn)) {
    next.diagonalIn = Math.min(
      DIAGONAL_MAX_IN,
      Math.max(DIAGONAL_MIN_IN, Math.round(o.diagonalIn))
    );
  }
  if (typeof o.distanceM === "number" && Number.isFinite(o.distanceM)) {
    next.distanceM = Math.min(
      DISTANCE_MAX_M,
      Math.max(DISTANCE_MIN_M, o.distanceM)
    );
  }
  if (o.aspect && typeof o.aspect === "object") {
    const aw = Number(o.aspect.w);
    const ah = Number(o.aspect.h);
    if (aw > 0 && ah > 0) {
      next.aspect = { w: aw, h: ah };
    }
  }
  if (typeof o.aspectKey === "string" && ASPECT_KEYS.has(o.aspectKey)) {
    next.aspectKey = o.aspectKey;
  }
  if (typeof o.layout === "string" && LAYOUTS.has(o.layout)) {
    next.layout = o.layout;
  }
  if (o.units === "metric" || o.units === "imperial") {
    next.units = o.units;
  }
  if (typeof o.selectedRowId === "string" && o.selectedRowId.length > 0) {
    next.selectedRowId = o.selectedRowId;
  }

  /** @type {{ x: number, y: number }[]} */
  const customs = [];
  const pushCustom = (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    x = Math.round(x);
    y = Math.round(y);
    if (x < 1 || y < 1) return;
    const id = customResolutionId(x, y);
    if (customs.some((c) => customResolutionId(c.x, c.y) === id)) return;
    customs.push({ x, y });
  };

  if (Array.isArray(o.customResolutions)) {
    for (const item of o.customResolutions) {
      if (item && typeof item === "object") {
        pushCustom(Number(item.x), Number(item.y));
      }
    }
  } else if (o.customRes && typeof o.customRes === "object") {
    pushCustom(Number(o.customRes.x), Number(o.customRes.y));
  }
  next.customResolutions = customs;

  return next;
}

/** @param {AppState} s */
function persistState(s) {
  try {
    const payload = {
      diagonalIn: s.diagonalIn,
      distanceM: s.distanceM,
      aspect: s.aspect,
      aspectKey: s.aspectKey,
      layout: s.layout,
      customResolutions: s.customResolutions,
      selectedRowId: s.selectedRowId,
      units: s.units,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return sanitizeState(null);
    return sanitizeState(JSON.parse(raw));
  } catch {
    return sanitizeState(null);
  }
}

/** @type {AppState} */
let state = loadPersistedState();

/** @type {Set<(s: AppState) => void>} */
const listeners = new Set();

/** @param {Partial<AppState>} patch */
export function setState(patch) {
  state = { ...state, ...patch };
  persistState(state);
  for (const fn of listeners) fn(state);
}

export function getState() {
  return state;
}

/** @param {(s: AppState) => void} fn */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function resetState() {
  state = { ...defaultState };
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  for (const fn of listeners) fn(state);
}

/** @param {string} rowId */
export function removeCustomResolution(rowId) {
  if (!rowId.startsWith("custom-")) return;
  const customResolutions = state.customResolutions.filter(
    (r) => customResolutionId(r.x, r.y) !== rowId
  );
  const patch = { customResolutions };
  if (state.selectedRowId === rowId) {
    patch.selectedRowId = "2160";
  }
  setState(patch);
}
