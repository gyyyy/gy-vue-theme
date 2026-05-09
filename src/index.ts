/**
 * GY Vue Theme — 公开 API 入口
 *
 * 基于设计令牌的 Vue 主题开发库。
 * 提供三层令牌架构、主题引擎、CSS 变量集成。
 */

// ============================================================
// 令牌接口（类型导出）
// ============================================================

export type { SeedToken } from './token/interface/seed';
export type {
  BaseToken,
  ColorMapToken,
  FontMapToken,
  SizeMapToken,
  HeightMapToken,
  StyleMapToken,
  CommonMapToken,
} from './token/interface/base';
export type { SemanticToken } from './token/interface/semantic';
export type { ComponentTokenMap, ComponentTokenDefinition } from './token/interface/component';
export type { ColorPalettes, PresetColorName, PresetColorKey } from './token/presetColors';

// ============================================================
// 令牌常量
// ============================================================

export { PRESET_COLOR_NAMES } from './token/presetColors';
export { defaultSeedToken } from './token/seed';

// ============================================================
// 主题引擎
// ============================================================

// 核心类型
export type {
  ThemeMode,
  ColorDerivativeFunc,
  ThemeDefinition,
  ThemeConfig,
  ResolvedTheme,
} from './theme/interface';

// 主题定义
export { defineTheme, defaultTheme } from './theme/defineTheme';

// 令牌计算
export { resolveTheme, getDesignToken, hashToken } from './theme/useToken';

// ThemeProvider 与组合函数
export {
  ThemeProvider,
  useThemeToken,
  useThemeConfig,
  useResolvedTheme,
  useThemeMode,
} from './theme/context';

// 组件令牌工具
export {
  defineComponentToken,
  registerComponentToken,
  useComponentToken,
} from './theme/useComponentToken';

// CSS 变量桥接
export {
  useCSSVarsBridge,
  useCSSVarsBridgeAll,
} from './theme/useCSSVarsBridge';
export type {
  CSSVarsMapping,
  CSSVarsBridgeOptions,
} from './theme/useCSSVarsBridge';

// 样式增强
export { useStyleEnhancer } from './theme/useStyleEnhancer';
export type { StyleEnhancer } from './theme/useStyleEnhancer';
export type { StyleValue, BaseStyle } from './theme/interface';

// 主题偏好持久化
export { useThemeStorage } from './theme/useThemeStorage';
export type {
  ThemePreference,
  ThemeStorageOptions,
  StorageLike,
  ThemeStorageReturn,
} from './theme/useThemeStorage';

// ============================================================
// 内置算法
// ============================================================

export { defaultLightAlgorithm } from './token/themes/light/index';
export { defaultDarkAlgorithm } from './token/themes/dark/index';
export { applyCompact } from './token/themes/compact';
export { generateLightPalette, generateDarkPalette } from './token/themes/shared/genColorPalette';

// ============================================================
// CSS 变量（语义令牌 → --gy-* CSS 自定义属性）
// ============================================================

export {
  tokenToCSSVars,
  cssVarsToString,
  injectCSSVars,
  removeCSSVars,
  clearAllCSSVars,
  dumpCSSVars,
  cssVar,
  cssVarName,
  themeVars,
  createThemeVars,
} from './theme/index';

// ============================================================
// 工具函数
// ============================================================

export {
  getRbgValue,
  getAlphaColor,
  getAlphaColorOnBg,
  resolveAlphaColor,
  lighten,
  darken,
  mixColors,
} from './util/color';
