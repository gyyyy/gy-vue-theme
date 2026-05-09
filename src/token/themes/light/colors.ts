/**
 * 亮色模式中性色生成
 *
 * 基于 colorTextBase 和 colorBgBase 生成中性色令牌。
 * 亮色模式下文本基于黑色 alpha 通道，背景基于白色亮度调节。
 */

import type { ColorMapToken } from '@/token/interface/base';
import { getAlphaColor, darken, lighten } from '@/util/color';

/**
 * 生成亮色模式下的中性色令牌
 *
 * @param baseBgColor - 背景基础色（默认 '#FFF'）
 * @param baseTextColor - 文本基础色（默认 '#000'）
 * @returns 中性色令牌子集
 */
export function genLightNeutralColors(baseBgColor: string = '#FFF', baseTextColor: string = '#000'): Partial<ColorMapToken> {
  const bgBase = baseBgColor || '#FFF';
  const textBase = baseTextColor || '#000';

  return {
    colorBgBase: bgBase,
    colorTextBase: textBase,

    // 背景色（基于 bgBase 的明度调节）
    colorBgContainer: darken(bgBase, 0),
    colorBgElevated: darken(bgBase, 0),
    colorBgLayout: darken(bgBase, 4),
    colorBgSpotlight: getAlphaColor(textBase, 0.85),
    colorBgBlur: 'transparent',
    colorBgMask: getAlphaColor('#000', 0.45),

    // 纯色背景（基于 textBase，用于反色/高对比场景）
    colorBgSolid: textBase,
    colorBgSolidHover: lighten(textBase, 20),
    colorBgSolidActive: lighten(textBase, 10),

    // 填充色（基于 textBase 的 alpha 通道）
    colorFill: getAlphaColor(textBase, 0.15),
    colorFillSecondary: getAlphaColor(textBase, 0.06),
    colorFillTertiary: getAlphaColor(textBase, 0.04),
    colorFillQuaternary: getAlphaColor(textBase, 0.02),

    // 文本色（基于 textBase 的 alpha 通道）
    colorText: getAlphaColor(textBase, 0.88),
    colorTextSecondary: getAlphaColor(textBase, 0.65),
    colorTextTertiary: getAlphaColor(textBase, 0.45),
    colorTextQuaternary: getAlphaColor(textBase, 0.25),

    // 边框色（基于 bgBase 的明度调节）
    colorBorder: darken(bgBase, 15),
    colorBorderSecondary: darken(bgBase, 6),
  };
}
