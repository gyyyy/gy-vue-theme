/**
 * 主题引擎入口
 *
 * 导出主题引擎的所有公开 API。
 */

// 核心类型
export type {
  ThemeMode,
  ColorDerivativeFunc,
  ThemeDefinition,
  ThemeConfig,
  ResolvedTheme,
} from './interface';

// 主题定义
export { defineTheme, defaultTheme } from './defineTheme';

// 令牌计算
export { resolveTheme, getDesignToken, hashToken } from './useToken';

// ThemeProvider 与组合函数
export {
  ThemeProvider,
  useThemeToken,
  useThemeConfig,
  useResolvedTheme,
  useThemeMode,
} from './context';

// 组件令牌工具
export {
  defineComponentToken,
  registerComponentToken,
  useComponentToken,
} from './useComponentToken';

// CSS 变量桥接（组件令牌 → 第三方框架 CSS 变量）
export {
  useCSSVarsBridge,
  useCSSVarsBridgeAll,
} from './useCSSVarsBridge';
export type {
  CSSVarsMapping,
  CSSVarsBridgeOptions,
} from './useCSSVarsBridge';

// 样式增强（语义令牌 → 任意 CSS 规则注入）
export { useStyleEnhancer } from './useStyleEnhancer';
export type { StyleEnhancer } from './useStyleEnhancer';

// CSS 变量注入（语义令牌 → --gy-* CSS 自定义属性）
export { tokenToCSSVars, cssVarsToString } from './transformToken';
export { injectCSSVars, removeCSSVars, clearAllCSSVars, dumpCSSVars } from './injectStyles';

// CSS 变量名辅助（带类型提示的 CSS 变量引用）
export { cssVar, cssVarName, themeVars, createThemeVars } from './cssVar';
export type { ThemeVars } from './cssVar';

export { useThemeStorage } from './useThemeStorage';
export type {
  ThemePreference,
  ThemeStorageOptions,
  StorageLike,
  ThemeStorageReturn,
} from './useThemeStorage';
