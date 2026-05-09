/**
 * 颜色色板生成算法
 *
 * 基于 HSV 色彩空间的 10 级色板生成。
 * 使用 @ctrl/tinycolor 作为底层颜色操作库。
 *
 * 色板生成思路：
 * 1. 取输入色的 HSV 值
 * 2. 以输入色为第 6 级（索引 5），向亮色方向生成 5 级，向暗色方向生成 4 级
 * 3. 亮色方向：色相向暖色偏移，饱和度降低，明度升高
 * 4. 暗色方向：色相向冷色偏移，饱和度升高，明度降低
 */

import { TinyColor } from '@ctrl/tinycolor';
import { mixColors } from '@/util/color';

// ============================================================
// 色板生成常量
// ============================================================

/** 色相步长（每级偏移的度数） */
const HUE_STEP = 2;

/** 饱和度步长（亮色方向，每级降低） */
const SATURATION_STEP = 0.16;

/** 饱和度步长（暗色方向，每级升高） */
const SATURATION_STEP_2 = 0.05;

/** 明度步长（亮色方向，每级升高） */
const BRIGHTNESS_STEP_1 = 0.05;

/** 明度步长（暗色方向，每级降低） */
const BRIGHTNESS_STEP_2 = 0.15;

/** 亮色方向的级数（索引 0~4，共 5 级） */
const LIGHT_COLOR_COUNT = 5;

/** 暗色方向的级数（索引 6~9，共 4 级） */
const DARK_COLOR_COUNT = 4;

/**
 * 暗色模式色板映射表
 *
 * 暗色模式下，将亮色色板与背景色混合。
 * 键为色板索引（1-10），值为混合比例。
 */
const DARK_COLOR_MAP: { index: number; opacity: number }[] = [
  { index: 7, opacity: 15 },
  { index: 6, opacity: 25 },
  { index: 5, opacity: 30 },
  { index: 5, opacity: 45 },
  { index: 5, opacity: 65 },
  { index: 5, opacity: 85 },
  { index: 4, opacity: 90 },
  { index: 3, opacity: 95 },
  { index: 2, opacity: 93 },
  { index: 1, opacity: 88 },
];

// ============================================================
// HSV 分量计算
// ============================================================

/**
 * 计算指定索引的色相值
 *
 * 亮色方向：色相向暖色偏移（H 增大方向）
 * 暗色方向：色相向冷色偏移（H 减小方向）
 *
 * @param hsv - HSV 对象（h: 0-360, s: 0-1, v: 0-1）
 * @param step - 距基准色的步数（正数 = 亮色方向，负数 = 暗色方向）
 * @param isLight - 是否为亮色方向
 * @returns 调整后的色相值（0-360）
 */
function getHue(hsv: { h: number; s: number; v: number }, step: number, isLight: boolean): number {
  let hue: number;

  if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
    // 冷色系（60-240°）：亮色方向色相减小（偏暖），暗色方向色相增大（偏冷）
    hue = isLight ? Math.round(hsv.h) - HUE_STEP * step : Math.round(hsv.h) + HUE_STEP * step;
  } else {
    // 暖色系（0-60° 或 240-360°）：亮色方向色相增大，暗色方向色相减小
    hue = isLight ? Math.round(hsv.h) + HUE_STEP * step : Math.round(hsv.h) - HUE_STEP * step;
  }

  // 确保在 0-360 范围内
  if (hue < 0) {
    hue += 360;
  } else if (hue >= 360) {
    hue -= 360;
  }

  return hue;
}

/**
 * 计算指定索引的饱和度
 *
 * @param hsv - HSV 对象
 * @param step - 距基准色的步数
 * @param isLight - 是否为亮色方向
 * @returns 调整后的饱和度（0-100，百分比格式）
 */
function getSaturation(hsv: { h: number; s: number; v: number }, step: number, isLight: boolean): number {
  // 灰色（饱和度为 0）不调整饱和度
  if (hsv.h === 0 && hsv.s === 0) {
    return hsv.s;
  }

  let saturation: number;

  if (isLight) {
    saturation = hsv.s * 100 - SATURATION_STEP * 100 * step;
  } else {
    saturation = hsv.s * 100 + SATURATION_STEP_2 * 100 * step;
  }

  // 亮色方向第 2 级（i=6 时 index=1）饱和度下限为 6
  if (isLight && step === LIGHT_COLOR_COUNT && saturation > 10) {
    saturation = 10;
  }

  if (saturation < 6) {
    saturation = 6;
  }
  if (saturation > 100) {
    saturation = 100;
  }

  return Math.round(saturation);
}

/**
 * 计算指定索引的明度
 *
 * @param hsv - HSV 对象
 * @param step - 距基准色的步数
 * @param isLight - 是否为亮色方向
 * @returns 调整后的明度（0-100，百分比格式）
 */
function getValue(hsv: { h: number; s: number; v: number }, step: number, isLight: boolean): number {
  let value: number;

  if (isLight) {
    value = hsv.v * 100 + BRIGHTNESS_STEP_1 * 100 * step;
  } else {
    value = hsv.v * 100 - BRIGHTNESS_STEP_2 * 100 * step;
  }

  if (value > 100) {
    value = 100;
  }

  return Math.round(value);
}

// ============================================================
// 色板生成
// ============================================================

/**
 * 生成 10 级颜色色板（亮色模式）
 *
 * 以输入色为第 6 级（索引 5），向两个方向扩展：
 * - 索引 0~4：越来越亮（背景色方向）
 * - 索引 5：基准色
 * - 索引 6~9：越来越暗（强调色方向）
 *
 * @param baseColor - 基础色（任意合法颜色格式）
 * @returns 10 个颜色字符串的数组
 */
export function generateLightPalette(baseColor: string): string[] {
  const hsv = new TinyColor(baseColor).toHsv();
  const palette: string[] = [];

  for (let i = LIGHT_COLOR_COUNT; i > 0; i--) {
    const h = getHue(hsv, i, true);
    const s = getSaturation(hsv, i, true);
    const v = getValue(hsv, i, true);
    palette.push(new TinyColor({ h, s: s / 100, v: v / 100 }).toHexString());
  }

  // 第 6 级为基准色本身
  palette.push(new TinyColor(baseColor).toHexString());

  for (let i = 1; i <= DARK_COLOR_COUNT; i++) {
    const h = getHue(hsv, i, false);
    const s = getSaturation(hsv, i, false);
    const v = getValue(hsv, i, false);
    palette.push(new TinyColor({ h, s: s / 100, v: v / 100 }).toHexString());
  }

  return palette;
}

/**
 * 生成 10 级颜色色板（暗色模式）
 *
 * 暗色模式下，先生成亮色色板，然后将每个颜色与暗色背景混合，
 * 产生适合在深色背景上使用的色板。
 *
 * @param baseColor - 基础色
 * @param bgColor - 暗色背景色（默认 '#141414'）
 * @returns 10 个颜色字符串的数组
 */
export function generateDarkPalette(baseColor: string, bgColor: string = '#141414'): string[] {
  const lightPalette = generateLightPalette(baseColor);
  const darkPalette: string[] = [];
  const bgBase = bgColor || '#141414';

  for (let i = 0; i < DARK_COLOR_MAP.length; i++) {
    const { index, opacity } = DARK_COLOR_MAP[i];
    darkPalette.push(mixColors(bgBase, lightPalette[index - 1], opacity));
  }

  return darkPalette;
}
