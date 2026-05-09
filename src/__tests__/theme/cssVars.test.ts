/**
 * CSS 变量转换与注入测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tokenToCSSVars, cssVarsToString } from '@/theme/transformToken';
import { injectCSSVars, removeCSSVars, clearAllCSSVars } from '@/theme/injectStyles';
import { getDesignToken } from '@/theme/useToken';

// ============================================================
// tokenToCSSVars
// ============================================================

describe('tokenToCSSVars', () => {
  const token = getDesignToken();
  const vars = tokenToCSSVars(token);

  it('应返回非空对象', () => {
    expect(Object.keys(vars).length).toBeGreaterThan(0);
  });

  it('所有键应以 --gy- 开头', () => {
    for (const key of Object.keys(vars)) {
      expect(key).toMatch(/^--gy-/);
    }
  });

  it('自定义前缀应生效', () => {
    const customVars = tokenToCSSVars(token, 'app');
    for (const key of Object.keys(customVars)) {
      expect(key).toMatch(/^--app-/);
    }
  });

  it('camelCase 应转换为 kebab-case', () => {
    expect(vars['--gy-color-primary']).toBeDefined();
    expect(vars['--gy-font-size']).toBeDefined();
    expect(vars['--gy-border-radius']).toBeDefined();
  });

  it('数字值应自动追加 px', () => {
    // fontSize=14 → '14px'
    expect(vars['--gy-font-size']).toBe('14px');
    // borderRadius=6 → '6px'
    expect(vars['--gy-border-radius']).toBe('6px');
  });

  it('无单位属性不应追加 px', () => {
    // lineHeight 是无单位属性
    const lineHeightVar = vars['--gy-line-height'];
    expect(lineHeightVar).toBeDefined();
    expect(lineHeightVar).not.toMatch(/px$/);
  });

  it('字符串值应原样保留', () => {
    // colorPrimary 是颜色字符串
    expect(vars['--gy-color-primary']).toMatch(/^#|rgba?/);
  });

  it('应跳过 undefined/null/object 值', () => {
    for (const value of Object.values(vars)) {
      expect(value).toBeDefined();
      expect(typeof value).toBe('string');
    }
  });
});

// ============================================================
// cssVarsToString
// ============================================================

describe('cssVarsToString', () => {
  it('应生成有效的 CSS 文本', () => {
    const vars = { '--gy-color-primary': '#1677FF', '--gy-font-size': '14px' };
    const css = cssVarsToString(vars);
    expect(css).toContain(':root');
    expect(css).toContain('--gy-color-primary: #1677FF;');
    expect(css).toContain('--gy-font-size: 14px;');
  });

  it('自定义选择器应生效', () => {
    const vars = { '--gy-color-primary': '#1677FF' };
    const css = cssVarsToString(vars, '.dark-mode');
    expect(css).toContain('.dark-mode');
    expect(css).not.toContain(':root');
  });

  it('空对象应生成空的规则块', () => {
    const css = cssVarsToString({});
    expect(css).toContain(':root');
    // 应包含空的花括号内容
    expect(css).toMatch(/\{\s*\}/s);
  });
});

// ============================================================
// injectCSSVars / removeCSSVars / clearAllCSSVars
// ============================================================

describe('injectCSSVars', () => {
  beforeEach(() => {
    clearAllCSSVars();
  });

  afterEach(() => {
    clearAllCSSVars();
  });

  it('应创建 style 标签', () => {
    injectCSSVars(':root { --gy-color-primary: #1677FF; }', 'test-hash');
    const styleEl = document.querySelector('style[data-gy-theme="test-hash"]');
    expect(styleEl).not.toBeNull();
    expect(styleEl?.textContent).toContain('--gy-color-primary');
  });

  it('相同 hashId 应复用 style 标签', () => {
    injectCSSVars('body { color: red; }', 'reuse-hash');
    injectCSSVars('body { color: blue; }', 'reuse-hash');
    const styles = document.querySelectorAll('style[data-gy-theme="reuse-hash"]');
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain('color: blue');
  });

  it('不同 hashId 应创建不同 style 标签', () => {
    injectCSSVars('a {}', 'hash-a');
    injectCSSVars('b {}', 'hash-b');
    expect(document.querySelector('style[data-gy-theme="hash-a"]')).not.toBeNull();
    expect(document.querySelector('style[data-gy-theme="hash-b"]')).not.toBeNull();
  });
});

describe('removeCSSVars', () => {
  beforeEach(() => {
    clearAllCSSVars();
  });

  afterEach(() => {
    clearAllCSSVars();
  });

  it('应移除指定 hashId 的 style 标签', () => {
    injectCSSVars('a {}', 'remove-test');
    expect(document.querySelector('style[data-gy-theme="remove-test"]')).not.toBeNull();
    removeCSSVars('remove-test');
    expect(document.querySelector('style[data-gy-theme="remove-test"]')).toBeNull();
  });

  it('移除不存在的 hashId 不应报错', () => {
    expect(() => removeCSSVars('nonexistent')).not.toThrow();
  });
});

describe('clearAllCSSVars', () => {
  it('应移除所有已注入的 style 标签', () => {
    injectCSSVars('a {}', 'clear-a');
    injectCSSVars('b {}', 'clear-b');
    clearAllCSSVars();
    expect(document.querySelector('style[data-gy-theme="clear-a"]')).toBeNull();
    expect(document.querySelector('style[data-gy-theme="clear-b"]')).toBeNull();
  });
});
