import { ASPECT_PRESETS, customResolutionId } from "../data/resolutions.js";
import { getLayoutK } from "../physics/sqri.js";
import { clearLayoutKCache } from "../physics/sqri.js";

const LAYOUT_LABELS = {
  rgb: "RGB stripe",
  bgr: "BGR stripe",
  pentile: "PenTile RGBG",
  woledRWBG: "WOLED RWBG",
  woledRGWB: "WOLED RGWB",
  qdoled: "QD-OLED triangle",
};

/**
 * @param {HTMLElement} root
 * @param {{ getResult: () => object, onChange: (p: object) => void }} ctx
 */
export function mountAdvancedPanel(root, ctx) {
  root.innerHTML = `
    <details class="advanced-panel">
      <summary>Advanced display options</summary>
      <div class="advanced-body">
        <label class="field">
          <span>Units</span>
          <select id="units-select">
            <option value="imperial">Imperial (ft, in)</option>
            <option value="metric">Metric (m, cm)</option>
          </select>
        </label>
        <label class="field">
          <span>Aspect ratio</span>
          <select id="aspect-select">
            <option value="16:9">16:9</option>
            <option value="16:10">16:10</option>
            <option value="21:9">21:9</option>
            <option value="32:9">32:9</option>
            <option value="4:3">4:3</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <div id="custom-aspect" class="custom-aspect hidden">
          <input type="number" id="aspect-w" min="1" value="16" /> :
          <input type="number" id="aspect-h" min="1" value="9" />
        </div>
        <label class="field">
          <span>Subpixel layout</span>
          <select id="layout-select">
            <option value="rgb">RGB stripe</option>
            <option value="bgr">BGR stripe</option>
            <option value="pentile">PenTile RGBG</option>
            <option value="woledRWBG">WOLED RWBG</option>
            <option value="woledRGWB">WOLED RGWB</option>
            <option value="qdoled">QD-OLED triangle</option>
          </select>
        </label>
        <p id="layout-k-note" class="muted small"></p>
        <label class="field">
          <span>Custom resolution (optional)</span>
          <div class="custom-res">
            <input type="number" id="custom-x" min="1" placeholder="W" />
            ×
            <input type="number" id="custom-y" min="1" placeholder="H" />
            <button type="button" id="custom-add">Add</button>
          </div>
        </label>
        <p id="pixel-shape-warn" class="warn hidden"></p>
      </div>
    </details>
  `;

  const aspectSelect = root.querySelector("#aspect-select");
  const unitsSelect = root.querySelector("#units-select");
  const layoutSelect = root.querySelector("#layout-select");
  const layoutNote = root.querySelector("#layout-k-note");
  const customAspect = root.querySelector("#custom-aspect");
  const aspectW = root.querySelector("#aspect-w");
  const aspectH = root.querySelector("#aspect-h");
  const customX = root.querySelector("#custom-x");
  const customY = root.querySelector("#custom-y");
  const customAdd = root.querySelector("#custom-add");
  const pixelWarn = root.querySelector("#pixel-shape-warn");

  function applyAspect(key) {
    if (key === "custom") {
      customAspect.classList.remove("hidden");
      const w = Number(aspectW.value) || 16;
      const h = Number(aspectH.value) || 9;
      ctx.onChange({ aspectKey: "custom", aspect: { w, h } });
      return;
    }
    customAspect.classList.add("hidden");
    const preset = ASPECT_PRESETS[key];
    ctx.onChange({ aspectKey: key, aspect: { w: preset.aw, h: preset.ah } });
  }

  aspectSelect.addEventListener("change", () => applyAspect(aspectSelect.value));
  unitsSelect.addEventListener("change", () => {
    ctx.onChange({ units: unitsSelect.value });
  });
  aspectW.addEventListener("change", () => applyAspect("custom"));
  aspectH.addEventListener("change", () => applyAspect("custom"));

  layoutSelect.addEventListener("change", () => {
    clearLayoutKCache();
    ctx.onChange({ layout: layoutSelect.value });
  });

  customAdd.addEventListener("click", () => {
    const x = Number(customX.value);
    const y = Number(customY.value);
    if (x <= 0 || y <= 0) return;
    const { state } = ctx.getResult();
    const id = customResolutionId(x, y);
    const existing = state.customResolutions || [];
    if (existing.some((r) => customResolutionId(r.x, r.y) === id)) {
      ctx.onChange({ selectedRowId: id });
      return;
    }
    ctx.onChange({
      customResolutions: [...existing, { x: Math.round(x), y: Math.round(y) }],
      selectedRowId: id,
    });
    customX.value = "";
    customY.value = "";
  });

  function render() {
    const { state, computed } = ctx.getResult();
    unitsSelect.value = state.units === "metric" ? "metric" : "imperial";
    aspectSelect.value =
      state.aspectKey === "custom" ? "custom" : state.aspectKey || "16:9";
    layoutSelect.value = state.layout;
    if (state.aspectKey === "custom") {
      customAspect.classList.remove("hidden");
      aspectW.value = String(state.aspect.w);
      aspectH.value = String(state.aspect.h);
    } else {
      customAspect.classList.add("hidden");
    }
    const { kH, kV } = getLayoutK(state.layout);
    const k = Math.min(kH, kV);
    layoutNote.textContent = `${LAYOUT_LABELS[state.layout] || state.layout}: effective PPD ×${k.toFixed(2)} (min of H/V). Measured layout differences are often small.`;

    const customSel = (state.customResolutions || []).find(
      (r) => customResolutionId(r.x, r.y) === state.selectedRowId
    );
    if (customSel) {
      const sel = computed.selected;
      const ar = state.aspect.w / state.aspect.h;
      const par = customSel.x / customSel.y;
      if (Math.abs(ar - par) > 0.02 && sel) {
        pixelWarn.textContent = `Non-square pixels: horizontal ${sel.ppdH.toFixed(1)} PPD, vertical ${sel.ppdV.toFixed(1)} PPD`;
        pixelWarn.classList.remove("hidden");
      } else {
        pixelWarn.classList.add("hidden");
      }
    } else {
      pixelWarn.classList.add("hidden");
    }
  }

  return { render };
}
