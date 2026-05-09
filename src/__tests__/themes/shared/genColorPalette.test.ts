/**
 * 颜色色板生成算法测试
 */

import { describe, it, expect } from 'vitest';
import { TinyColor } from '@ctrl/tinycolor';
import { generateLightPalette, generateDarkPalette } from '@/token/themes/shared/genColorPalette';

describe('generateLightPalette', () => {
  it('应生成 10 个颜色的数组', () => {
    const palette = generateLightPalette('#1677FF');
    expect(palette).toHaveLength(10);
  });

  it('每个颜色应为有效的十六进制格式', () => {
    const palette = generateLightPalette('#1677FF');
    for (const color of palette) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
      expect(new TinyColor(color).isValid).toBe(true);
    }
  });

  it('第 6 级（索引 5）应为输入色', () => {
    const base = '#1677FF';
    const palette = generateLightPalette(base);
    expect(palette[5]).toBe(new TinyColor(base).toHexString());
  });

  it('亮色方向的颜色应逐渐变亮', () => {
    const palette = generateLightPalette('#1677FF');
    // 索引 0~5 的明度应大致递减（越靠前越亮）
    for (let i = 0; i < 4; i++) {
      const current = new TinyColor(palette[i]).toHsv();
      const next = new TinyColor(palette[i + 1]).toHsv();
      expect(current.v).toBeGreaterThanOrEqual(next.v - 0.01);
    }
  });

  it('暗色方向的颜色应逐渐变暗', () => {
    const palette = generateLightPalette('#1677FF');
    // 索引 5~9 的明度应大致递减
    for (let i = 5; i < 9; i++) {
      const current = new TinyColor(palette[i]).toHsv();
      const next = new TinyColor(palette[i + 1]).toHsv();
      expect(current.v).toBeGreaterThanOrEqual(next.v - 0.01);
    }
  });

  it('不同输入色应产生不同色板', () => {
    const palette1 = generateLightPalette('#1677FF');
    const palette2 = generateLightPalette('#52C41A');
    expect(palette1).not.toEqual(palette2);
  });

  it('灰色（无饱和度）应能正确生成色板', () => {
    const palette = generateLightPalette('#808080');
    expect(palette).toHaveLength(10);
    for (const color of palette) {
      expect(new TinyColor(color).isValid).toBe(true);
    }
  });
});

describe('generateDarkPalette', () => {
  it('应生成 10 个颜色的数组', () => {
    const palette = generateDarkPalette('#1677FF');
    expect(palette).toHaveLength(10);
  });

  it('每个颜色应为有效的十六进制格式', () => {
    const palette = generateDarkPalette('#1677FF');
    for (const color of palette) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
      expect(new TinyColor(color).isValid).toBe(true);
    }
  });

  it('暗色色板整体应比亮色色板更暗', () => {
    const lightPalette = generateLightPalette('#1677FF');
    const darkPalette = generateDarkPalette('#1677FF');

    // 比较平均亮度
    const avgLightV = lightPalette.map(c => new TinyColor(c).toHsv().v).reduce((a, b) => a + b, 0) / 10;
    const avgDarkV = darkPalette.map(c => new TinyColor(c).toHsv().v).reduce((a, b) => a + b, 0) / 10;

    expect(avgDarkV).toBeLessThan(avgLightV);
  });

  it('应使用默认背景色 #141414', () => {
    const palette1 = generateDarkPalette('#1677FF');
    const palette2 = generateDarkPalette('#1677FF', '#141414');
    expect(palette1).toEqual(palette2);
  });

  it('不同背景色应产生不同色板', () => {
    const palette1 = generateDarkPalette('#1677FF', '#141414');
    const palette2 = generateDarkPalette('#1677FF', '#000000');
    expect(palette1).not.toEqual(palette2);
  });
});
