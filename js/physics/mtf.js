import { LUMA_R, LUMA_G, LUMA_B } from "./constants.js";

/** @typedef {{ w: number, a: number, c: number }} SubpixelStrip */

const R = LUMA_R.value;
const G = LUMA_G.value;
const B = LUMA_B.value;
const third = 1 / 3;
const RB = R + B;

function rgbStripeH() {
  return [
    { w: R, a: third, c: third / 2 },
    { w: G, a: third, c: 0.5 },
    { w: B, a: third, c: 1 - third / 2 },
  ];
}

function fullApertureV() {
  return [{ w: 1, a: 1, c: 0.5 }];
}

function woledStripes(order) {
  const q = 0.25;
  const rgbHalf = 0.5 * (1 / 3);
  const wMap = { R: R * rgbHalf, G: G * rgbHalf, B: B * rgbHalf, W: 0.5 };
  return order.map((ch, i) => ({
    w: wMap[ch],
    a: q,
    c: q * (i + 0.5),
  }));
}

/** @type {Record<string, { h: SubpixelStrip[], v: SubpixelStrip[] }>} */
export const LAYOUTS = {
  rgb: { h: rgbStripeH(), v: fullApertureV() },
  bgr: {
    h: [
      { w: B, a: third, c: third / 2 },
      { w: G, a: third, c: 0.5 },
      { w: R, a: third, c: 1 - third / 2 },
    ],
    v: fullApertureV(),
  },
  pentile: {
    h: [
      { w: RB, a: 0.5, c: 0.25 },
      { w: G, a: 0.5, c: 0.75 },
    ],
    v: fullApertureV(),
  },
  woledRWBG: { h: woledStripes(["R", "W", "B", "G"]), v: fullApertureV() },
  woledRGWB: { h: woledStripes(["R", "G", "W", "B"]), v: fullApertureV() },
  qdoled: {
    h: [
      { w: R, a: 0.5, c: 0.25 },
      { w: G, a: 0.5, c: 0.5 },
      { w: B, a: 0.5, c: 0.75 },
    ],
    v: [
      { w: G, a: 0.5, c: 0.25 },
      { w: RB, a: 0.5, c: 0.75 },
    ],
  },
};

export function getLayoutAxes(layout) {
  const key = layout in LAYOUTS ? layout : "rgb";
  return LAYOUTS[key];
}

function sinc(x) {
  if (x === 0) return 1;
  return Math.sin(Math.PI * x) / (Math.PI * x);
}

/**
 * Display MTF at f cycles per pixel [10][11]
 * @param {SubpixelStrip[]} subs
 * @param {number} f
 */
export function mtf(subs, f) {
  let re = 0;
  let im = 0;
  let tw = 0;
  for (const s of subs) {
    const amp = s.w * sinc(s.a * f);
    const phase = 2 * Math.PI * f * (s.c - 0.5);
    re += amp * Math.cos(phase);
    im += amp * Math.sin(phase);
    tw += s.w;
  }
  if (tw === 0) return 0;
  return Math.hypot(re, im) / tw;
}

export function mtfNyquist(subs) {
  return mtf(subs, 0.5);
}
