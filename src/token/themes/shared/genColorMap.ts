/**
 * 功能色映射生成
 *
 * 将 10 级色板映射为功能色语义令牌（Bg/Border/Hover/Active/Text 等）。
 */

import type { SeedToken } from '@/token/interface/seed';
import type { ColorMapToken, FunctionalColorPalettes } from '@/token/interface/base';
import { generateLightPalette, generateDarkPalette } from './genColorPalette';

/**
 * 功能色名称与种子令牌键的映射关系
 */
const FUNCTIONAL_COLORS = [
  'Primary',
  'Success',
  'Warning',
  'Error',
  'Info',
] as const;

/**
 * 生成亮色模式下所有功能色的语义令牌
 *
 * 亮色模式色板索引映射：
 * - [0] → Bg（最浅背景）
 * - [1] → BgHover
 * - [2] → Border
 * - [3] → BorderHover
 * - [4] → Hover
 * - [5] → 主色
 * - [6] → Active
 * - [4] → TextHover（复用）
 * - [5] → Text（复用）
 * - [6] → TextActive（复用）
 *
 * @param seedToken - 种子令牌
 * @returns 功能色映射令牌
 */
export function genLightColorMap(seedToken: SeedToken): Partial<ColorMapToken & FunctionalColorPalettes> {
  const colors: Record<string, string> = {};

  for (const name of FUNCTIONAL_COLORS) {
    const key = `color${name}` as keyof SeedToken;
    const color = seedToken[key] as string;
    const palette = generateLightPalette(color);
    colors[`color${name}Bg`] = palette[0];
    colors[`color${name}BgHover`] = palette[1];
    colors[`color${name}Border`] = palette[2];
    colors[`color${name}BorderHover`] = palette[3];
    colors[`color${name}Hover`] = palette[4];
    colors[`color${name}`] = palette[5];
    colors[`color${name}Active`] = palette[6];
    colors[`color${name}TextHover`] = palette[4];
    colors[`color${name}Text`] = palette[5];
    colors[`color${name}TextActive`] = palette[6];
    // 原始色板（语义索引：light 数字越大越亮，dark 数字越大越暗）
    for (let i = 1; i <= 5; i++) {
      colors[`color${name}Light${i}`] = palette[5 - i]; // light1=palette[4], light5=palette[0]
    }
    for (let i = 1; i <= 4; i++) {
      colors[`color${name}Dark${i}`] = palette[5 + i]; // dark1=palette[6], dark4=palette[9]
    }
  }

  // Link 色特殊处理：使用 colorLinkBase 或回退到 colorInfo
  const linkBase = seedToken.colorLinkBase || seedToken.colorInfo;
  const linkPalette = generateLightPalette(linkBase);
  colors.colorLink = linkPalette[5];
  colors.colorLinkHover = linkPalette[4];
  colors.colorLinkActive = linkPalette[6];
  for (let i = 1; i <= 5; i++) {
    colors[`colorLinkLight${i}`] = linkPalette[5 - i];
  }
  for (let i = 1; i <= 4; i++) {
    colors[`colorLinkDark${i}`] = linkPalette[5 + i];
  }

  return colors as Partial<ColorMapToken & FunctionalColorPalettes>;
}

/**
 * 生成暗色模式下所有功能色的语义令牌
 *
 * 暗色模式下使用暗色色板生成算法，且悬停/激活的索引映射有变化：
 * - Hover 使用 [6]（而非亮色的 [4]）
 * - Active 使用 [4]（而非亮色的 [6]）
 *
 * 主色（color${name}）及其文本色（color${name}Text）默认直接沿用种子令牌原值（shiftPrimaryColor=false），
 * 保证品牌色在亮/暗模式下保持一致；传入 shiftPrimaryColor=true 时改为使用色板 [5]，跟随暗色环境偏移。
 *
 * @param seedToken - 种子令牌
 * @param bgColor - 暗色背景色（默认 '#141414'）
 * @param shiftPrimaryColor - 是否让主色（colorPrimary 等）跟随暗色色板偏移，默认 false（保持品牌色不变）
 * @returns 功能色映射令牌
 */
export function genDarkColorMap(seedToken: SeedToken, bgColor: string = '#141414', shiftPrimaryColor: boolean = false): Partial<ColorMapToken & FunctionalColorPalettes> {
  const colors: Record<string, string> = {};
  const bgBase = bgColor || '#141414';
  
  for (const name of FUNCTIONAL_COLORS) {
    const key = `color${name}` as keyof SeedToken;
    const color = seedToken[key] as string;
    const palette = generateDarkPalette(color, bgBase);
    
    colors[`color${name}Bg`] = palette[0];
    colors[`color${name}BgHover`] = palette[1];
    colors[`color${name}Border`] = palette[2];
    colors[`color${name}BorderHover`] = palette[3];
    // 暗色模式：Hover 和 Active 交换方向
    colors[`color${name}Hover`] = palette[6];
    // shiftPrimaryColor=false 时主色保持种子令牌原值，保证品牌识别度
    colors[`color${name}`] = shiftPrimaryColor ? palette[5] : color;
    colors[`color${name}Active`] = palette[4];
    colors[`color${name}TextHover`] = palette[6];
    colors[`color${name}Text`] = shiftPrimaryColor ? palette[5] : color;
    colors[`color${name}TextActive`] = palette[4];
    // 原始色板（语义索引：light 数字越大越亮，dark 数字越大越暗）
    for (let i = 1; i <= 5; i++) {
      colors[`color${name}Light${i}`] = palette[5 - i];
    }
    for (let i = 1; i <= 4; i++) {
      colors[`color${name}Dark${i}`] = palette[5 + i];
    }
  }

  // Link 色特殊处理
  const linkBase = seedToken.colorLinkBase || seedToken.colorInfo;
  const linkPalette = generateDarkPalette(linkBase, bgBase);
  colors.colorLinkHover = linkPalette[6];
  colors.colorLink = shiftPrimaryColor ? linkPalette[5] : linkBase;
  colors.colorLinkActive = linkPalette[4];
  for (let i = 1; i <= 5; i++) {
    colors[`colorLinkLight${i}`] = linkPalette[5 - i];
  }
  for (let i = 1; i <= 4; i++) {
    colors[`colorLinkDark${i}`] = linkPalette[5 + i];
  }

  return colors as Partial<ColorMapToken & FunctionalColorPalettes>;
}
