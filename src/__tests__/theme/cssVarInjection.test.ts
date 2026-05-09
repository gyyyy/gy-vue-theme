/**
 * ThemeProvider CSS 变量自动注入测试
 *
 * 测试 ThemeProvider 根据 cssVar 配置自动注入 --gy-* CSS 变量：
 * - 默认注入（cssVar 未设置时）
 * - 自定义前缀和选择器
 * - cssVar: false 禁用注入
 * - 主题/模式切换时自动更新
 * - 组件卸载时清理 <style> 标签
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick } from 'vue';
import { ThemeProvider, useThemeToken } from '@/theme/context';
import { clearAllCSSVars } from '@/theme/injectStyles';
import type { ThemeConfig } from '@/theme/interface';

// ============================================================
// 工具函数
// ============================================================

/** 查询所有由 ThemeProvider 注入的 <style> 标签 */
function findThemeStyles(): HTMLStyleElement[] {
  return Array.from(document.head.querySelectorAll('style[data-gy-theme]'));
}

/** 获取注入的 CSS 文本 */
function getInjectedCSS(): string {
  return findThemeStyles().map((s) => s.textContent ?? '').join('\n');
}

/** 创建简单的子组件 */
const SlotChild = defineComponent({
  name: 'SlotChild',
  setup() {
    return () => h('div', { class: 'slot-child' }, 'child');
  },
});

// ============================================================
// 测试
// ============================================================

describe('ThemeProvider CSS 变量自动注入', () => {
  beforeEach(() => {
    // 清理残留 style 标签及内部缓存
    clearAllCSSVars();
  });

  afterEach(() => {
    clearAllCSSVars();
  });

  // ----------------------------------------------------------
  // 默认行为：自动注入
  // ----------------------------------------------------------

  it('默认应注入 --gy-* CSS 变量（cssVar 未配置时）', async () => {
    const wrapper = mount(ThemeProvider, {
      props: { config: {} },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    const css = getInjectedCSS();
    expect(css).toContain('--gy-color-primary');
    expect(css).toContain('--gy-font-size');
    expect(css).toContain('--gy-border-radius');
    expect(css).toContain(':root');

    wrapper.unmount();
  });

  it('注入的 CSS 变量值应来自当前语义令牌', async () => {
    const wrapper = mount(ThemeProvider, {
      props: {
        config: {
          seedToken: { common: { colorPrimary: '#FF6600' } },
        } as ThemeConfig,
      },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    const css = getInjectedCSS();
    // colorPrimary 的值应包含自定义颜色（算法会将 hex 转为小写）
    expect(css).toContain('#ff6600');

    wrapper.unmount();
  });

  // ----------------------------------------------------------
  // 自定义前缀
  // ----------------------------------------------------------

  it('应支持自定义 CSS 变量前缀', async () => {
    const wrapper = mount(ThemeProvider, {
      props: {
        config: {
          cssVar: { prefix: 'app' },
        } as ThemeConfig,
      },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    const css = getInjectedCSS();
    expect(css).toContain('--app-color-primary');
    expect(css).not.toContain('--gy-color-primary');

    wrapper.unmount();
  });

  // ----------------------------------------------------------
  // 自定义选择器
  // ----------------------------------------------------------

  it('应支持自定义 CSS 选择器', async () => {
    const wrapper = mount(ThemeProvider, {
      props: {
        config: {
          cssVar: { selector: '.my-app' },
        } as ThemeConfig,
      },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    const css = getInjectedCSS();
    expect(css).toContain('.my-app');
    expect(css).not.toContain(':root {');

    wrapper.unmount();
  });

  // ----------------------------------------------------------
  // cssVar: false 禁用
  // ----------------------------------------------------------

  it('cssVar: false 时不应注入 CSS 变量', async () => {
    const wrapper = mount(ThemeProvider, {
      props: {
        config: { cssVar: false } as ThemeConfig,
      },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    const styles = findThemeStyles();
    expect(styles.length).toBe(0);

    wrapper.unmount();
  });

  // ----------------------------------------------------------
  // 响应式更新
  // ----------------------------------------------------------

  it('配置变更时应更新 CSS 变量', async () => {
    const config = { seedToken: { common: { colorPrimary: '#1677FF' } } } as ThemeConfig;

    const wrapper = mount(ThemeProvider, {
      props: { config },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();
    let css = getInjectedCSS();
    // 算法将 hex 转为小写
    expect(css).toContain('#1677ff');

    // 更新配置
    await wrapper.setProps({
      config: { seedToken: { common: { colorPrimary: '#00B96B' } } } as ThemeConfig,
    });

    await nextTick();
    css = getInjectedCSS();
    expect(css).toContain('#00b96b');

    wrapper.unmount();
  });

  it('切换到 cssVar: false 后应移除 CSS 变量', async () => {
    const wrapper = mount(ThemeProvider, {
      props: { config: {} as ThemeConfig },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();
    expect(findThemeStyles().length).toBeGreaterThan(0);

    // 改为禁用，watchEffect 会自动移除已有的 style 标签
    await wrapper.setProps({
      config: { cssVar: false } as ThemeConfig,
    });

    await nextTick();
    expect(findThemeStyles().length).toBe(0);

    wrapper.unmount();
  });

  // ----------------------------------------------------------
  // 卸载清理
  // ----------------------------------------------------------

  it('组件卸载后应移除注入的 <style> 标签', async () => {
    const wrapper = mount(ThemeProvider, {
      props: { config: {} },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();
    expect(findThemeStyles().length).toBeGreaterThan(0);

    wrapper.unmount();
    await nextTick();

    expect(findThemeStyles().length).toBe(0);
  });

  // ----------------------------------------------------------
  // 子组件渲染
  // ----------------------------------------------------------

  it('CSS 变量注入不应影响正常的插槽渲染', async () => {
    const wrapper = mount(ThemeProvider, {
      props: { config: {} },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    expect(wrapper.find('.slot-child').exists()).toBe(true);
    expect(wrapper.find('.slot-child').text()).toBe('child');

    wrapper.unmount();
  });
});

// ============================================================
// setup prop 测试
// ============================================================

describe('ThemeProvider bridge prop', () => {
  beforeEach(() => {
    clearAllCSSVars();
  });

  afterEach(() => {
    clearAllCSSVars();
  });

  it('单个 bridge 函数应在主题上下文中被调用', async () => {
    const fn = vi.fn();

    const wrapper = mount(ThemeProvider, {
      props: { config: {}, bridge: fn },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    expect(fn).toHaveBeenCalledOnce();
    expect(wrapper.find('.slot-child').exists()).toBe(true);

    wrapper.unmount();
  });

  it('数组形式的 bridge 函数应全部被调用', async () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const fn3 = vi.fn();

    const wrapper = mount(ThemeProvider, {
      props: { config: {}, bridge: [fn1, fn2, fn3] },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    expect(fn1).toHaveBeenCalledOnce();
    expect(fn2).toHaveBeenCalledOnce();
    expect(fn3).toHaveBeenCalledOnce();

    wrapper.unmount();
  });

  it('bridge 函数应能 inject 到 ThemeProvider 的主题上下文', async () => {
    let injectedToken: unknown = null;

    const bridgeFn = () => {
      const token = useThemeToken();
      injectedToken = token.value;
    };

    const wrapper = mount(ThemeProvider, {
      props: {
        config: { seedToken: { common: { colorPrimary: '#FF0000' } } } as ThemeConfig,
        bridge: bridgeFn,
      },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    expect(injectedToken).toBeTruthy();
    expect((injectedToken as Record<string, unknown>).colorPrimary).toBe('#ff0000');

    wrapper.unmount();
  });

  it('不传 bridge 时不应渲染桥接组件', async () => {
    const wrapper = mount(ThemeProvider, {
      props: { config: {} },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    // 组件树中不应包含 _ThemeBridge
    expect(wrapper.findComponent({ name: '_ThemeBridge' }).exists()).toBe(false);
    expect(wrapper.find('.slot-child').exists()).toBe(true);

    wrapper.unmount();
  });

  it('bridge 为空数组时仍应正常渲染', async () => {
    const wrapper = mount(ThemeProvider, {
      props: { config: {}, bridge: [] as (() => void)[] },
      slots: { default: () => h(SlotChild) },
    });

    await nextTick();

    expect(wrapper.find('.slot-child').exists()).toBe(true);

    wrapper.unmount();
  });

  it('嵌套 ThemeProvider 应合并 semanticToken 覆盖', async () => {
    let injectedToken: Record<string, unknown> | null = null;

    const CaptureToken = defineComponent({
      name: 'CaptureToken',
      setup() {
        const token = useThemeToken();
        injectedToken = token.value as unknown as Record<string, unknown>;
        return () => h('div', { class: 'capture-token' });
      },
    });

    const NestedProviders = defineComponent({
      name: 'NestedProviders',
      setup() {
        return () => h(
          ThemeProvider,
          {
            config: {
              semanticToken: { colorText: '#111111' },
            } as ThemeConfig,
          },
          {
            default: () => h(
              ThemeProvider,
              {
                config: {
                  semanticToken: { colorBgContainer: '#222222' },
                } as ThemeConfig,
              },
              {
                default: () => h(CaptureToken),
              },
            ),
          },
        );
      },
    });

    const wrapper = mount(NestedProviders);

    await nextTick();

    expect(injectedToken).toBeTruthy();
    const capturedToken = injectedToken as unknown as Record<string, unknown>;
    expect(capturedToken.colorText).toBe('#111111');
    expect(capturedToken.colorBgContainer).toBe('#222222');

    wrapper.unmount();
  });
});
