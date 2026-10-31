/** @typedef {{ id: number, citation: string, url: string, usedFor: string[] }} Reference */

/** @type {Reference[]} */
export const REFERENCES = [
  {
    id: 1,
    citation:
      'Ashraf, Chapiro, Mantiuk (2025), "Resolution limit of the eye — how many pixels can we see?", Nature Communications.',
    url: "https://doi.org/10.1038/s41467-025-64679-2",
    usedFor: [
      "Foveal resolution limits and PPD/cpd conversion",
      "Population model (Supplementary 4.4)",
      "100 cd/m², binocular viewing, text vs gratings",
      "Critique of ITU viewing distances",
    ],
  },
  {
    id: 2,
    citation:
      'Mantiuk, "Display resolution calculator", University of Cambridge.',
    url: "https://www.cl.cam.ac.uk/research/rainbow/projects/display_calc/",
    usedFor: ["μ and σ in cube-root cpd space", "Center PPD formula"],
  },
  {
    id: 3,
    citation: "gfxdisp/resolution_limit (GitHub).",
    url: "https://github.com/gfxdisp/resolution_limit",
    usedFor: ["Cross-check of population model parameters"],
  },
  {
    id: 4,
    citation:
      'Barten (2003), "Formula for the contrast sensitivity of the human eye", Proc. SPIE 5294, pp. 231–238.',
    url: "https://doi.org/10.1117/12.537476",
    usedFor: ["Simplified CSF, Eq. (11), p. 234"],
  },
  {
    id: 5,
    citation:
      'Barten (1990), "Evaluation of subjective image quality with the square-root integral method", JOSA A 7(10):2024–2031.',
    url: "https://doi.org/10.1364/JOSAA.7.002024",
    usedFor: ["SQRI definition and 1/ln2 JND normalization"],
  },
  {
    id: 6,
    citation:
      "Barten (1999), Contrast Sensitivity of the Human Eye and Its Effects on Image Quality, SPIE Press.",
    url: "https://doi.org/10.1117/3.353254",
    usedFor: ["Background on CSF and SQRI"],
  },
  {
    id: 7,
    citation:
      "ISO 20462-1:2005, Photography — Psychophysical experimental methods for estimating image quality — Part 1.",
    url: "https://www.iso.org/standard/38330.html",
    usedFor: ["JND thresholds for upgrade tier labels"],
  },
  {
    id: 8,
    citation:
      'Westheimer & McKee (1977), "Spatial frequency and light-spread descriptions of visual acuity and hyperacuity", JOSA 67(2):207.',
    url: "https://doi.org/10.1364/JOSA.67.000207",
    usedFor: ["Hyperacuity vs acuity thresholds"],
  },
  {
    id: 9,
    citation:
      'Fendick & Swindale (1994), "Vernier acuity for edges defined by flicker", Vision Research 34(20).',
    url: "https://doi.org/10.1016/0042-6989(94)90228-3",
    usedFor: ["10 arcsec hyperacuity basis for untrained observers"],
  },
  {
    id: 10,
    citation:
      "Ando et al. (2022), Effects of Display MTF with Different Subpixel Layouts, CVCS 2022, CEUR-WS Vol. 3271, Paper 10.",
    url: "https://ceur-ws.org/Vol-3271/Paper10_CVCS2022.pdf",
    usedFor: ["Subpixel MTF and subjective resolution", "Layout k factor method"],
  },
  {
    id: 11,
    citation:
      "Masaoka (2020), Line-based MTF measurement of pixelated displays, IEEE Access.",
    url: "https://doi.org/10.1109/ACCESS.2020.3033756",
    usedFor: ["MTF from line spread function"],
  },
  {
    id: 12,
    citation: "ITU-R BT.709-6.",
    url: "https://www.itu.int/rec/R-REC-BT.709",
    usedFor: ["BT.709 luma weights for subpixels"],
  },
  {
    id: 13,
    citation: "ITU-R BT.2100-3 (2025).",
    url: "https://www.itu.int/rec/R-REC-BT.2100",
    usedFor: ["Square pixels; ITU viewing distance notes in methodology"],
  },
  {
    id: 14,
    citation:
      "Elliott et al. (2003), PenTile Matrix subpixel architecture, J. SID.",
    url: "https://doi.org/10.1889/1.1831725",
    usedFor: ["PenTile RGBG layout"],
  },
  {
    id: 15,
    citation: "PC Monitors, QD-OLED and WOLED Fringing Issues.",
    url: "https://pcmonitors.info/articles/qd-oled-and-woled-fringing-issues/",
    usedFor: ["WOLED and QD-OLED subpixel orders"],
  },
  {
    id: 16,
    citation: "Omdia, Display Dynamics – September 2024.",
    url: "https://omdia.tech.informa.com/",
    usedFor: ["WOLED RWBG to RGWB transition"],
  },
  {
    id: 17,
    citation: "Abramowitz & Stegun, Handbook of Mathematical Functions, formula 7.1.26.",
    url: "https://dlmf.nist.gov/7.12",
    usedFor: ["erf approximation for normal CDF"],
  },
];
