/**
 * Token → CSS 变量转换
 *
 * 将令牌对象转换为 CSS 自定义属性键值对。
 */

import type { SemanticToken } from '@/token/interface/semantic';

/**
 * 无需追加 px 单位的属性集合
 *
 * 这些属性的值是比例值、层级值或不透明度，不需要 px 单位。
 */
const UNITLESS_PROPERTIES = new Set([
  'lineHeight',
  'lineHeightSM',
  'lineHeightLG',
  'lineHeightHeading1',
  'lineHeightHeading2',
  'lineHeightHeading3',
  'lineHeightHeading4',
  'lineHeightHeading5',
  'fontWeightStrong',
  'opacityImage',
  'opacityLoading',
  'zIndexBase',
  'zIndexPopupBase',
]);

/**
 * 将 camelCase 转换为 kebab-case
 *
 * @param str - camelCase 字符串
 * @returns kebab-case 字符串
 *
 * @example
 * ```typescript
 * camelToKebab('colorPrimary')     // → 'color-primary'
 * camelToKebab('fontSizeHeading1') // → 'font-size-heading-1'
 * camelToKebab('blue1')            // → 'blue-1'
 * camelToKebab('marginSM')        // → 'margin-sm'
 * camelToKebab('screenXSMax')     // → 'screen-xs-max'
 * ```
 */
export function camelToKebab(str: string): string {
  return str
    // 连续大写字母后跟大写+小写时，在缩写与单词边界插入连字符：XSMax → XS-Max
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // 小写字母或数字后跟大写字母时插入连字符：marginXS → margin-XS
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // 字母与数字边界插入连字符：blue1 → blue-1、heading1 → heading-1
    .replace(/([a-z])(\d)/g, '$1-$2')
    .toLowerCase();
}

/**
 * 格式化令牌值为 CSS 变量值
 *
 * @param key - 令牌属性名
 * @param value - 令牌值
 * @returns 格式化后的 CSS 值字符串
 */
function formatCSSValue(key: string, value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    if (UNITLESS_PROPERTIES.has(key)) {
      return String(value);
    }
    return `${value}px`;
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  return String(value);
}

/**
 * 将令牌对象转换为 CSS 变量声明
 *
 * @param token - 语义化令牌
 * @param prefix - CSS 变量前缀（默认 'gy'）
 * @returns CSS 变量键值对映射
 *
 * @example
 * ```typescript
 * tokenToCSSVars(token, 'gy')
 * // → { '--gy-color-primary': '#1677FF', '--gy-font-size': '14px', ... }
 * ```
 */
export function tokenToCSSVars(token: SemanticToken, prefix: string = 'gy'): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [key, value] of Object.entries(token)) {
    // 跳过非原始值和 undefined/null
    if (value === undefined || value === null || typeof value === 'object') {
      continue;
    }

    const name = `--${prefix}-${camelToKebab(key)}`;
    vars[name] = formatCSSValue(key, value);
  }

  return vars;
}

/**
 * 将 CSS 变量映射生成 CSS 文本
 *
 * @param vars - CSS 变量键值对
 * @param selector - CSS 选择器
 * @returns CSS 文本
 */
export function cssVarsToString(vars: Record<string, string>, selector: string = ':root'): string {
  const declarations = Object.entries(vars).map(([key, value]) => `  ${key}: ${value};`).join('\n');

  return `${selector} {\n${declarations}\n}`;
}
