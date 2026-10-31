/** @typedef {{ value: number, ref: number[] }} Const */

/** @type {Const} */
export const INCH_TO_M = { value: 0.0254, ref: [] };

/** @type {Const} */
export const POPULATION_MU = { value: 3.6263, ref: [1, 2, 3] };

/** @type {Const} */
export const POPULATION_SIGMA = { value: 0.1309, ref: [1, 2, 3] };

/** @type {Const} */
export const Z_P95 = { value: 1.6448536269514722, ref: [1, 2] };

/** @type {Const} */
export const PPD_P5 = { value: 79.37, ref: [1, 2] };

/** @type {Const} */
export const PPD_P50 = { value: 95.37, ref: [1, 2] };

/** @type {Const} */
export const PPD_P95 = { value: 113.39, ref: [1, 2] };

/** @type {Const} */
export const LUMINANCE_CD_M2 = { value: 100, ref: [1, 4] };

/** @type {Const} */
export const CSF_NUMERATOR = { value: 5200, ref: [4] };

/** @type {Const} */
export const CSF_EXP_COEF = { value: 0.0016, ref: [4] };

/** @type {Const} */
export const CSF_LUM_TERM = { value: 0.08, ref: [4] };

/** @type {Const} */
export const CSF_X0_TERM = { value: 144, ref: [4] };

/** @type {Const} */
export const CSF_U_TERM = { value: 0.64, ref: [4] };

/** @type {Const} */
export const CSF_L_TERM = { value: 63, ref: [4] };

/** @type {Const} */
export const CSF_L_EXP = { value: 0.83, ref: [4] };

/** @type {Const} */
export const CSF_NEURAL_EXP = { value: 0.02, ref: [4] };

/** @type {Const} */
export const LUMA_R = { value: 0.2126, ref: [12] };

/** @type {Const} */
export const LUMA_G = { value: 0.7152, ref: [12] };

/** @type {Const} */
export const LUMA_B = { value: 0.0722, ref: [12] };

/** @type {Const} */
export const SQRI_INTEGRATION_N = { value: 600, ref: [5] };

/** @type {Const} */
export const K_REF_PPD = { value: 60, ref: [10] };

/** @type {Const} */
export const K_REF_X0 = { value: 30, ref: [10] };

/** @type {Const} */
export const P_VISIBLE_IMPOSSIBLE = { value: 0.05, ref: [1, 7] };

/** @type {Const} */
export const JND_BARELY = { value: 1, ref: [7] };

/** @type {Const} */
export const JND_SUBTLE = { value: 3, ref: [7] };

/** @type {Const} */
export const JND_NOTICEABLE = { value: 6, ref: [7] };

/** @type {Const} */
export const JND_LARGE = { value: 12, ref: [7] };

/** @type {Const} */
export const HYPERACUITY_ARCSEC = { value: 10, ref: [8, 9] };

/** @type {Const} */
export const HYPERACUITY_PPD = { value: 360, ref: [8, 9] };

/** @type {Const} */
export const GAUGE_ZONE_LOW = { value: 79.4, ref: [1, 2] };

/** @type {Const} */
export const GAUGE_ZONE_HIGH = { value: 113.4, ref: [1, 2] };

/** @type {Const} */
export const CLASSIC_2020_PPD = { value: 60, ref: [1] };

export const DIAGONAL_MIN_IN = 20;
export const DIAGONAL_MAX_IN = 130;
export const DISTANCE_MIN_M = 0.1524;
export const DISTANCE_MAX_M = 6.096;
