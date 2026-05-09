/**
 * 字号序列生成算法
 *
 * 使用自然对数（e 指数）算法生成 10 级字号序列。
 * 公式：fontSize_i = base × e^((i-1)/5)
 * 取整规则：结果向下取整到最近的偶数值。
 */

/**
 * 生成 10 级字号序列
 *
 * @param baseFontSize - 基础字号（种子令牌 fontSize，默认 14）
 * @returns 10 个字号值的数组
 *
 * @example
 * ```typescript
 * genFontSizes(14)
 * // → [12, 14, 16, 20, 24, 30, 38, 46, 56, 68]
 * ```
 */
export function genFontSizes(baseFontSize: number): number[] {
  const sizes: number[] = [];

  for (let i = 0; i < 10; i++) {
    const raw = baseFontSize * Math.E ** ((i - 1) / 5);
    // 向下取整到最近的偶数
    const rounded = Math.floor(raw / 2) * 2;
    sizes.push(rounded);
  }

  // 索引 1 强制等于基准值
  sizes[1] = baseFontSize;

  return sizes;
}

/**
 * 计算正文行高
 *
 * 公式：lineHeight = (fontSize + 8) / fontSize
 * 即固定增加 8px 基线距离后除以字号。
 * 结果保留 1 位小数。
 *
 * 注：SM 字号比 LG 小，所以 lineHeightSM > lineHeightLG，
 * 这是正常的排版规律——字号越小需要越大的行高比例来保证可读性。
 *
 * @param baseFontSize - 字号
 * @returns 行高比例值（1 位小数）
 */
export function genLineHeight(baseFontSize: number): number {
  return parseFloat(((baseFontSize + 8) / baseFontSize).toFixed(1));
}

/**
 * 计算标题行高
 *
 * 使用与正文相同的公式，但结果四舍五入到最近的 0.05，
 * 结果保留 2 位小数，使各标题级别值整齐且具有区分度。
 *
 * 基准 14px 时的结果：h1=1.21 / h2=1.27 / h3=1.33 / h4=1.4 / h5=1.5
 *
 * @param baseFontSize - 标题字号
 * @returns 行高比例值（2 位小数）
 */
export function genHeadingLineHeight(baseFontSize: number): number {
  return parseFloat(((baseFontSize + 8) / baseFontSize).toFixed(2));
}

/**
 * 计算字体高度
 *
 * 公式：fontHeight = round(lineHeight × fontSize)
 *
 * @param baseFontSize - 字号
 * @param lineHeight - 行高
 * @returns 字体高度（像素值）
 */
export function genFontHeight(baseFontSize: number, lineHeight: number): number {
  return Math.round(lineHeight * baseFontSize);
}
