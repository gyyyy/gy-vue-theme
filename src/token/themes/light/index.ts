/**
 * 亮色模式算法入口
 *
 * 组合所有共享算法函数，从种子令牌生成完整的亮色模式基础令牌。
 * 这是亮色模式的默认色彩派生函数（ColorDerivativeFunc）。
 */

import type { SeedToken } from '@/token/interface/seed';
import type { BaseToken } from '@/token/interface/base';
import type { ColorPalettes, PresetColorName } from '@/token/presetColors';
import { PRESET_COLOR_NAMES } from '@/token/presetColors';
import { generateLightPalette } from '../shared/genColorPalette';
import { genLightColorMap } from '../shared/genColorMap';
import { genFontMap } from '../shared/genFontMap';
import { genSizeMap } from '../shared/genSizeMap';
import { genStyleMap } from '../shared/genRadius';
import { genHeightMap } from '../shared/genHeight';
import { genCommonMap } from '../shared/genCommonMap';
import { genLightNeutralColors } from './colors';

/**
 * 生成预设颜色色板（亮色模式）
 *
 * 将 12 种预设颜色分别生成 10 级亮色色板，
 * 映射为 blue1~blue10, purple1~purple10 等令牌。
 *
 * @param seedToken - 种子令牌
 * @returns 预设颜色色板令牌
 */
function genPresetColorPalettes(seedToken: SeedToken): ColorPalettes {
  const palettes: Record<string, string> = {};

  for (const name of PRESET_COLOR_NAMES) {
    const color = seedToken[name as PresetColorName];
    const palette = generateLightPalette(color);

    for (let i = 0; i < 10; i++) {
      palettes[`${name}${i + 1}`] = palette[i];
    }
  }

  return palettes as ColorPalettes;
}

/**
 * 亮色模式色彩派生算法
 *
 * 从种子令牌生成完整的亮色模式基础令牌。
 * 是 ColorDerivativeFunc 的默认亮色实现。
 *
 * @param seedToken - 种子令牌
 * @returns 完整的基础令牌
 */
export function defaultLightAlgorithm(seedToken: SeedToken): BaseToken {
  const {
    colorBgBase,
    colorTextBase,
    fontSize,
    sizeUnit,
    sizeStep,
    borderRadius,
    lineWidth,
    controlHeight,
    motionBase,
    motionUnit,
  } = seedToken;

  // 1. 生成预设色板
  const presetPalettes = genPresetColorPalettes(seedToken);

  // 2. 生成功能色映射
  const colorMap = genLightColorMap(seedToken);

  // 3. 生成中性色
  const neutralColors = genLightNeutralColors(colorBgBase, colorTextBase);

  // 4. 生成字号映射
  const fontMap = genFontMap(fontSize);

  // 5. 生成尺寸映射
  const sizeMap = genSizeMap(sizeUnit, sizeStep);

  // 6. 生成圆角和线宽
  const styleMap = genStyleMap(borderRadius, lineWidth);

  // 7. 生成控件高度
  const heightMap = genHeightMap(controlHeight);

  // 8. 生成通用映射
  const commonMap = genCommonMap(motionBase, motionUnit);

  return {
    ...seedToken,
    ...presetPalettes,
    ...colorMap,
    ...neutralColors,
    ...fontMap,
    ...sizeMap,
    ...styleMap,
    ...heightMap,
    ...commonMap,
  } as BaseToken;
}
