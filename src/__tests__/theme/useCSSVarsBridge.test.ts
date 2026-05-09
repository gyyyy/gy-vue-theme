/**
 * useCSSVarsBridge / useCSSVarsBridgeAll 测试
 *
 * 测试 CSS 变量桥接组合函数的核心能力：
 * - 基本桥接：组件令牌值映射为 CSS 自定义属性
 * - 响应式更新：令牌变化时 CSS 变量自动同步
 * - 作用域销毁：dispose 后自动清理 CSS 变量
 * - 自定义目标元素
 * - 批量桥接
 * - SSR 安全：无 document 时安全退出
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, computed, effectScope, nextTick } from 'vue';
import { useCSSVarsBridge, useCSSVarsBridgeAll } from '@/theme/useCSSVarsBridge';
import type { CSSVarsMapping } from '@/theme/useCSSVarsBridge';

// ============================================================
// 类型扩展
// ============================================================

/** 测试用组件令牌 */
interface TestWidgetToken {
  [key: string]: unknown;
  bgColor: string;
  textColor: string;
  fontSize: number;
}

/** 第二个测试用组件令牌（批量桥接测试） */
interface TestNavToken {
  [key: string]: unknown;
  navBg: string;
  navHeight: number;
}

// 扩展 ComponentTokenMap（TypeScript 声明合并）
declare module '@/token/interface/component' {
  interface ComponentTokenMap {
    TestWidget: TestWidgetToken;
    TestNav: TestNavToken;
  }
}

// ============================================================
// Mock useComponentToken
// ============================================================

const mockUseComponentToken = vi.fn();

vi.mock('@/theme/useComponentToken', () => ({
  useComponentToken: (...args: unknown[]) => mockUseComponentToken(...args),
}));

// ============================================================
// 测试工具
// ============================================================

/** 创建一个可变的 computed（模拟 useComponentToken 返回值） */
function createMockComputedToken<T extends Record<string, unknown>>(initial: T) {
  const source = ref<T>(initial);
  const comp = computed<T>(() => source.value);
  return { source, comp };
}

/** 标准映射：TestWidget → CSS 变量 */
const widgetMapping: CSSVarsMapping<TestWidgetToken> = (t) => ({
  '--tw-bg-color': t.bgColor,
  '--tw-text-color': t.textColor,
  '--tw-font-size': `${t.fontSize}px`,
});

/** 标准映射：TestNav → CSS 变量 */
const navMapping: CSSVarsMapping<TestNavToken> = (t) => ({
  '--tn-nav-bg': t.navBg,
  '--tn-nav-height': `${t.navHeight}px`,
});

// ============================================================
// 测试
// ============================================================

describe('useCSSVarsBridge', () => {
  let targetEl: HTMLDivElement;

  beforeEach(() => {
    // 每个测试使用独立的 DOM 元素
    targetEl = document.createElement('div');
    document.body.appendChild(targetEl);
    mockUseComponentToken.mockReset();
  });

  afterEach(() => {
    targetEl.remove();
  });

  // ----------------------------------------------------------
  // 基本桥接
  // ----------------------------------------------------------

  it('应将组件令牌映射为 CSS 变量并注入目标元素', async () => {
    const { comp } = createMockComputedToken<TestWidgetToken>({
      bgColor: '#FFFFFF',
      textColor: '#333333',
      fontSize: 14,
    });
    mockUseComponentToken.mockReturnValue(comp);

    const scope = effectScope();
    scope.run(() => {
      useCSSVarsBridge('TestWidget', widgetMapping, { target: targetEl });
    });

    await nextTick();

    expect(targetEl.style.getPropertyValue('--tw-bg-color')).toBe('#FFFFFF');
    expect(targetEl.style.getPropertyValue('--tw-text-color')).toBe('#333333');
    expect(targetEl.style.getPropertyValue('--tw-font-size')).toBe('14px');

    // 验证调用了正确的组件名
    expect(mockUseComponentToken).toHaveBeenCalledWith('TestWidget');

    scope.stop();
  });

  it('未指定 target 时应使用 document.documentElement', async () => {
    const { comp } = createMockComputedToken<TestWidgetToken>({
      bgColor: '#000',
      textColor: '#FFF',
      fontSize: 16,
    });
    mockUseComponentToken.mockReturnValue(comp);

    const scope = effectScope();
    scope.run(() => {
      useCSSVarsBridge('TestWidget', widgetMapping);
    });

    await nextTick();

    expect(document.documentElement.style.getPropertyValue('--tw-bg-color')).toBe('#000');
    expect(document.documentElement.style.getPropertyValue('--tw-text-color')).toBe('#FFF');
    expect(document.documentElement.style.getPropertyValue('--tw-font-size')).toBe('16px');

    scope.stop();

    // 清理 documentElement 上的残留（scope.stop 会清理）
  });

  // ----------------------------------------------------------
  // 响应式更新
  // ----------------------------------------------------------

  it('令牌变化时应自动更新 CSS 变量', async () => {
    const { source, comp } = createMockComputedToken<TestWidgetToken>({
      bgColor: '#FFFFFF',
      textColor: '#333333',
      fontSize: 14,
    });
    mockUseComponentToken.mockReturnValue(comp);

    const scope = effectScope();
    scope.run(() => {
      useCSSVarsBridge('TestWidget', widgetMapping, { target: targetEl });
    });

    await nextTick();
    expect(targetEl.style.getPropertyValue('--tw-bg-color')).toBe('#FFFFFF');

    // 修改令牌
    source.value = {
      bgColor: '#1A1A1A',
      textColor: '#EEEEEE',
      fontSize: 18,
    };

    await nextTick();

    expect(targetEl.style.getPropertyValue('--tw-bg-color')).toBe('#1A1A1A');
    expect(targetEl.style.getPropertyValue('--tw-text-color')).toBe('#EEEEEE');
    expect(targetEl.style.getPropertyValue('--tw-font-size')).toBe('18px');

    scope.stop();
  });

  it('多次令牌变化后旧变量应被清除', async () => {
    // 第一次映射包含 key-a，第二次映射不包含 key-a
    // 通过不同的映射函数来验证旧变量被正确清除
    const source = ref<Record<string, string>>({ a: '1', b: '2' });
    const comp = computed(() => source.value);
    mockUseComponentToken.mockReturnValue(comp);

    const dynamicMapping = (t: Record<string, string>) => {
      const vars: Record<string, string> = {};
      for (const [k, v] of Object.entries(t)) {
        vars[`--dyn-${k}`] = v;
      }
      return vars;
    };

    const scope = effectScope();
    scope.run(() => {
      // 使用 any 绕过类型约束，因为我们测试的是运行时行为
      (useCSSVarsBridge as any)('TestWidget', dynamicMapping, { target: targetEl });
    });

    await nextTick();
    expect(targetEl.style.getPropertyValue('--dyn-a')).toBe('1');
    expect(targetEl.style.getPropertyValue('--dyn-b')).toBe('2');

    // 第二批变量不包含 key a
    source.value = { b: '20', c: '30' };
    await nextTick();

    // 旧的 --dyn-a 应已被清除
    expect(targetEl.style.getPropertyValue('--dyn-a')).toBe('');
    expect(targetEl.style.getPropertyValue('--dyn-b')).toBe('20');
    expect(targetEl.style.getPropertyValue('--dyn-c')).toBe('30');

    scope.stop();
  });

  // ----------------------------------------------------------
  // 作用域销毁清理
  // ----------------------------------------------------------

  it('effectScope 销毁后应清除 CSS 变量', async () => {
    const { comp } = createMockComputedToken<TestWidgetToken>({
      bgColor: '#FFFFFF',
      textColor: '#333333',
      fontSize: 14,
    });
    mockUseComponentToken.mockReturnValue(comp);

    const scope = effectScope();
    scope.run(() => {
      useCSSVarsBridge('TestWidget', widgetMapping, { target: targetEl });
    });

    await nextTick();
    expect(targetEl.style.getPropertyValue('--tw-bg-color')).toBe('#FFFFFF');

    // 销毁作用域
    scope.stop();
    await nextTick();

    // CSS 变量应全部清除
    expect(targetEl.style.getPropertyValue('--tw-bg-color')).toBe('');
    expect(targetEl.style.getPropertyValue('--tw-text-color')).toBe('');
    expect(targetEl.style.getPropertyValue('--tw-font-size')).toBe('');
  });

  // ----------------------------------------------------------
  // SSR 安全
  // ----------------------------------------------------------

  it('无 document 时不应抛出异常', () => {
    const originalDocument = globalThis.document;
    // 临时隐藏 document
    Object.defineProperty(globalThis, 'document', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { comp } = createMockComputedToken<TestWidgetToken>({
      bgColor: '#FFF',
      textColor: '#000',
      fontSize: 12,
    });
    mockUseComponentToken.mockReturnValue(comp);

    const scope = effectScope();
    expect(() => {
      scope.run(() => {
        useCSSVarsBridge('TestWidget', widgetMapping);
      });
    }).not.toThrow();

    scope.stop();

    // 恢复 document
    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      writable: true,
      configurable: true,
    });
  });

  // ----------------------------------------------------------
  // 空映射
  // ----------------------------------------------------------

  it('映射返回空对象时不应报错', async () => {
    const { comp } = createMockComputedToken<TestWidgetToken>({
      bgColor: '#FFF',
      textColor: '#000',
      fontSize: 12,
    });
    mockUseComponentToken.mockReturnValue(comp);

    const emptyMapping: CSSVarsMapping<TestWidgetToken> = () => ({});

    const scope = effectScope();
    expect(() => {
      scope.run(() => {
        useCSSVarsBridge('TestWidget', emptyMapping, { target: targetEl });
      });
    }).not.toThrow();

    await nextTick();
    scope.stop();
  });
});

// ============================================================
// useCSSVarsBridgeAll
// ============================================================

describe('useCSSVarsBridgeAll', () => {
  let targetEl: HTMLDivElement;

  beforeEach(() => {
    targetEl = document.createElement('div');
    document.body.appendChild(targetEl);
    mockUseComponentToken.mockReset();
  });

  afterEach(() => {
    targetEl.remove();
  });

  it('应一次性桥接多个组件令牌', async () => {
    const widgetToken = createMockComputedToken<TestWidgetToken>({
      bgColor: '#FFFFFF',
      textColor: '#333333',
      fontSize: 14,
    });
    const navToken = createMockComputedToken<TestNavToken>({
      navBg: '#F0F0F0',
      navHeight: 64,
    });

    mockUseComponentToken.mockReturnValueOnce(widgetToken.comp).mockReturnValueOnce(navToken.comp);

    const scope = effectScope();
    scope.run(() => {
      useCSSVarsBridgeAll([
        { name: 'TestWidget', mapping: widgetMapping },
        { name: 'TestNav', mapping: navMapping },
      ], { target: targetEl });
    });

    await nextTick();

    // TestWidget 变量
    expect(targetEl.style.getPropertyValue('--tw-bg-color')).toBe('#FFFFFF');
    expect(targetEl.style.getPropertyValue('--tw-text-color')).toBe('#333333');

    // TestNav 变量
    expect(targetEl.style.getPropertyValue('--tn-nav-bg')).toBe('#F0F0F0');
    expect(targetEl.style.getPropertyValue('--tn-nav-height')).toBe('64px');

    scope.stop();
  });

  it('批量桥接的各组件令牌应各自独立响应式更新', async () => {
    const widgetToken = createMockComputedToken<TestWidgetToken>({
      bgColor: '#FFFFFF',
      textColor: '#333333',
      fontSize: 14,
    });
    const navToken = createMockComputedToken<TestNavToken>({
      navBg: '#F0F0F0',
      navHeight: 64,
    });

    mockUseComponentToken.mockReturnValueOnce(widgetToken.comp).mockReturnValueOnce(navToken.comp);

    const scope = effectScope();
    scope.run(() => {
      useCSSVarsBridgeAll([
        { name: 'TestWidget', mapping: widgetMapping },
        { name: 'TestNav', mapping: navMapping },
      ], { target: targetEl });
    });

    await nextTick();

    // 只更新 navToken
    navToken.source.value = { navBg: '#222222', navHeight: 80 };
    await nextTick();

    // widgetToken 不变
    expect(targetEl.style.getPropertyValue('--tw-bg-color')).toBe('#FFFFFF');
    // navToken 已更新
    expect(targetEl.style.getPropertyValue('--tn-nav-bg')).toBe('#222222');
    expect(targetEl.style.getPropertyValue('--tn-nav-height')).toBe('80px');

    scope.stop();
  });

  it('销毁应一次性清除所有桥接的 CSS 变量', async () => {
    const widgetToken = createMockComputedToken<TestWidgetToken>({
      bgColor: '#FFFFFF',
      textColor: '#333333',
      fontSize: 14,
    });
    const navToken = createMockComputedToken<TestNavToken>({
      navBg: '#F0F0F0',
      navHeight: 64,
    });

    mockUseComponentToken.mockReturnValueOnce(widgetToken.comp).mockReturnValueOnce(navToken.comp);

    const scope = effectScope();
    scope.run(() => {
      useCSSVarsBridgeAll([
        { name: 'TestWidget', mapping: widgetMapping },
        { name: 'TestNav', mapping: navMapping },
      ], { target: targetEl });
    });

    await nextTick();
    expect(targetEl.style.getPropertyValue('--tw-bg-color')).toBe('#FFFFFF');
    expect(targetEl.style.getPropertyValue('--tn-nav-bg')).toBe('#F0F0F0');

    scope.stop();
    await nextTick();

    // 全部清除
    expect(targetEl.style.getPropertyValue('--tw-bg-color')).toBe('');
    expect(targetEl.style.getPropertyValue('--tw-text-color')).toBe('');
    expect(targetEl.style.getPropertyValue('--tn-nav-bg')).toBe('');
    expect(targetEl.style.getPropertyValue('--tn-nav-height')).toBe('');
  });

  it('空数组不应报错', () => {
    const scope = effectScope();
    expect(() => {
      scope.run(() => {
        useCSSVarsBridgeAll([], { target: targetEl });
      });
    }).not.toThrow();
    scope.stop();
  });
});
