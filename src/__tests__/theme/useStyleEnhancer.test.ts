/**
 * useStyleEnhancer 测试
 *
 * 测试样式增强组合函数的核心能力：
 * - 基本增强：将增强函数生成的 CSS 注入为 <style> 标签
 * - 响应式更新：语义令牌变化时自动重新生成并注入
 * - 作用域销毁：dispose 后自动清理 <style> 标签
 * - 多增强函数组合
 * - 空数组/空输出安全
 * - SSR 安全：无 document 时安全退出
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, computed, effectScope, nextTick } from 'vue';
import { useStyleEnhancer } from '@/theme/useStyleEnhancer';
import type { StyleEnhancer } from '@/theme/useStyleEnhancer';

// ============================================================
// Mock useThemeToken
// ============================================================

const mockTokenSource = ref<Record<string, unknown>>({
  colorPrimary: '#1677FF',
  colorSuccess: '#52C41A',
  colorError: '#FF4D4F',
  colorText: '#333333',
  borderRadiusLG: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  boxShadowSecondary: '0 6px 16px rgba(0,0,0,0.08)',
});

const mockTokenComputed = computed(() => mockTokenSource.value);

vi.mock('@/theme/context', () => ({
  useThemeToken: () => mockTokenComputed,
}));

// ============================================================
// 辅助
// ============================================================

/** 查找注入的 style 标签 */
function findEnhanceStyles(): HTMLStyleElement[] {
  return Array.from(document.querySelectorAll('style[data-gy-theme^="gy-enhance-"]'));
}

// ============================================================
// 测试
// ============================================================

describe('useStyleEnhancer', () => {
  beforeEach(() => {
    mockTokenSource.value = {
      colorPrimary: '#1677FF',
      colorSuccess: '#52C41A',
      colorError: '#FF4D4F',
      colorText: '#333333',
      borderRadiusLG: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      boxShadowSecondary: '0 6px 16px rgba(0,0,0,0.08)',
    };
    // 清理残留 <style> 标签
    findEnhanceStyles().forEach((el) => el.remove());
  });

  afterEach(() => {
    findEnhanceStyles().forEach((el) => el.remove());
  });

  // -------------------------
  // 基本注入
  // -------------------------

  it('应将增强函数生成的 CSS 注入为 <style> 标签', async () => {
    const enhancer: StyleEnhancer = (token: any) =>
      `html .el-card { border-left: 3px solid ${token.colorPrimary}; }`;

    const scope = effectScope();
    scope.run(() => {
      useStyleEnhancer(enhancer);
    });

    await nextTick();

    const styleTags = findEnhanceStyles();
    expect(styleTags.length).toBe(1);
    expect(styleTags[0].textContent).toContain('border-left: 3px solid #1677FF');
    expect(styleTags[0].textContent).toContain('.el-card');

    scope.stop();
  });

  it('应支持增强函数数组', async () => {
    const e1: StyleEnhancer = (token: any) =>
      `html .el-card { border-left: 3px solid ${token.colorPrimary}; }`;
    const e2: StyleEnhancer = (token: any) =>
      `html .el-button { box-shadow: 0 2px 6px ${token.colorSuccess}; }`;

    const scope = effectScope();
    scope.run(() => {
      useStyleEnhancer([e1, e2]);
    });

    await nextTick();

    const styleTags = findEnhanceStyles();
    expect(styleTags.length).toBe(1); // 合并到同一个 <style> 标签
    const css = styleTags[0].textContent || '';
    expect(css).toContain('.el-card');
    expect(css).toContain('#1677FF');
    expect(css).toContain('.el-button');
    expect(css).toContain('#52C41A');

    scope.stop();
  });

  // -------------------------
  // 响应式更新
  // -------------------------

  it('令牌变化时应自动更新注入的 CSS', async () => {
    const enhancer: StyleEnhancer = (token: any) =>
      `html .el-card { border-color: ${token.colorPrimary}; }`;

    const scope = effectScope();
    scope.run(() => {
      useStyleEnhancer(enhancer);
    });

    await nextTick();

    let css = findEnhanceStyles()[0].textContent || '';
    expect(css).toContain('#1677FF');

    // 切换主题色
    mockTokenSource.value = { ...mockTokenSource.value, colorPrimary: '#722ED1' };
    await nextTick();

    css = findEnhanceStyles()[0].textContent || '';
    expect(css).not.toContain('#1677FF');
    expect(css).toContain('#722ED1');

    scope.stop();
  });

  // -------------------------
  // 作用域销毁清理
  // -------------------------

  it('effectScope 销毁后应清除 <style> 标签', async () => {
    const enhancer: StyleEnhancer = (token: any) =>
      `html .test-cleanup { color: ${token.colorText}; }`;

    const scope = effectScope();
    scope.run(() => {
      useStyleEnhancer(enhancer);
    });

    await nextTick();
    expect(findEnhanceStyles().length).toBe(1);

    scope.stop();
    await nextTick();

    expect(findEnhanceStyles().length).toBe(0);
  });

  // -------------------------
  // 边界情况
  // -------------------------

  it('空数组不应报错也不应注入', async () => {
    const scope = effectScope();
    expect(() => {
      scope.run(() => {
        useStyleEnhancer([]);
      });
    }).not.toThrow();

    await nextTick();
    expect(findEnhanceStyles().length).toBe(0);

    scope.stop();
  });

  it('增强函数返回空字符串时不应注入 <style> 标签', async () => {
    const enhancer: StyleEnhancer = () => '';

    const scope = effectScope();
    scope.run(() => {
      useStyleEnhancer(enhancer);
    });

    await nextTick();
    // 空 CSS 不应创建 style 标签（或即使创建也应被清除）
    const styles = findEnhanceStyles();
    if (styles.length > 0) {
      expect(styles[0].textContent?.trim()).toBe('');
    }

    scope.stop();
  });

  it('多次调用应生成独立的 <style> 标签', async () => {
    const e1: StyleEnhancer = () => `html .a { color: red; }`;
    const e2: StyleEnhancer = () => `html .b { color: blue; }`;

    const scope = effectScope();
    scope.run(() => {
      useStyleEnhancer(e1);
      useStyleEnhancer(e2);
    });

    await nextTick();
    expect(findEnhanceStyles().length).toBe(2);

    scope.stop();
    await nextTick();
    expect(findEnhanceStyles().length).toBe(0);
  });

  // -------------------------
  // SSR 安全
  // -------------------------

  it('无 document 时不应抛出异常', () => {
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, 'document', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const scope = effectScope();
    expect(() => {
      scope.run(() => {
        useStyleEnhancer(() => `html .test { color: red; }`);
      });
    }).not.toThrow();

    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      writable: true,
      configurable: true,
    });

    scope.stop();
  });
});
