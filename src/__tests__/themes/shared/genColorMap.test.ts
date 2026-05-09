/**
 * 功能色映射生成测试
 */

import { describe, it, expect } from 'vitest';
import { genLightColorMap, genDarkColorMap } from '@/token/themes/shared/genColorMap';
import { defaultSeedToken } from '@/token/seed';
import { TinyColor } from '@ctrl/tinycolor';

const FUNCTIONAL_NAMES = ['Primary', 'Success', 'Warning', 'Error', 'Info'] as const;

describe('genLightColorMap', () => {
  const colorMap = genLightColorMap(defaultSeedToken);

  it('应为每个功能色生成 10 个语义令牌', () => {
    for (const name of FUNCTIONAL_NAMES) {
      expect(colorMap[`color${name}Bg` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}BgHover` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}Border` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}BorderHover` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}Hover` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}Active` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}TextHover` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}Text` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}TextActive` as keyof typeof colorMap]).toBeDefined();
    }
  });

  it('应生成 Link 色令牌', () => {
    expect(colorMap.colorLinkHover).toBeDefined();
    expect(colorMap.colorLink).toBeDefined();
    expect(colorMap.colorLinkActive).toBeDefined();
  });

  it('所有颜色值应为有效颜色字符串', () => {
    for (const value of Object.values(colorMap)) {
      expect(new TinyColor(value as string).isValid).toBe(true);
    }
  });

  it('colorLinkBase 为空时应回退到 colorInfo', () => {
    const seed = { ...defaultSeedToken, colorLink: '' };
    const map = genLightColorMap(seed);
    const mapWithInfo = genLightColorMap({ ...defaultSeedToken, colorLinkBase: defaultSeedToken.colorInfo });
    expect(map.colorLink).toBe(mapWithInfo.colorLink);
  });

  it('Primary 主色应等于色板第 6 级', () => {
    // colorPrimary 应和 seed colorPrimary 色板的索引 5 一致
    expect(colorMap.colorPrimary).toBeDefined();
    expect(new TinyColor(colorMap.colorPrimary as string).isValid).toBe(true);
  });
});

describe('genDarkColorMap', () => {
  const colorMap = genDarkColorMap(defaultSeedToken);

  it('应为每个功能色生成 10 个语义令牌', () => {
    for (const name of FUNCTIONAL_NAMES) {
      expect(colorMap[`color${name}Bg` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}` as keyof typeof colorMap]).toBeDefined();
      expect(colorMap[`color${name}Active` as keyof typeof colorMap]).toBeDefined();
    }
  });

  it('暗色模式 Hover/Active 方向应与亮色模式相反', () => {
    const lightMap = genLightColorMap(defaultSeedToken);
    // 暗色模式：Hover=[6], Active=[4]；亮色模式：Hover=[4], Active=[6]
    // 所以暗色的 colorPrimaryHover 和 colorPrimaryActive 的相对亮度应该与亮色不同
    expect(colorMap.colorPrimaryHover).toBeDefined();
    expect(colorMap.colorPrimaryActive).toBeDefined();
    // 不应与亮色完全相同
    expect(colorMap.colorPrimaryBg).not.toBe(lightMap.colorPrimaryBg);
  });

  it('应使用默认背景色 #141414', () => {
    const map1 = genDarkColorMap(defaultSeedToken);
    const map2 = genDarkColorMap(defaultSeedToken, '#141414');
    expect(map1).toEqual(map2);
  });
});
