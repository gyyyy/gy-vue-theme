/**
 * 字号令牌映射
 *
 * 将字号序列映射为 FontMapToken 中的具体令牌，
 * 包括字号、行高、字体高度。
 */

import type { FontMapToken } from '@/token/interface/base';
import { genFontSizes, genLineHeight, genHeadingLineHeight, genFontHeight } from './genFontSizes';

/**
 * 生成字号映射令牌
 *
 * @param baseFontSize - 基础字号（种子令牌 fontSize）
 * @returns FontMapToken
 */
export function genFontMap(baseFontSize: number): FontMapToken {
  const sizes = genFontSizes(baseFontSize);

  const fontSizeSM = sizes[0];
  const fontSizeLG = sizes[2];
  const fontSizeXL = sizes[3];
  const fontSizeHeading5 = sizes[2];
  const fontSizeHeading4 = sizes[3];
  const fontSizeHeading3 = sizes[4];
  const fontSizeHeading2 = sizes[5];
  const fontSizeHeading1 = sizes[6];

  const lineHeight = genLineHeight(baseFontSize);
  const lineHeightSM = genLineHeight(fontSizeSM);
  const lineHeightLG = genLineHeight(fontSizeLG);
  const lineHeightHeading1 = genHeadingLineHeight(fontSizeHeading1);
  const lineHeightHeading2 = genHeadingLineHeight(fontSizeHeading2);
  const lineHeightHeading3 = genHeadingLineHeight(fontSizeHeading3);
  const lineHeightHeading4 = genHeadingLineHeight(fontSizeHeading4);
  const lineHeightHeading5 = genHeadingLineHeight(fontSizeHeading5);

  return {
    fontSizeSM,
    fontSize: baseFontSize,
    fontSizeLG,
    fontSizeXL,

    fontSizeHeading1,
    fontSizeHeading2,
    fontSizeHeading3,
    fontSizeHeading4,
    fontSizeHeading5,

    lineHeight,
    lineHeightSM,
    lineHeightLG,
    lineHeightHeading1,
    lineHeightHeading2,
    lineHeightHeading3,
    lineHeightHeading4,
    lineHeightHeading5,

    fontHeight: genFontHeight(baseFontSize, lineHeight),
    fontHeightSM: genFontHeight(fontSizeSM, lineHeightSM),
    fontHeightLG: genFontHeight(fontSizeLG, lineHeightLG),
  };
}
