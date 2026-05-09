/**
 * 暗色模式算法入口
 *
 * 组合所有共享算法函数，从种子令牌生成完整的暗色模式基础令牌。
 * 这是暗色模式的默认色彩派生函数（ColorDerivativeFunc）。
 */

import type { SeedToken } from '@/token/interface/seed';
import type { BaseToken } from '@/token/interface/base';
import type { ColorPalettes, PresetColorName } from '@/token/presetColors';
import { PRESET_COLOR_NAMES } from '@/token/presetColors';
import { generateDarkPalette } from '../shared/genColorPalette';
import { genDarkColorMap } from '../shared/genColorMap';
import { genFontMap } from '../shared/genFontMap';
import { genSizeMap } from '../shared/genSizeMap';
import { genStyleMap } from '../shared/genRadius';
import { genHeightMap } from '../shared/genHeight';
import { genCommonMap } from '../shared/genCommonMap';
import { genDarkNeutralColors } from './colors';

/**
 * 生成预设颜色色板（暗色模式）
 *
 * @param seedToken - 种子令牌
 * @param bgColor - 暗色背景色（默认 '#141414'）
 * @returns 预设颜色色板令牌
 */
function genPresetColorPalettes(seedToken: SeedToken, bgColor: string = '#141414'): ColorPalettes {
  const palettes: Record<string, string> = {};
  const bgBase = bgColor || '#141414';
  
  for (const name of PRESET_COLOR_NAMES) {
    const color = seedToken[name as PresetColorName];
    const palette = generateDarkPalette(color, bgBase);

    for (let i = 0; i < 10; i++) {
      palettes[`${name}${i + 1}`] = palette[i];
    }
  }

  return palettes as ColorPalettes;
}

/**
 * 暗色模式色彩派生算法
 *
 * 从种子令牌生成完整的暗色模式基础令牌。
 * 是 ColorDerivativeFunc 的默认暗色实现。
 *
 * @param seedToken - 种子令牌
 * @returns 完整的基础令牌
 */
export function defaultDarkAlgorithm(seedToken: SeedToken): BaseToken {
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

  // 1. 生成预设色板（暗色）
  const presetPalettes = genPresetColorPalettes(seedToken, colorBgBase);

  // 2. 生成功能色映射（暗色）
  const colorMap = genDarkColorMap(seedToken, colorBgBase, false);

  // 3. 生成中性色（暗色）
  const neutralColors = genDarkNeutralColors(colorBgBase, colorTextBase);

  // 4. 生成字号映射（与亮色模式相同）
  const fontMap = genFontMap(fontSize);

  // 5. 生成尺寸映射（与亮色模式相同）
  const sizeMap = genSizeMap(sizeUnit, sizeStep);

  // 6. 生成圆角和线宽（与亮色模式相同）
  const styleMap = genStyleMap(borderRadius, lineWidth);

  // 7. 生成控件高度（与亮色模式相同）
  const heightMap = genHeightMap(controlHeight);

  // 8. 生成通用映射（与亮色模式相同）
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
