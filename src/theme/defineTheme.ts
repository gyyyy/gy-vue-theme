/**
 * 主题定义工厂
 *
 * 提供 defineTheme() 函数创建冻结的主题定义对象，
 * 以及内置的默认主题。
 */

import type { ThemeDefinition } from './interface';
import { defaultLightAlgorithm } from '@/token/themes/light/index';
import { defaultDarkAlgorithm } from '@/token/themes/dark/index';

/**
 * 定义一个主题
 *
 * 由主题开发者调用，创建包含色彩算法的完整主题定义。
 * 返回的对象是冻结的（Object.freeze），不可修改。
 *
 * 主题仅定义"视觉基调"：种子令牌（品牌色、字号等）和色彩算法，
 * 必要时可通过 semanticToken 精确覆盖部分语义值。
 * 组件层的适配（如 Ant Design、Element Plus）由独立的组件令牌定义完成，
 * 与主题正交：任何新主题都能自动应用到已有的组件适配上。
 *
 * @param options - 主题定义选项
 * @returns 冻结的主题定义对象
 *
 * @example
 * ```typescript
 * import { defineTheme, defaultLightAlgorithm, defaultDarkAlgorithm } from 'gy-vue-theme'
 *
 * // 最简单的主题 — 仅覆盖种子令牌
 * const simpleTheme = defineTheme({
 *   name: 'simple',
 *   token: { colorPrimary: '#00B96B' },
 * })
 *
 * // 完整主题 — 种子令牌 + 亮/暗色派生算法 + 语义覆盖
 * const techBlue = defineTheme({
 *   name: '科技蓝',
 *   token: { colorPrimary: '#1890FF' },
 *   algorithm: {
 *     light: defaultLightAlgorithm,
 *     dark: defaultDarkAlgorithm,
 *   },
 *   semanticToken: {
 *     common: { controlItemBgActive: '#BAE7FF' },
 *     light: { colorBgLayout: '#F6F8FA' },
 *     dark: { colorBgLayout: '#0D1117' },
 *   },
 * })
 * ```
 */
export function defineTheme(options: ThemeDefinition): Readonly<ThemeDefinition> {
  return Object.freeze({ ...options });
}

/**
 * 内置默认主题
 *
 * 使用默认种子令牌、内置亮色和暗色派生算法。
 */
export const defaultTheme: Readonly<ThemeDefinition> = defineTheme({
  name: 'default',
  algorithm: {
    light: defaultLightAlgorithm,
    dark: defaultDarkAlgorithm,
  },
});
