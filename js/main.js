import { getState, setState, subscribe } from "./store.js";
import { computeAll } from "./physics/verdict.js";
import { mountRoomPlan, mountCutoffList, mountAcuityCard } from "./ui/cards.js";
import { mountMatrixChart } from "./ui/matrixChart.js";
import { mountAdvancedPanel } from "./ui/advancedPanel.js";
import { mountMethodology } from "./ui/methodology.js";

let computed = computeAll(getState());
let raf = 0;

function getResult() {
  return { state: getState(), computed };
}

function onChange(patch) {
  setState(patch);
}

function scheduleRender() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    computed = computeAll(getState());
    for (const fn of renders) fn();
  });
}

/** @type {Array<() => void>} */
const renders = [];

subscribe(() => scheduleRender());

const ctx = { getResult, onChange: (patch) => setState(patch) };

const room = mountRoomPlan(document.getElementById("room-plan"), ctx);
const matrix = mountMatrixChart(document.getElementById("matrix-chart"), ctx);
const cutoffs = mountCutoffList(document.getElementById("cutoff-card"), ctx);
const acuity = mountAcuityCard(document.getElementById("acuity-card"), ctx);
const advanced = mountAdvancedPanel(document.getElementById("advanced-panel"), ctx);

renders.push(
  () => room.render(),
  () => matrix.render(),
  () => cutoffs.render(),
  () => acuity.render(),
  () => advanced.render()
);

mountMethodology(document.getElementById("methodology-root"));

window.addEventListener("resize", () => scheduleRender());

const mobileLayoutMq = window.matchMedia("(max-width: 1023px)");
mobileLayoutMq.addEventListener("change", () => scheduleRender());

computed = computeAll(getState());
for (const fn of renders) fn();
