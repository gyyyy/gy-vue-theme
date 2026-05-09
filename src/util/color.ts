/**
 * 颜色工具函数
 *
 * 提供颜色操作的基础工具，包括 alpha 通道设置、亮度调节等。
 * 基于 @ctrl/tinycolor 库实现。
 */

import { TinyColor } from '@ctrl/tinycolor';

/**
 * 获取颜色的 rgb  三值
 *
 * @param baseColor - 基础色（任意合法颜色格式）
 * @returns rgb 三值字符串
 * 
 * @example
 * ```typescript
 * getRbgValue('#FF0000') // → '255, 0, 0'
 * getRbgValue('rgba(0, 255, 0, 0.5)') // → '0, 255, 0'
 * getRbgValue('hsl(240, 100%, 50%)') // → '0, 0, 255'
 * ```
 */
export function  getRbgValue(baseColor: string): string {
  const rgb = new TinyColor(baseColor).toRgb();
  if (rgb) {
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }
  return '0, 0, 0';
}

/**
 * 设置颜色的 alpha 通道
 *
 * @param baseColor - 基础色（任意合法颜色格式）
 * @param alpha - 透明度值（0~1）
 * @returns rgba 格式的颜色字符串
 *
 * @example
 * ```typescript
 * getAlphaColor('#000000', 0.85) // → 'rgba(0, 0, 0, 0.85)'
 * ```
 */
export function getAlphaColor(baseColor: string, alpha: number): string {
  return new TinyColor(baseColor).setAlpha(alpha).toRgbString();
}

/**
 * 在指定背景上反推最小 alpha 颜色
 *
 * 给定一个目标色和背景色，反推出一个使用最小 alpha 值的前景色，使其在该背景上的视觉效果与目标色一致。
 *
 * @param baseColor - 目标色
 * @param bgColor - 背景色
 * @returns rgba 格式的颜色字符串
 *
 * @example
 * ```typescript
 * getAlphaColorOnBg('#E6F4FF', '#FFFFFF')
 * // → 'rgba(0, 100, 219, 0.06)' 或类似的低 alpha 值颜色
 * ```
 */
export function getAlphaColorOnBg(baseColor: string, bgColor: string): string {
  const baseRgb = new TinyColor(baseColor).toRgb();
  const bgRgb = new TinyColor(bgColor).toRgb();

  // 遍历从 0.01 到 1.00 的 alpha 值，找到能还原目标色的最小 alpha
  for (let alpha = 0.01; alpha <= 1; alpha += 0.01) {
    const r = Math.round((baseRgb.r - bgRgb.r * (1 - alpha)) / alpha);
    const g = Math.round((baseRgb.g - bgRgb.g * (1 - alpha)) / alpha);
    const b = Math.round((baseRgb.b - bgRgb.b * (1 - alpha)) / alpha);

    if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
      return new TinyColor({ r, g, b, a: Math.round(alpha * 100) / 100 }).toRgbString();
    }
  }

  // 无法找到合适的 alpha 值时，返回原色
  return new TinyColor(baseColor).toRgbString();
}

/**
 * 将半透明前景色合成为实色
 *
 * 根据 Alpha 合成公式（Porter-Duff Over），将带透明度的前景色叠加到指定背景色上，
 * 返回视觉等效的不透明实色。
 *
 * 适用场景：
 * - Canvas / PDF / 截图等不支持透明度的输出
 * - 需要精确计算叠加后颜色值的场景（如对比度检测）
 * - 将主题令牌中的 alpha 色（colorFill、colorText 等）转换为确定颜色
 *
 * @param fgColor - 前景色（支持任意格式，含 rgba/hsla 等带透明度格式）
 * @param bgColor - 背景色（应为不透明色）
 * @returns 合成后的十六进制实色字符串
 *
 * @example
 * ```typescript
 * // colorFill 在暗色容器背景上的实际颜色
 * resolveAlphaColor('rgba(255, 255, 255, 0.18)', '#1f1f1f') // → '#474747' 左右
 *
 * // colorText 在白色背景上的实际颜色
 * resolveAlphaColor('rgba(0, 0, 0, 0.85)', '#ffffff') // → '#262626' 左右
 * ```
 */
export function resolveAlphaColor(fgColor: string, bgColor: string): string {
  const fg = new TinyColor(fgColor).toRgb();
  const bg = new TinyColor(bgColor).toRgb();
  const a = fg.a;

  return new TinyColor({
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  }).toHexString();
}

/**
 * 调亮颜色（提高 HSL 亮度）
 *
 * @param baseColor - 原始颜色
 * @param amount - 调亮量（0~100，表示 HSL L 值增加的百分点）
 * @returns 十六进制颜色字符串
 *
 * @example
 * ```typescript
 * lighten('#000000', 12) // → '#1F1F1F' 左右
 * ```
 */
export function lighten(baseColor: string, amount: number): string {
  return new TinyColor(baseColor).lighten(amount).toHexString();
}

/**
 * 调暗颜色（降低 HSL 亮度）
 *
 * @param baseColor - 原始颜色
 * @param amount - 调暗量（0~100，表示 HSL L 值减少的百分点）
 * @returns 十六进制颜色字符串
 *
 * @example
 * ```typescript
 * darken('#FFFFFF', 4) // → '#F5F5F5' 左右
 * ```
 */
export function darken(baseColor: string, amount: number): string {
  return new TinyColor(baseColor).darken(amount).toHexString();
}

/**
 * 混合两种颜色
 *
 * @param color1 - 第一种颜色
 * @param color2 - 第二种颜色
 * @param weight - 第二种颜色的权重（0~100）
 * @returns 十六进制颜色字符串
 */
export function mixColors(color1: string, color2: string, weight: number): string {
  return new TinyColor(color1).mix(color2, weight).toHexString();
}
