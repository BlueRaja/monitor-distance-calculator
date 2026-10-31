import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ppd, distanceForPpd, computePpdAxes, fieldOfViewAndX0 } from "../js/physics/geometry.js";
import { pVisible, ppdAtPercentile, ppdP95 } from "../js/physics/population.js";

describe("geometry", () => {
  it("ppd round-trip", () => {
    const pitch = 0.001;
    const d = 2;
    const P = ppd(pitch, d);
    const d2 = distanceForPpd(pitch, P);
    assert.ok(Math.abs(d2 - d) < 1e-9);
  });

  it("65in 16:9 8ft 4K center PPD", () => {
    const g = computePpdAxes(65, { w: 16, h: 9 }, 2.4384, 3840, 2160);
    assert.ok(Math.abs(g.ppdH - 113.569) < 0.02);
    assert.ok(Math.abs(g.X0 - 24.893) < 0.05);
  });
});

describe("population", () => {
  it("P95 ppd", () => {
    assert.ok(Math.abs(ppdP95() - 113.39) < 0.05);
  });

  it("pVisible decreases with PPD", () => {
    assert.ok(pVisible(30) > pVisible(100));
    assert.ok(pVisible(113.569) < 0.06);
  });
});
