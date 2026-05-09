/**
 * CSS 变量引用辅助工具
 *
 * 提供静态对象和函数，让应用开发者通过 SemanticToken 属性名获取对应的 CSS 变量名，
 * 无需手写 kebab-case 变量名，享受完整的 TypeScript 自动补全。
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { themeVars as v } from 'gy-vue-theme'
 * </script>
 *
 * <template>
 *   <div :style="{ background: `var(${v.colorBgLayout})`, color: `var(${v.colorText})` }">
 *     主题感知内容
 *   </div>
 * </template>
 *
 * <style scoped>
 * .card {
 *   background: var(v-bind('v.colorBgContainer'));
 *   border: 1px solid var(v-bind('v.colorBorderSecondary'));
 * }
 * </style>
 * ```
 */

import type { SemanticToken } from '@/token/interface/semantic';
import { camelToKebab } from './transformToken';

// ============================================================
// 类型定义
// ============================================================

/**
 * 语义令牌的 CSS 变量名映射
 *
 * 每个属性对应一个 `--prefix-kebab-name` 字符串。
 * 属性名与 SemanticToken 完全一致，提供完整自动补全。
 */
export type ThemeVars = { readonly [K in keyof SemanticToken]: string };

// ============================================================
// 预置对象
// ============================================================

/**
 * 创建语义令牌的 CSS 变量名映射对象
 *
 * 返回一个 Proxy 对象，通过点号访问任意 SemanticToken 属性名，
 * 自动返回对应的 `--prefix-kebab-name` 字符串。
 *
 * @param prefix - CSS 变量前缀（默认 `'gy'`）
 * @returns 带完整类型提示的 CSS 变量名对象
 *
 * @example
 * ```typescript
 * const appVars = createThemeVars('app')
 * appVars.colorPrimary  // → '--app-color-primary'
 * ```
 */
export function createThemeVars(prefix: string = 'gy'): ThemeVars {
  return new Proxy({} as ThemeVars, {
    get(_, key: string) {
      return `--${prefix}-${camelToKebab(key)}`;
    },
  });
}

/**
 * 默认前缀（`gy`）的 CSS 变量名映射对象
 *
 * 通过点号访问 SemanticToken 属性名，返回 `--gy-*` CSS 变量名。
 * 类型安全，支持完整自动补全。
 *
 * @example
 * ```typescript
 * import { themeVars as v } from 'gy-vue-theme'
 *
 * // 直接获取变量名
 * v.colorPrimary        // → '--gy-color-primary'
 * v.colorBgLayout       // → '--gy-color-bg-layout'
 * v.colorText           // → '--gy-color-text'
 * v.fontSize            // → '--gy-font-size'
 *
 * // 在 JS 中使用
 * el.style.setProperty(v.colorPrimary, '#FF0000')
 *
 * // 在模板中使用
 * // :style="{ color: `var(${v.colorText})` }"
 *
 * // 在 <style> 中通过 v-bind 使用
 * // background: var(v-bind('v.colorBgContainer'));
 * ```
 */
export const themeVars: ThemeVars = createThemeVars();

// ============================================================
// 函数式 API
// ============================================================

/**
 * 获取语义令牌对应的 CSS 变量引用（`var(--prefix-kebab-name)`）
 *
 * 适用于需要完整 `var()` 引用的场景，支持回退值。
 *
 * @param key - SemanticToken 属性名
 * @param prefix - CSS 变量前缀（默认 `'gy'`）
 * @param fallback - 可选的回退值
 * @returns CSS `var()` 引用字符串
 *
 * @example
 * ```typescript
 * cssVar('colorPrimary')                  // → 'var(--gy-color-primary)'
 * cssVar('colorPrimary', 'gy', '#1890FF') // → 'var(--gy-color-primary, #1890FF)'
 * ```
 */
export function cssVar(key: keyof SemanticToken, prefix: string = 'gy', fallback?: string): string {
  const name = `--${prefix}-${camelToKebab(key)}`;
  return fallback !== undefined ? `var(${name}, ${fallback})` : `var(${name})`;
}

/**
 * 获取语义令牌对应的 CSS 变量名（`--prefix-kebab-name`）
 *
 * `themeVars` 的函数版本，参数有类型检查。
 *
 * @param key - SemanticToken 属性名
 * @param prefix - CSS 变量前缀（默认 `'gy'`）
 * @returns CSS 变量名字符串
 */
export function cssVarName(key: keyof SemanticToken, prefix: string = 'gy'): string {
  return `--${prefix}-${camelToKebab(key)}`;
}
