/**
 * CSS 变量引用辅助工具测试
 */

import { describe, it, expect } from 'vitest';
import { cssVar, cssVarName, themeVars, createThemeVars } from '@/theme/cssVar';

// ============================================================
// themeVars 对象（推荐用法）
// ============================================================

describe('themeVars', () => {
  it('应通过点号访问返回 CSS 变量名', () => {
    expect(themeVars.colorPrimary).toBe('--gy-color-primary');
    expect(themeVars.colorBgLayout).toBe('--gy-color-bg-layout');
    expect(themeVars.colorBgContainer).toBe('--gy-color-bg-container');
    expect(themeVars.colorText).toBe('--gy-color-text');
    expect(themeVars.fontSize).toBe('--gy-font-size');
    expect(themeVars.borderRadius).toBe('--gy-border-radius');
    expect(themeVars.boxShadow).toBe('--gy-box-shadow');
  });

  it('应正确处理多段驼峰', () => {
    expect(themeVars.colorTextSecondary).toBe('--gy-color-text-secondary');
    expect(themeVars.colorBorderSecondary).toBe('--gy-color-border-secondary');
    expect(themeVars.boxShadowTertiary).toBe('--gy-box-shadow-tertiary');
    expect(themeVars.colorFillContent).toBe('--gy-color-fill-content');
  });

  it('应正确处理含数字的令牌名', () => {
    expect(themeVars.fontSizeHeading1).toBe('--gy-font-size-heading-1');
    expect(themeVars.lineHeightHeading3).toBe('--gy-line-height-heading-3');
  });

  it('值应与 cssVarName 函数一致', () => {
    expect(themeVars.colorPrimary).toBe(cssVarName('colorPrimary'));
    expect(themeVars.colorBgLayout).toBe(cssVarName('colorBgLayout'));
  });
});

describe('createThemeVars', () => {
  it('应支持自定义前缀', () => {
    const appVars = createThemeVars('app');
    expect(appVars.colorPrimary).toBe('--app-color-primary');
    expect(appVars.colorBgLayout).toBe('--app-color-bg-layout');
  });
});

// ============================================================
// 函数式 API
// ============================================================

describe('cssVar', () => {
  it('应将 camelCase 令牌名转为 var() 引用', () => {
    expect(cssVar('colorPrimary')).toBe('var(--gy-color-primary)');
    expect(cssVar('colorBgLayout')).toBe('var(--gy-color-bg-layout)');
    expect(cssVar('colorBgContainer')).toBe('var(--gy-color-bg-container)');
    expect(cssVar('fontSize')).toBe('var(--gy-font-size)');
    expect(cssVar('borderRadius')).toBe('var(--gy-border-radius)');
    expect(cssVar('boxShadow')).toBe('var(--gy-box-shadow)');
  });

  it('应支持自定义前缀', () => {
    expect(cssVar('colorPrimary', 'app')).toBe('var(--app-color-primary)');
    expect(cssVar('colorBgLayout', 'theme')).toBe('var(--theme-color-bg-layout)');
  });

  it('应支持回退值', () => {
    expect(cssVar('colorPrimary', 'gy', '#1890FF')).toBe('var(--gy-color-primary, #1890FF)');
    expect(cssVar('colorBgLayout', 'gy', '#F6F8FA')).toBe('var(--gy-color-bg-layout, #F6F8FA)');
  });
});

describe('cssVarName', () => {
  it('应返回纯变量名', () => {
    expect(cssVarName('colorPrimary')).toBe('--gy-color-primary');
    expect(cssVarName('colorBgLayout')).toBe('--gy-color-bg-layout');
    expect(cssVarName('fontSize')).toBe('--gy-font-size');
  });

  it('结果应与 tokenToCSSVars 的键一致', async () => {
    const { tokenToCSSVars } = await import('@/theme/transformToken');
    const { getDesignToken } = await import('@/theme/useToken');

    const token = getDesignToken();
    const vars = tokenToCSSVars(token, 'gy');

    expect(vars[cssVarName('colorPrimary')]).toBeDefined();
    expect(vars[cssVarName('fontSize')]).toBeDefined();
    expect(vars[cssVarName('borderRadius')]).toBeDefined();
    expect(vars[cssVarName('colorBgLayout')]).toBeDefined();
  });
});
