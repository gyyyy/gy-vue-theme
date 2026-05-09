/**
 * 暗色模式中性色生成
 *
 * 暗色模式下文本基于白色 alpha 通道，背景基于黑色亮度调节。
 * alpha 值和背景层次与亮色模式不同。
 */

import type { ColorMapToken } from '@/token/interface/base';
import { getAlphaColor, lighten, darken } from '@/util/color';

/**
 * 生成暗色模式下的中性色令牌
 *
 * @param baseBgColor - 背景基础色（默认 '#141414'）
 * @param baseTextColor - 文本基础色（默认 '#FFF'）
 * @returns 中性色令牌子集
 */
export function genDarkNeutralColors(baseBgColor: string = '#141414', baseTextColor: string = '#FFF'): Partial<ColorMapToken> {
  const bgBase = baseBgColor || '#141414';
  const textBase = baseTextColor || '#FFF';

  return {
    colorBgBase: bgBase,
    colorTextBase: textBase,

    // 背景色（暗色模式：层次反转，浮层更亮）
    colorBgContainer: lighten(bgBase, 8),
    colorBgElevated: lighten(bgBase, 12),
    colorBgLayout: lighten(bgBase, 0),
    colorBgSpotlight: getAlphaColor(textBase, 0.85),
    colorBgBlur: 'transparent',
    colorBgMask: getAlphaColor('#000', 0.45),

    // 纯色背景（基于 textBase，用于反色/高对比场景）
    colorBgSolid: textBase,
    colorBgSolidHover: darken(textBase, 20),
    colorBgSolidActive: darken(textBase, 10),

    // 填充色（基于 textBase 的 alpha 通道）
    colorFill: getAlphaColor(textBase, 0.18),
    colorFillSecondary: getAlphaColor(textBase, 0.12),
    colorFillTertiary: getAlphaColor(textBase, 0.08),
    colorFillQuaternary: getAlphaColor(textBase, 0.04),

    // 文本色（基于 textBase 的 alpha 通道，暗色模式 alpha 值微调）
    colorText: getAlphaColor(textBase, 0.85),
    colorTextSecondary: getAlphaColor(textBase, 0.65),
    colorTextTertiary: getAlphaColor(textBase, 0.45),
    colorTextQuaternary: getAlphaColor(textBase, 0.25),

    // 边框色（暗色模式使用 lighten）
    colorBorder: lighten(bgBase, 26),
    colorBorderSecondary: lighten(bgBase, 19),
  };
}
