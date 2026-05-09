/**
 * 亮色/暗色/紧凑模式算法测试
 */

import { describe, it, expect } from 'vitest';
import { TinyColor } from '@ctrl/tinycolor';
import { defaultLightAlgorithm } from '@/token/themes/light/index';
import { defaultDarkAlgorithm } from '@/token/themes/dark/index';
import { applyCompact } from '@/token/themes/compact';
import { defaultSeedToken } from '@/token/seed';

// ============================================================
// defaultLightAlgorithm
// ============================================================

describe('defaultLightAlgorithm', () => {
  const baseToken = defaultLightAlgorithm(defaultSeedToken);

  it('应返回包含种子令牌的基础令牌', () => {
    expect(baseToken.colorPrimary).toBeDefined();
    expect(baseToken.fontSize).toBe(14);
    expect(baseToken.borderRadius).toBe(6);
    expect(baseToken.controlHeight).toBe(32);
  });

  it('应包含预设颜色色板', () => {
    expect(baseToken.blue1).toBeDefined();
    expect(baseToken.blue6).toBeDefined();
    expect(baseToken.blue10).toBeDefined();
    expect(baseToken.red1).toBeDefined();
    expect(baseToken.green5).toBeDefined();
  });

  it('应包含功能色映射', () => {
    expect(baseToken.colorPrimaryBg).toBeDefined();
    expect(baseToken.colorPrimaryHover).toBeDefined();
    expect(baseToken.colorPrimaryActive).toBeDefined();
    expect(baseToken.colorSuccessBg).toBeDefined();
    expect(baseToken.colorErrorBg).toBeDefined();
  });

  it('应包含中性色', () => {
    expect(baseToken.colorText).toBeDefined();
    expect(baseToken.colorTextSecondary).toBeDefined();
    expect(baseToken.colorBgContainer).toBeDefined();
    expect(baseToken.colorBgLayout).toBeDefined();
    expect(baseToken.colorBorder).toBeDefined();
  });

  it('应包含字号映射', () => {
    expect(baseToken.fontSizeSM).toBe(10);
    expect(baseToken.fontSizeLG).toBe(16);
    expect(baseToken.lineHeight).toBe(1.6);
  });

  it('应包含尺寸映射', () => {
    expect(baseToken.size).toBe(16);
    expect(baseToken.sizeXS).toBe(8);
    expect(baseToken.sizeLG).toBe(24);
  });

  it('应包含控件高度映射', () => {
    expect(baseToken.controlHeightSM).toBe(24);
    expect(baseToken.controlHeightLG).toBe(40);
  });

  it('应包含圆角映射', () => {
    expect(baseToken.borderRadiusSM).toBeDefined();
    expect(baseToken.borderRadiusLG).toBeDefined();
    expect(baseToken.lineWidthBold).toBe(2);
  });

  it('应包含动画时长', () => {
    expect(baseToken.motionDurationFast).toBeDefined();
    expect(baseToken.motionDurationMid).toBeDefined();
    expect(baseToken.motionDurationSlow).toBeDefined();
  });

  it('中性色文本在亮色模式下应较暗（偏黑）', () => {
    const textColor = new TinyColor(baseToken.colorText);
    // 亮色模式文本色应该是偏暗的
    expect(textColor.getLuminance()).toBeLessThan(0.5);
  });

  it('中性色背景在亮色模式下应较亮（偏白）', () => {
    const bgColor = new TinyColor(baseToken.colorBgContainer);
    expect(bgColor.getLuminance()).toBeGreaterThan(0.8);
  });
});

// ============================================================
// defaultDarkAlgorithm
// ============================================================

describe('defaultDarkAlgorithm', () => {
  const baseToken = defaultDarkAlgorithm(defaultSeedToken);

  it('应返回包含种子令牌的基础令牌', () => {
    expect(baseToken.colorPrimary).toBeDefined();
    expect(baseToken.fontSize).toBe(14);
  });

  it('应包含暗色色板', () => {
    expect(baseToken.blue1).toBeDefined();
    expect(baseToken.blue6).toBeDefined();
  });

  it('中性色文本在暗色模式下应较亮（偏白）', () => {
    const textColor = new TinyColor(baseToken.colorText);
    expect(textColor.getLuminance()).toBeGreaterThan(0.5);
  });

  it('中性色背景在暗色模式下应较暗（偏黑）', () => {
    const bgColor = new TinyColor(baseToken.colorBgContainer);
    expect(bgColor.getLuminance()).toBeLessThan(0.2);
  });

  it('暗色模式文本与亮色模式文本应明显不同', () => {
    const lightToken = defaultLightAlgorithm(defaultSeedToken);
    expect(baseToken.colorText).not.toBe(lightToken.colorText);
    expect(baseToken.colorBgContainer).not.toBe(lightToken.colorBgContainer);
  });
});

// ============================================================
// applyCompact
// ============================================================

describe('applyCompact', () => {
  const baseToken = defaultLightAlgorithm(defaultSeedToken);
  const compactToken = applyCompact(baseToken);

  it('sizeStep 应减少 2', () => {
    expect(compactToken.sizeStep).toBe(baseToken.sizeStep - 2);
  });

  it('controlHeight 应减少 4', () => {
    expect(compactToken.controlHeight).toBe(baseToken.controlHeight - 4);
  });

  it('控件高度序列应基于紧凑 controlHeight 重新计算', () => {
    const compactCH = baseToken.controlHeight - 4;
    expect(compactToken.controlHeightSM).toBe(compactCH * 0.75);
    expect(compactToken.controlHeightXS).toBe(compactCH * 0.5);
    expect(compactToken.controlHeightLG).toBe(compactCH * 1.25);
  });

  it('尺寸应小于原始尺寸', () => {
    expect(compactToken.size).toBeLessThan(baseToken.size);
    expect(compactToken.sizeLG).toBeLessThan(baseToken.sizeLG);
  });

  it('不应影响颜色令牌', () => {
    expect(compactToken.colorPrimary).toBe(baseToken.colorPrimary);
    expect(compactToken.colorText).toBe(baseToken.colorText);
    expect(compactToken.colorBgContainer).toBe(baseToken.colorBgContainer);
  });

  it('字号基准应改用 fontSizeSM', () => {
    // 紧凑模式使用 fontSizeSM (12) 作为 genFontMap 的输入
    expect(compactToken.fontSize).toBe(baseToken.fontSizeSM);
  });
});
