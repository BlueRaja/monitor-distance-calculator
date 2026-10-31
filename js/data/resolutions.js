/** Height-class labels by vertical pixel count */
const HEIGHT_LABEL = {
  720: "720p",
  800: "800p",
  1080: "1080p",
  1200: "1200p",
  1440: "1440p",
  1600: "1600p",
  2160: "4K",
  2400: "5K",
  2880: "5K",
  3200: "5K",
  4320: "8K",
  4800: "8K",
};

/**
 * @param {number} x
 * @param {number} y
 */
export function customResolutionId(x, y) {
  return `custom-${x}x${y}`;
}

/**
 * @param {number} x
 * @param {number} y
 */
export function customResolutionLabel(x, y) {
  return `${x}×${y}`;
}

export function labelForHeight(h) {
  if (HEIGHT_LABEL[h]) return HEIGHT_LABEL[h];
  if (h >= 4000) return "8K";
  if (h >= 2800) return "5K";
  if (h >= 2000) return "4K";
  if (h >= 1300) return "1440p";
  if (h >= 1000) return "1080p";
  return `${h}p`;
}

/** @type {Record<string, { key: string, w: number, h: number }[]>} */
export const ASPECT_PRESETS = {
  "16:9": { aw: 16, ah: 9 },
  "16:10": { aw: 16, ah: 10 },
  "21:9": { aw: 43, ah: 18 },
  "32:9": { aw: 32, ah: 9 },
  "4:3": { aw: 4, ah: 3 },
};

const STANDARD_HEIGHTS = [720, 1080, 1440, 2160, 2880, 4320];

/**
 * @param {{ w: number, h: number }} aspect
 */
export function resolutionsForAspect(aspect) {
  return STANDARD_HEIGHTS.map((h) => {
    const w = Math.round((h * aspect.w) / aspect.h);
    return {
      id: String(h),
      label: labelForHeight(h),
      resX: w,
      resY: h,
    };
  });
}

/** 16:10 uses different heights */
export function resolutionsForAspectKey(aspectKey) {
  if (aspectKey === "16:10") {
    const heights = [800, 1200, 1600, 2400, 3200, 4800];
    const aspect = { w: 16, h: 10 };
    return heights.map((h) => {
      const w = Math.round((h * aspect.w) / aspect.h);
      return { id: String(h), label: labelForHeight(h), resX: w, resY: h };
    });
  }
  if (aspectKey === "21:9") {
    const list = [
      [2560, 1080],
      [3440, 1440],
      [5120, 2160],
      [6880, 2880],
      [7680, 4320],
      [10240, 4320],
    ];
    return list.map(([w, h]) => ({
      id: String(h),
      label: labelForHeight(h),
      resX: w,
      resY: h,
    }));
  }
  if (aspectKey === "32:9") {
    const list = [
      [3840, 1080],
      [5120, 1440],
      [7680, 2160],
      [10240, 2880],
      [15360, 4320],
    ];
    return list.map(([w, h]) => ({
      id: String(h),
      label: labelForHeight(h),
      resX: w,
      resY: h,
    }));
  }
  if (aspectKey === "4:3") {
    const list = [
      [960, 720],
      [1440, 1080],
      [1920, 1440],
      [2880, 2160],
      [3840, 2880],
      [5760, 4320],
    ];
    return list.map(([w, h]) => ({
      id: String(h),
      label: labelForHeight(h),
      resX: w,
      resY: h,
    }));
  }
  return resolutionsForAspect({ w: 16, h: 9 });
}
