import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { metersToFeet } from "../js/units.js";
import { computeAll, upgradeTier } from "../js/physics/verdict.js";

function slopeFtPerIn(row) {
  return row.slope / 12;
}

describe("matrix chart slope", () => {
  it("4K cutoff scales linearly with diagonal (not clamped at 20ft)", () => {
    const state65 = {
      diagonalIn: 65,
      distanceM: 2.4384,
      aspect: { w: 16, h: 9 },
      aspectKey: "16:9",
      layout: "rgb",
      customResolutions: [],
      selectedRowId: "2160",
      units: "imperial",
    };
    const { rows } = computeAll(state65);
    const r4k = rows.find((r) => r.resY === 2160);
    const slope = slopeFtPerIn(r4k);
    const yAt130 = slope * 130;
    assert.ok(yAt130 < 20, `expected <20ft at 130", got ${yAt130}`);
    assert.ok(yAt130 > 10, `expected sensible slope, got ${yAt130}`);
    const yAt65 = slope * 65;
    assert.ok(Math.abs(yAt65 - metersToFeet(r4k.cutoffM)) < 0.15);
  });
});

describe("upgrade vs population alignment", () => {
  it("76in 11.2ft 4K: impossible upgrade label when indistinguishable from perfect", () => {
    const state = {
      diagonalIn: 76,
      distanceM: 3.414528,
      aspect: { w: 16, h: 9 },
      aspectKey: "16:9",
      layout: "rgb",
      customResolutions: [],
      selectedRowId: "2160",
      units: "imperial",
    };
    const { rows, selected } = computeAll(state);
    const r4k = rows.find((r) => r.resY === 2160);
    assert.ok(r4k.pVisible < 0.05);
    assert.equal(r4k.upgradeLabel, "Impossible to tell");
    assert.equal(selected.id, r4k.id);
  });

  it("upgradeTier uses current row ppd", () => {
    assert.equal(
      upgradeTier(0.5, 100, 114),
      "Impossible to tell"
    );
    assert.equal(upgradeTier(5, 80, 90), "Noticable Difference");
  });
});
