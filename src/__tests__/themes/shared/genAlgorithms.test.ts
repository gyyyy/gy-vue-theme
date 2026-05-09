/**
 * 字号/尺寸/圆角/高度/动画等共享算法测试
 */

import { describe, it, expect } from 'vitest';
import { genFontSizes, genLineHeight, genHeadingLineHeight, genFontHeight } from '@/token/themes/shared/genFontSizes';
import { genFontMap } from '@/token/themes/shared/genFontMap';
import { genSizeMap } from '@/token/themes/shared/genSizeMap';
import { genStyleMap } from '@/token/themes/shared/genRadius';
import { genHeightMap } from '@/token/themes/shared/genHeight';
import { genCommonMap } from '@/token/themes/shared/genCommonMap';

// ============================================================
// genFontSizes
// ============================================================

describe('genFontSizes', () => {
  it('应生成 10 个字号值', () => {
    const sizes = genFontSizes(14);
    expect(sizes).toHaveLength(10);
  });

  it('所有值应为偶数', () => {
    const sizes = genFontSizes(14);
    for (const size of sizes) {
      expect(size % 2).toBe(0);
    }
  });

  it('索引 1 应等于基准值', () => {
    expect(genFontSizes(14)[1]).toBe(14);
    expect(genFontSizes(16)[1]).toBe(16);
  });

  it('序列应递增', () => {
    const sizes = genFontSizes(14);
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1]);
    }
  });

  it('基准 14 应产生预期序列', () => {
    const sizes = genFontSizes(14);
    expect(sizes).toEqual([10, 14, 16, 20, 24, 30, 38, 46, 56, 68]);
  });
});

describe('genLineHeight', () => {
  it('结果应四舍五入到 1 位小数', () => {
    expect(genLineHeight(14)).toBe(1.6);   // 22/14 = 1.571 → 1.6
    expect(genLineHeight(16)).toBe(1.5);   // 24/16 = 1.5   → 1.5
    expect(genLineHeight(10)).toBe(1.8);   // 18/10 = 1.8   → 1.8
  });

  it('结果应大于 1', () => {
    expect(genLineHeight(14)).toBeGreaterThan(1);
    expect(genLineHeight(100)).toBeGreaterThan(1);
  });
});

describe('genHeadingLineHeight', () => {
  it('结果应保留 2 位小数', () => {
    expect(genHeadingLineHeight(38)).toBe(1.21);   // 46/38 = 1.2105 → 1.21
    expect(genHeadingLineHeight(30)).toBe(1.27);   // 38/30 = 1.2667 → 1.27
    expect(genHeadingLineHeight(24)).toBe(1.33);   // 32/24 = 1.3333 → 1.33
    expect(genHeadingLineHeight(20)).toBe(1.4);    // 28/20 = 1.4    → 1.40
    expect(genHeadingLineHeight(16)).toBe(1.5);    // 24/16 = 1.5    → 1.50
  });

  it('5 个标题级别应各不相同', () => {
    const values = [38, 30, 24, 20, 16].map(genHeadingLineHeight);
    expect(new Set(values).size).toBe(5);
  });

  it('结果应大于 1', () => {
    expect(genHeadingLineHeight(38)).toBeGreaterThan(1);
  });
});

describe('genFontHeight', () => {
  it('应等于 round(lineHeight × fontSize)', () => {
    const lh = genLineHeight(14);
    expect(genFontHeight(14, lh)).toBe(Math.round(lh * 14));
  });
});

// ============================================================
// genFontMap
// ============================================================

describe('genFontMap', () => {
  const fontMap = genFontMap(14);

  it('应包含所有字号令牌', () => {
    expect(fontMap.fontSizeSM).toBeDefined();
    expect(fontMap.fontSize).toBe(14);
    expect(fontMap.fontSizeLG).toBeDefined();
    expect(fontMap.fontSizeXL).toBeDefined();
    expect(fontMap.fontSizeHeading1).toBeDefined();
    expect(fontMap.fontSizeHeading2).toBeDefined();
    expect(fontMap.fontSizeHeading3).toBeDefined();
    expect(fontMap.fontSizeHeading4).toBeDefined();
    expect(fontMap.fontSizeHeading5).toBeDefined();
  });

  it('应包含所有行高令牌', () => {
    expect(fontMap.lineHeight).toBeDefined();
    expect(fontMap.lineHeightSM).toBeDefined();
    expect(fontMap.lineHeightLG).toBeDefined();
    expect(fontMap.lineHeightHeading1).toBeDefined();
  });

  it('应包含字体高度令牌', () => {
    expect(fontMap.fontHeight).toBeDefined();
    expect(fontMap.fontHeightSM).toBeDefined();
    expect(fontMap.fontHeightLG).toBeDefined();
  });

  it('标题字号应递增（heading5 < heading4 < ... < heading1）', () => {
    expect(fontMap.fontSizeHeading5).toBeLessThan(fontMap.fontSizeHeading4);
    expect(fontMap.fontSizeHeading4).toBeLessThan(fontMap.fontSizeHeading3);
    expect(fontMap.fontSizeHeading3).toBeLessThan(fontMap.fontSizeHeading2);
    expect(fontMap.fontSizeHeading2).toBeLessThan(fontMap.fontSizeHeading1);
  });
});

// ============================================================
// genSizeMap
// ============================================================

describe('genSizeMap', () => {
  const sizeMap = genSizeMap(4, 4);

  it('应包含所有尺寸令牌', () => {
    expect(sizeMap.sizeXXS).toBeDefined();
    expect(sizeMap.sizeXS).toBeDefined();
    expect(sizeMap.sizeSM).toBeDefined();
    expect(sizeMap.size).toBeDefined();
    expect(sizeMap.sizeMS).toBeDefined();
    expect(sizeMap.sizeMD).toBeDefined();
    expect(sizeMap.sizeLG).toBeDefined();
    expect(sizeMap.sizeXL).toBeDefined();
    expect(sizeMap.sizeXXL).toBeDefined();
  });

  it('默认参数(4, 4)时应计算正确', () => {
    expect(sizeMap.sizeXXS).toBe(4);   // 4 * (4-3) = 4
    expect(sizeMap.sizeXS).toBe(8);    // 4 * (4-2) = 8
    expect(sizeMap.sizeSM).toBe(12);   // 4 * (4-1) = 12
    expect(sizeMap.size).toBe(16);     // 4 * 4 = 16
    expect(sizeMap.sizeMD).toBe(20);   // 4 * (4+1) = 20
    expect(sizeMap.sizeLG).toBe(24);   // 4 * (4+2) = 24
    expect(sizeMap.sizeXL).toBe(32);   // 4 * (4+4) = 32
    expect(sizeMap.sizeXXL).toBe(48);  // 4 * (4+8) = 48
  });

  it('序列应大致递增', () => {
    expect(sizeMap.sizeXXS).toBeLessThanOrEqual(sizeMap.sizeXS);
    expect(sizeMap.sizeXS).toBeLessThanOrEqual(sizeMap.sizeSM);
    expect(sizeMap.sizeSM).toBeLessThanOrEqual(sizeMap.size);
    expect(sizeMap.sizeLG).toBeLessThanOrEqual(sizeMap.sizeXL);
    expect(sizeMap.sizeXL).toBeLessThanOrEqual(sizeMap.sizeXXL);
  });
});

// ============================================================
// genStyleMap (radius)
// ============================================================

describe('genStyleMap', () => {
  it('lineWidthBold 应等于 lineWidth + 1', () => {
    expect(genStyleMap(6, 1).lineWidthBold).toBe(2);
    expect(genStyleMap(6, 2).lineWidthBold).toBe(3);
  });

  it('默认参数 borderRadius=6, lineWidth=1 应计算正确', () => {
    const style = genStyleMap(6, 1);
    expect(style.borderRadiusXS).toBe(2);
    expect(style.borderRadiusSM).toBe(4);
    expect(style.borderRadius).toBe(6);
    expect(style.borderRadiusLG).toBe(8);
  });

  it('borderRadius=0 时所有圆角应为 0', () => {
    const style = genStyleMap(0, 1);
    expect(style.borderRadiusXS).toBe(0);
    expect(style.borderRadiusSM).toBe(0);
    expect(style.borderRadius).toBe(0);
    expect(style.borderRadiusLG).toBe(0);
    expect(style.borderRadiusOuter).toBe(0);
  });

  it('borderRadius=16 时 LG 不应超过 16', () => {
    const style = genStyleMap(16, 1);
    expect(style.borderRadiusLG).toBeLessThanOrEqual(16);
  });
});

// ============================================================
// genHeightMap
// ============================================================

describe('genHeightMap', () => {
  const heightMap = genHeightMap(32);

  it('基础高度应等于输入值', () => {
    expect(heightMap.controlHeight).toBe(32);
  });

  it('应按比例生成其他高度', () => {
    expect(heightMap.controlHeightXS).toBe(16);   // 32 * 0.5
    expect(heightMap.controlHeightSM).toBe(24);   // 32 * 0.75
    expect(heightMap.controlHeightLG).toBe(40);   // 32 * 1.25
  });

  it('高度应递增', () => {
    expect(heightMap.controlHeightXS).toBeLessThan(heightMap.controlHeightSM);
    expect(heightMap.controlHeightSM).toBeLessThan(heightMap.controlHeight);
    expect(heightMap.controlHeight).toBeLessThan(heightMap.controlHeightLG);
  });
});

// ============================================================
// genCommonMap
// ============================================================

describe('genCommonMap', () => {
  const commonMap = genCommonMap(0, 0.1);

  it('应生成三级动画时长', () => {
    expect(commonMap.motionDurationFast).toBeDefined();
    expect(commonMap.motionDurationMid).toBeDefined();
    expect(commonMap.motionDurationSlow).toBeDefined();
  });

  it('时长应递增', () => {
    const fast = parseFloat(commonMap.motionDurationFast);
    const mid = parseFloat(commonMap.motionDurationMid);
    const slow = parseFloat(commonMap.motionDurationSlow);
    expect(fast).toBeLessThan(mid);
    expect(mid).toBeLessThan(slow);
  });

  it('应以 s 结尾', () => {
    expect(commonMap.motionDurationFast).toMatch(/s$/);
    expect(commonMap.motionDurationMid).toMatch(/s$/);
    expect(commonMap.motionDurationSlow).toMatch(/s$/);
  });

  it('默认参数 (0, 0.1) 应计算正确', () => {
    expect(commonMap.motionDurationFast).toBe('0.1s');
    expect(commonMap.motionDurationMid).toBe('0.2s');
    expect(commonMap.motionDurationSlow).toBe('0.3s');
  });
});
