/**
 * 主题引擎核心测试
 *
 * 测试 defineTheme, resolveTheme, getDesignToken, hashToken,
 * resolveColorAlgorithm 等核心功能。
 */

import { describe, it, expect } from 'vitest';
import { defineTheme, defaultTheme } from '@/theme/defineTheme';
import { resolveTheme, getDesignToken, hashToken, resolveColorAlgorithm } from '@/theme/useToken';
import { defaultLightAlgorithm } from '@/token/themes/light/index';
import { defaultDarkAlgorithm } from '@/token/themes/dark/index';
import { defaultSeedToken } from '@/token/seed';
import type { ThemeConfig } from '@/theme/interface';

// ============================================================
// defineTheme
// ============================================================

describe('defineTheme', () => {
  it('应返回冻结的对象', () => {
    const theme = defineTheme({ name: 'test' });
    expect(Object.isFrozen(theme)).toBe(true);
  });

  it('应保留所有属性', () => {
    const theme = defineTheme({
      name: 'my-theme',
      seedToken: { common: { colorPrimary: '#00B96B' } },
      algorithm: {
        light: defaultLightAlgorithm,
        dark: defaultDarkAlgorithm,
      },
    });
    expect(theme.name).toBe('my-theme');
    expect(theme.seedToken?.common?.colorPrimary).toBe('#00B96B');
    expect(theme.algorithm?.light).toBe(defaultLightAlgorithm);
    expect(theme.algorithm?.dark).toBe(defaultDarkAlgorithm);
  });

  it('不提供 dark 时应为 undefined', () => {
    const theme = defineTheme({ name: 'light-only' });
    expect(theme.algorithm?.dark).toBeUndefined();
  });
});

describe('defaultTheme', () => {
  it('应有默认名称', () => {
    expect(defaultTheme.name).toBe('default');
  });

  it('应有亮色和暗色算法', () => {
    expect(defaultTheme.algorithm?.light).toBe(defaultLightAlgorithm);
    expect(defaultTheme.algorithm?.dark).toBe(defaultDarkAlgorithm);
  });
});

// ============================================================
// resolveColorAlgorithm
// ============================================================

describe('resolveColorAlgorithm', () => {
  it('亮色模式应返回 light 算法', () => {
    const alg = resolveColorAlgorithm(defaultTheme, 'light');
    expect(alg).toBe(defaultLightAlgorithm);
  });

  it('暗色模式应返回 dark 算法', () => {
    const alg = resolveColorAlgorithm(defaultTheme, 'dark');
    expect(alg).toBe(defaultDarkAlgorithm);
  });

  it('未提供 dark 算法时应回退到 defaultDarkAlgorithm', () => {
    const lightOnlyTheme = defineTheme({
      name: 'light-only',
      algorithm: { light: defaultLightAlgorithm },
    });
    const alg = resolveColorAlgorithm(lightOnlyTheme, 'dark');
    expect(alg).toBe(defaultDarkAlgorithm);
  });

  it('未提供任何算法时应回退到默认算法', () => {
    const emptyTheme = defineTheme({ name: 'empty' });
    const algLight = resolveColorAlgorithm(emptyTheme, 'light');
    expect(algLight).toBe(defaultLightAlgorithm);
    const algDark = resolveColorAlgorithm(emptyTheme, 'dark');
    expect(algDark).toBe(defaultDarkAlgorithm);
  });
});

// ============================================================
// hashToken
// ============================================================

describe('hashToken', () => {
  it('应返回非空字符串', () => {
    const token = getDesignToken();
    const hash = hashToken(token);
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
  });

  it('相同令牌应产生相同哈希', () => {
    const token = getDesignToken();
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it('不同令牌应产生不同哈希', () => {
    const token1 = getDesignToken();
    const token2 = getDesignToken({ seedToken: { common: { colorPrimary: '#FF0000' } } });
    expect(hashToken(token1)).not.toBe(hashToken(token2));
  });
});

// ============================================================
// resolveTheme
// ============================================================

describe('resolveTheme', () => {
  it('无参数时应返回默认主题', () => {
    const resolved = resolveTheme();
    expect(resolved.name).toBe('default');
    expect(resolved.mode).toBe('light');
    expect(resolved.compact).toBe(false);
  });

  it('应包含完整的令牌集合', () => {
    const resolved = resolveTheme();
    expect(resolved.seedToken).toBeDefined();
    expect(resolved.baseToken).toBeDefined();
    expect(resolved.semanticToken).toBeDefined();
    expect(resolved.hashId).toBeTruthy();
  });

  it('应合并种子令牌（config.seedToken.common > theme.seedToken.common > default）', () => {
    const theme = defineTheme({
      name: 'custom',
      seedToken: { common: { colorPrimary: '#00B96B' } },
      algorithm: { light: defaultLightAlgorithm },
    });
    const config: ThemeConfig = {
      theme,
      seedToken: { common: { colorPrimary: '#FF0000' } },
    };
    const resolved = resolveTheme(config);
    expect(resolved.seedToken.colorPrimary).toBe('#FF0000');
  });

  it('暗色模式应使用暗色算法', () => {
    const resolved = resolveTheme({ mode: 'dark' });
    expect(resolved.mode).toBe('dark');
    // 暗色模式背景应较暗
    const { TinyColor } = require('@ctrl/tinycolor');
    const bg = new TinyColor(resolved.semanticToken.colorBgContainer);
    expect(bg.getLuminance()).toBeLessThan(0.2);
  });

  it('紧凑模式应缩减尺寸', () => {
    const normal = resolveTheme();
    const compact = resolveTheme({ compact: true });
    expect(compact.compact).toBe(true);
    expect(compact.baseToken.controlHeight).toBeLessThan(normal.baseToken.controlHeight);
    expect(compact.baseToken.sizeStep).toBeLessThan(normal.baseToken.sizeStep);
  });

  it('紧凑+暗色应同时生效', () => {
    const resolved = resolveTheme({ mode: 'dark', compact: true });
    expect(resolved.mode).toBe('dark');
    expect(resolved.compact).toBe(true);
    expect(resolved.baseToken.controlHeight).toBe(defaultSeedToken.controlHeight - 4);
  });

  // ---------- 语义令牌覆盖 ----------

  it('主题级 semanticToken 应覆盖算法派生值', () => {
    const theme = defineTheme({
      name: 'override',
      algorithm: { light: defaultLightAlgorithm },
      semanticToken: {
        common: {
          colorFillContent: '#custom1',
          controlItemBgActive: '#custom2',
        },
      },
    });
    const resolved = resolveTheme({ theme });
    expect(resolved.semanticToken.colorFillContent).toBe('#custom1');
    expect(resolved.semanticToken.controlItemBgActive).toBe('#custom2');
    // 未覆盖的语义令牌仍由算法派生
    expect(resolved.semanticToken.colorTextPlaceholder).toBeDefined();
  });

  it('运行时 semanticToken 优先级高于主题级', () => {
    const theme = defineTheme({
      name: 'base',
      algorithm: { light: defaultLightAlgorithm },
      semanticToken: {
        common: {
          colorFillContent: '#from-theme',
        },
      },
    });
    const resolved = resolveTheme({
      theme,
      semanticToken: {
        colorFillContent: '#from-config',
      },
    });
    expect(resolved.semanticToken.colorFillContent).toBe('#from-config');
  });

  it('语义覆盖不影响种子令牌和基础令牌', () => {
    const theme = defineTheme({
      name: 'semantic-only',
      algorithm: { light: defaultLightAlgorithm },
      seedToken: { common: { colorPrimary: '#1890FF' } },
      semanticToken: {
        common: {
          colorFillContent: '#override',
        },
      },
    });
    const resolved = resolveTheme({ theme });
    // 种子令牌不受语义覆盖影响
    expect(resolved.seedToken.colorPrimary).toBe('#1890FF');
    // 基础令牌不受语义覆盖影响
    expect(resolved.baseToken.colorPrimary).toBeDefined();
    // 语义覆盖仅影响最终语义令牌
    expect(resolved.semanticToken.colorFillContent).toBe('#override');
  });
});

// ============================================================
// getDesignToken
// ============================================================

describe('getDesignToken', () => {
  it('无参调用应返回默认令牌', () => {
    const token = getDesignToken();
    expect(token).toBeDefined();
    expect(token.colorPrimary).toBeDefined();
    expect(token.fontSize).toBe(14);
  });

  it('应与 resolveTheme 产生相同令牌', () => {
    const config: ThemeConfig = { seedToken: { common: { colorPrimary: '#123456' } } };
    const fromResolve = resolveTheme(config).semanticToken;
    const fromGet = getDesignToken(config);
    expect(fromGet).toEqual(fromResolve);
  });
});
