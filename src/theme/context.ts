/**
 * ThemeProvider 组件与组合函数
 *
 * 提供 Vue 的主题上下文管理：
 * - ThemeProvider：主题提供者组件
 * - useThemeToken：获取语义令牌
 * - useThemeConfig：获取主题配置
 * - useResolvedTheme：获取完整解析后主题
 * - useThemeMode：获取当前颜色模式
 */

import { defineComponent, computed, provide, inject, watchEffect, onScopeDispose, getCurrentScope, h, type PropType, type InjectionKey, type ComputedRef } from 'vue';
import type { SemanticToken } from '@/token/interface/semantic';
import type { ThemeConfig, ThemeMode, ResolvedTheme } from './interface';
import { resolveTheme } from './useToken';
import { tokenToCSSVars, cssVarsToString } from './transformToken';
import { injectCSSVars, removeCSSVars, newStyleId } from './injectStyles';
import { useStyleEnhancer, type StyleEnhancer } from './useStyleEnhancer';

// ============================================================
// 注入键
// ============================================================

/** 语义令牌注入键 */
const THEME_TOKEN_KEY: InjectionKey<ComputedRef<SemanticToken>> = Symbol('gy-theme-token');

/** 主题配置注入键 */
const THEME_CONFIG_KEY: InjectionKey<ComputedRef<ThemeConfig>> = Symbol('gy-theme-config');

/** 解析后的完整主题注入键 */
const THEME_RESOLVED_KEY: InjectionKey<ComputedRef<ResolvedTheme>> = Symbol('gy-theme-resolved');

// ============================================================
// 深合并工具
// ============================================================

/**
 * 深合并组件令牌配置
 *
 * @param parent - 父级配置
 * @param child - 子级配置
 * @returns 合并后的配置
 */
function mergeComponentToken(parent: ThemeConfig['componentToken'], child: ThemeConfig['componentToken']): ThemeConfig['componentToken'] {
  if (!parent && !child) return undefined;
  if (!parent) return child;
  if (!child) return parent;

  const merged = { ...parent } as Record<string, Record<string, unknown>>;
  const childRecord = child as Record<string, Record<string, unknown>>;
  for (const key of Object.keys(childRecord)) {
    if (key in merged) {
      merged[key] = { ...merged[key], ...childRecord[key] };
    } else {
      merged[key] = { ...childRecord[key] };
    }
  }
  return merged as ThemeConfig['componentToken'];
}

/**
 * 合并主题配置
 *
 * 内层 ThemeProvider 仅覆盖其指定的配置项，未指定的继承外层值。
 *
 * @param parent - 父级主题配置
 * @param child - 子级主题配置
 * @returns 合并后的主题配置
 */
function mergeThemeConfig(parent: ThemeConfig, child: ThemeConfig): ThemeConfig {
  const mergedSeedToken = (parent.seedToken !== undefined || child.seedToken !== undefined)
    ? {
        common: {
          ...(parent.seedToken?.common ?? {}),
          ...(child.seedToken?.common ?? {}),
        },
        light: parent.seedToken?.light || child.seedToken?.light
          ? {
              ...(parent.seedToken?.light ?? {}),
              ...(child.seedToken?.light ?? {}),
            }
          : undefined,
        dark: parent.seedToken?.dark || child.seedToken?.dark
          ? {
              ...(parent.seedToken?.dark ?? {}),
              ...(child.seedToken?.dark ?? {}),
            }
          : undefined,
      }
    : undefined;

  return {
    theme: child.theme ?? parent.theme,
    mode: child.mode ?? parent.mode,
    compact: child.compact ?? parent.compact,
    seedToken: mergedSeedToken,
    componentToken: mergeComponentToken(parent.componentToken, child.componentToken),
    cssVar: child.cssVar !== undefined ? child.cssVar : parent.cssVar,
  };
}

// ============================================================
// ThemeProvider 组件
// ============================================================

/**
 * 主题提供者组件
 *
 * 接收主题配置，计算令牌并通过 provide 注入到子组件树。
 * 支持嵌套使用，内层会继承并覆盖外层的主题配置。
 *
 * 通过 `bridge` prop 可以传入 CSS 变量桥接函数，
 * 无需手动创建子桥接组件。
 *
 * @example
 * ```vue
 * <template>
 *   <ThemeProvider :config="themeConfig" :bridge="[useElementPlusCSSVars]">
 *     <App />
 *   </ThemeProvider>
 * </template>
 * ```
 */
export const ThemeProvider = defineComponent({
  name: 'ThemeProvider',

  props: {
    /** 主题配置 */
    config: {
      type: Object as PropType<ThemeConfig>,
      default: () => ({}),
    },
    /**
     * CSS 变量桥接函数
     *
     * 这些函数会在 ThemeProvider 的子组件上下文中自动执行，
     * 因此可以正确地 inject 到主题令牌。
     * 传入适配器提供的桥接函数即可完成 CSS 变量注入。
     *
     * @example
     * ```vue
     * <ThemeProvider :config="config" :bridge="useElementPlusCSSVars">
     * <ThemeProvider :config="config" :bridge="[useElementPlusCSSVars, useNaiveUICSSVars]">
     * ```
     */
    bridge: {
      type: [Function, Array] as PropType<(() => void) | (() => void)[]>,
      default: undefined,
    },

    /**
     * 样式增强函数
     *
     * 超越 CSS 变量映射的深度定制能力。
     * 增强函数接收语义令牌，返回任意 CSS 文本，
     * 通过 `<style>` 标签注入到 DOM，并随主题变化响应式更新。
     *
     * 适用于框架适配器或主题开发者定义的深度样式定制，
     * 如给组件添加边框、阴影、渐变背景、过渡动画等。
     *
     * @example
     * ```vue
     * <ThemeProvider :config="config" :enhancers="cardBorderEnhancer">
     * <ThemeProvider :config="config" :enhancers="[cardEnhancer, buttonEnhancer]">
     * ```
     */
    enhancers: {
      type: [Function, Array] as PropType<StyleEnhancer | StyleEnhancer[]>,
      default: undefined,
    },
  },

  setup(props, { slots }) {
    // 1. 获取上层主题配置（嵌套支持）
    const parentConfig = inject(THEME_CONFIG_KEY, undefined);

    // 2. 合并配置
    const mergedConfig = computed<ThemeConfig>(() => {
      if (parentConfig) {
        return mergeThemeConfig(parentConfig.value, props.config);
      }
      return props.config;
    });

    // 3. 解析主题，计算令牌
    const resolved = computed<ResolvedTheme>(() => {
      return resolveTheme(mergedConfig.value);
    });

    // 4. 提取语义令牌
    const semanticToken = computed<SemanticToken>(() => {
      return resolved.value.semanticToken;
    });

    // 5. provide 注入
    provide(THEME_TOKEN_KEY, semanticToken);
    provide(THEME_CONFIG_KEY, mergedConfig);
    provide(THEME_RESOLVED_KEY, resolved);

    // 6. 样式注入
    //    顺序决定优先级（先注入优先级低），依次为：
    //    a. baseStyles（主题自带的重置/基础样式，最先注入 = 最低优先级）
    //    b. CSS 变量（--gy-* 语义令牌变量）
    //    c. enhancers（由 _ThemeBridge 子组件注入，最后 = 最高优先级）
    const _instanceId = newStyleId();
    const baseStylesId = `gy-base-${_instanceId}`;
    const themeId = `gy-theme-${_instanceId}`;

    // 6a. baseStyles 注入（最低优先级）
    const stopBase = watchEffect(() => {
      if (typeof document === 'undefined') return;

      const rawBaseStyles = mergedConfig.value.theme?.baseStyles;
      if (!rawBaseStyles) {
        removeCSSVars(baseStylesId);
        return;
      }

      const token = semanticToken.value;
      const items = Array.isArray(rawBaseStyles) ? rawBaseStyles : [rawBaseStyles];
      const css = items
        .map((s) => (typeof s === 'string' ? s : s(token)))
        .filter(Boolean)
        .join('\n');

      if (css) {
        injectCSSVars(css, baseStylesId);
      } else {
        removeCSSVars(baseStylesId);
      }
    });

    if (getCurrentScope()) {
      onScopeDispose(() => {
        stopBase();
        if (typeof document !== 'undefined') {
          removeCSSVars(baseStylesId);
        }
      });
    }

    // 6b. CSS 变量自动注入
    //    当 cssVar 未设为 false 时，自动将语义令牌注入为 --gy-* CSS 变量
    //    使用稳定的实例 ID，确保 token 变化时复用同一 <style> 标签
    const stop = watchEffect(() => {
      if (typeof document === 'undefined') return;

      const cssVarConfig = resolved.value.cssVar;
      if (cssVarConfig === false) {
        // 禁用时移除已有的 style 标签
        removeCSSVars(themeId);
        return;
      }

      const prefix = cssVarConfig?.prefix ?? 'gy';
      const selector = cssVarConfig?.selector ?? ':root';

      const vars = tokenToCSSVars(resolved.value.semanticToken, prefix);
      const css = cssVarsToString(vars, selector);
      injectCSSVars(css, themeId);
    });

    if (getCurrentScope()) {
      onScopeDispose(() => {
        stop();
        if (typeof document !== 'undefined') {
          removeCSSVars(themeId);
        }
      });
    }

    // 7. 渲染
    //    如果传入了 bridge prop，创建一个内部桥接子组件来执行这些函数。
    //    桥接函数（如 useElementPlusCSSVars）需要 inject 主题上下文，
    //    而 Vue 中 inject 只能获取父级的 provide，因此必须在子组件中执行。
    return () => {
      const children = slots.default?.();

      if (!props.bridge && !props.enhancers) {
        return children;
      }

      const fns: (() => void)[] = [];

      if (props.bridge) {
        const bridges = Array.isArray(props.bridge) ? props.bridge : [props.bridge];
        fns.push(...bridges);
      }

      if (props.enhancers) {
        const enhancers = props.enhancers;
        fns.push(() => useStyleEnhancer(enhancers));
      }

      return h(_ThemeBridge, { fns: fns }, { default: () => children });
    };
  },
});

/**
 * 内部桥接组件
 *
 * 作为 ThemeProvider 的子组件运行 setup 函数，
 * 确保这些函数能正确 inject 主题上下文。
 *
 * @internal
 */
const _ThemeBridge = defineComponent({
  name: '_ThemeBridge',
  props: {
    fns: {
      type: Array as PropType<(() => void)[]>,
      required: true,
    },
  },
  setup(props, { slots }) {
    // 执行所有桥接函数
    props.fns.forEach((fn) => fn());
    return () => slots.default?.();
  },
});

// ============================================================
// 组合函数
// ============================================================

/**
 * 获取当前主题的语义化令牌
 *
 * 必须在 ThemeProvider 子树中使用。
 * 返回响应式引用，主题/模式变化时自动更新。
 *
 * @returns 语义化令牌的 ComputedRef
 */
export function useThemeToken(): ComputedRef<SemanticToken> {
  const token = inject(THEME_TOKEN_KEY, undefined);
  if (!token) {
    console.warn('[gy-vue-theme] useThemeToken() 必须在 <ThemeProvider> 内使用，返回默认主题令牌。');
    return computed(() => resolveTheme().semanticToken);
  }
  return token;
}

/**
 * 获取当前生效的主题配置
 *
 * @returns 主题配置的 ComputedRef
 */
export function useThemeConfig(): ComputedRef<ThemeConfig> {
  const config = inject(THEME_CONFIG_KEY, undefined);
  if (!config) {
    console.warn('[gy-vue-theme] useThemeConfig() 必须在 <ThemeProvider> 内使用，返回默认主题配置。');
    return computed(() => ({}));
  }
  return config;
}

/**
 * 获取完整的解析后主题对象
 *
 * 包含种子令牌、基础令牌、语义令牌、模式信息等全部信息。
 * 通常用于高级场景或调试。
 *
 * @returns 解析后主题的 ComputedRef
 */
export function useResolvedTheme(): ComputedRef<ResolvedTheme> {
  const resolved = inject(THEME_RESOLVED_KEY, undefined);
  if (!resolved) {
    console.warn('[gy-vue-theme] useResolvedTheme() 必须在 <ThemeProvider> 内使用，返回默认解析后主题。');
    return computed(() => resolveTheme());
  }
  return resolved;
}

/**
 * 获取当前颜色模式
 *
 * @returns 当前模式的 ComputedRef
 */
export function useThemeMode(): ComputedRef<ThemeMode> {
  const resolved = inject(THEME_RESOLVED_KEY, undefined);
  if (!resolved) {
    console.warn('[gy-vue-theme] useThemeMode() 必须在 <ThemeProvider> 内使用，返回默认模式。');
    return computed(() => 'light' as ThemeMode);
  }
  return computed(() => resolved.value.mode);
}
