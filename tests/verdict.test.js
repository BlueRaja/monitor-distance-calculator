import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mtfNyquist, getLayoutAxes } from "../js/physics/mtf.js";
import { getLayoutK, clearLayoutKCache, sqriTotal } from "../js/physics/sqri.js";
import { computeAll } from "../js/physics/verdict.js";
import { pVisible } from "../js/physics/population.js";

describe("mtf Nyquist fixtures", () => {
  it("RGB horizontal", () => {
    const { h } = getLayoutAxes("rgb");
    assert.ok(Math.abs(mtfNyquist(h) - 0.8271) < 0.002);
  });

  it("RGB vertical full aperture", () => {
    const { v } = getLayoutAxes("rgb");
    assert.ok(Math.abs(mtfNyquist(v) - 0.6366) < 0.002);
  });

  it("PenTile horizontal", () => {
    const { h } = getLayoutAxes("pentile");
    assert.ok(Math.abs(mtfNyquist(h) - 0.6931) < 0.002);
  });
});

describe("layout k factors", () => {
  it("pentile kH approx 0.93", () => {
    clearLayoutKCache();
    const { kH } = getLayoutK("pentile");
    assert.ok(Math.abs(kH - 0.933) < 0.02);
    assert.ok(kH <= 1);
  });
});

describe("verdict fixtures 65in 8ft", () => {
  const state = {
    diagonalIn: 65,
    distanceM: 2.4384,
    aspect: { w: 16, h: 9 },
    aspectKey: "16:9",
    layout: "rgb",
    customResolutions: [],
    selectedRowId: "2160",
    units: "imperial",
  };

  it("720p baseline", () => {
    const { rows } = computeAll(state);
    const r720 = rows.find((r) => r.resY === 720);
    assert.ok(r720);
    assert.equal(r720.upgradeLabel, "Baseline");
    assert.ok(Math.abs(r720.ppdEff - 37.856) < 0.02);
    assert.ok(Math.abs(r720.J - 150.903) < 0.15);
    assert.ok(Math.abs(r720.cutoffM - 7.3036) < 0.02);
  });

  it("1080p noticeable upgrade", () => {
    const { rows } = computeAll(state);
    const r = rows.find((r) => r.resY === 1080);
    assert.equal(r.upgradeLabel, "Noticable Difference");
    assert.ok(Math.abs(r.deltaJ - 5.488) < 0.15);
  });

  it("4K pVisible and upgrade label at population limit", () => {
    const { rows } = computeAll(state);
    const r = rows.find((r) => r.resY === 2160);
    assert.ok(Math.abs(r.ppdEff - 113.569) < 0.02);
    assert.ok(Math.abs(r.pVisible - 0.0484) < 0.01);
    assert.ok(Math.abs(r.deltaJ - 1.251) < 0.15);
    assert.equal(r.upgradeLabel, "Impossible to tell");
  });

  it("5K impossible despite small dJ", () => {
    const { rows } = computeAll(state);
    const r4k = rows.find((r) => r.resY === 2160);
    const r5k = rows.find((r) => r.resY === 2880);
    assert.equal(r5k.upgradeLabel, "Impossible to tell");
    assert.ok(r5k.deltaJ < 1);
    assert.ok(pVisible(r4k.ppdEff) < 0.05 || r4k.pVisible < 0.05);
  });
});

describe("verdict fixtures 27in 2ft", () => {
  const state = {
    diagonalIn: 27,
    distanceM: 0.6096,
    aspect: { w: 16, h: 9 },
    aspectKey: "16:9",
    layout: "rgb",
    customResolutions: [],
    selectedRowId: "1080",
    units: "imperial",
  };

  it("1080p large upgrade from 720p", () => {
    const { rows } = computeAll(state);
    const r720 = rows.find((r) => r.resY === 720);
    const r1080 = rows.find((r) => r.resY === 1080);
    assert.equal(r720.upgradeLabel, "Baseline");
    assert.equal(r1080.upgradeLabel, "Very Noticable Difference");
    assert.ok(Math.abs(r1080.deltaJ - 8.988) < 0.2);
    const r1440 = rows.find((r) => r.resY === 1440);
    assert.equal(r1440.upgradeLabel, "Noticable Difference");
  });
});

describe("monotonicity", () => {
  it("J increases with resolution at fixed distance", () => {
    const state = {
      diagonalIn: 65,
      distanceM: 2.4384,
      aspect: { w: 16, h: 9 },
      aspectKey: "16:9",
      layout: "rgb",
      customResolutions: [],
      selectedRowId: "2160",
      units: "imperial",
    };
    const { rows } = computeAll(state);
    for (let i = 1; i < rows.length; i++) {
      assert.ok(rows[i].J >= rows[i - 1].J - 1e-6);
    }
  });
});
