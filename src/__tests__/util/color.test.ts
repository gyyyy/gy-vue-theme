/**
 * 颜色工具函数测试
 */

import { describe, it, expect } from 'vitest';
import { TinyColor } from '@ctrl/tinycolor';
import { getAlphaColor, getAlphaColorOnBg, darken, lighten, mixColors } from '@/util/color';

describe('getAlphaColor', () => {
  it('应生成正确的 rgba 字符串', () => {
    const result = getAlphaColor('#000000', 0.85);
    expect(result).toBe('rgba(0, 0, 0, 0.85)');
  });

  it('alpha 为 1 时应完全不透明', () => {
    const result = getAlphaColor('#FF0000', 1);
    expect(result).toBe('rgb(255, 0, 0)');
  });

  it('alpha 为 0 时应完全透明', () => {
    const result = getAlphaColor('#000000', 0);
    expect(result).toBe('rgba(0, 0, 0, 0)');
  });

  it('应保留原始颜色信息', () => {
    const result = getAlphaColor('#1677FF', 0.5);
    const parsed = new TinyColor(result);
    expect(parsed.r).toBe(22);
    expect(parsed.g).toBe(119);
    expect(parsed.b).toBe(255);
    expect(parsed.a).toBeCloseTo(0.5);
  });
});

describe('getAlphaColorOnBg', () => {
  it('在白色背景上应还原目标色', () => {
    const result = getAlphaColorOnBg('#E6F4FF', '#FFFFFF');
    // 验证混合后视觉等价
    const parsed = new TinyColor(result);
    expect(parsed.a).toBeLessThan(1);
    // 在白色背景上混合后应接近原色 #E6F4FF
    const blended = blendOnWhite(parsed);
    expect(blended.r).toBeCloseTo(230, -1);
    expect(blended.g).toBeCloseTo(244, -1);
    expect(blended.b).toBeCloseTo(255, -1);
  });

  it('在黑色背景上应返回有效的 rgba 颜色', () => {
    const result = getAlphaColorOnBg('#333333', '#000000');
    const parsed = new TinyColor(result);
    expect(parsed.isValid).toBe(true);
  });

  it('纯白色目标在白色背景上应返回低 alpha 或白色', () => {
    const result = getAlphaColorOnBg('#FFFFFF', '#FFFFFF');
    const parsed = new TinyColor(result);
    expect(parsed.isValid).toBe(true);
  });
});

describe('darken', () => {
  it('应返回更暗的十六进制颜色', () => {
    const result = darken('#FFFFFF', 4);
    const original = new TinyColor('#FFFFFF');
    const darkened = new TinyColor(result);
    expect(darkened.getLuminance()).toBeLessThan(original.getLuminance());
  });

  it('amount 为 0 时应返回原色', () => {
    const result = darken('#1677FF', 0);
    expect(result).toBe('#1677ff');
  });

  it('应返回十六进制格式', () => {
    const result = darken('#FF0000', 10);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('lighten', () => {
  it('应返回更亮的十六进制颜色', () => {
    const result = lighten('#000000', 12);
    const lightened = new TinyColor(result);
    expect(lightened.getLuminance()).toBeGreaterThan(0);
  });

  it('amount 为 0 时应返回原色', () => {
    const result = lighten('#1677FF', 0);
    expect(result).toBe('#1677ff');
  });

  it('应返回十六进制格式', () => {
    const result = lighten('#000000', 50);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('mixColors', () => {
  it('权重 0 时应返回第一种颜色', () => {
    const result = mixColors('#FF0000', '#0000FF', 0);
    expect(result).toBe('#ff0000');
  });

  it('权重 100 时应返回第二种颜色', () => {
    const result = mixColors('#FF0000', '#0000FF', 100);
    expect(result).toBe('#0000ff');
  });

  it('权重 50 时应返回中间色', () => {
    const result = mixColors('#FF0000', '#0000FF', 50);
    const parsed = new TinyColor(result);
    // R 和 B 分量应大致相等，约为 128
    expect(parsed.r).toBeCloseTo(128, -1);
    expect(parsed.b).toBeCloseTo(128, -1);
  });

  it('应返回十六进制格式', () => {
    const result = mixColors('#123456', '#654321', 30);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });
});

// 辅助函数：在白色背景上混合 rgba 颜色
function blendOnWhite(color: TinyColor): { r: number; g: number; b: number } {
  const a = color.a;
  return {
    r: Math.round(color.r * a + 255 * (1 - a)),
    g: Math.round(color.g * a + 255 * (1 - a)),
    b: Math.round(color.b * a + 255 * (1 - a)),
  };
}
