/**
 * 预设颜色常量
 *
 * 定义系统内置的 12 种调色板基础色名称。
 * 每种颜色会通过色板生成算法产生 10 级色彩梯度。
 */

/** 预设颜色名称元组 */
export const PRESET_COLOR_NAMES = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'gold',
  'lime',
] as const;

/** 预设颜色名称类型 */
export type PresetColorName = typeof PRESET_COLOR_NAMES[number];

/** 预设颜色索引（1-10） */
export type PresetColorIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** 预设颜色带索引的键名类型，如 'blue1' | 'blue2' | ... | 'blue10' */
export type PresetColorKey = `${PresetColorName}${PresetColorIndex}`;

/**
 * 预设颜色色板类型
 *
 * 12 种颜色 × 10 级 = 120 个色板令牌
 */
export type ColorPalettes = {
  [Key in PresetColorKey]: string;
};
