/**
 * 样式增强组合函数
 *
 * 提供超越 CSS 变量映射的深度定制能力。
 * 增强函数接收语义令牌，返回任意 CSS 文本，
 * 通过 <style> 标签注入到 DOM，并随主题变化响应式更新。
 *
 * 架构定位：
 * - 语义令牌：定义通用设计变量（颜色、尺寸等）
 * - CSS 变量桥接（useCSSVarsBridge）：映射到框架已有 CSS 变量
 * - 样式增强（useStyleEnhancer）：注入任意 CSS 规则，突破框架原有样式限制
 *
 * 使用场景（由框架适配器或主题开发者定义）：
 * - 给 Card 组件添加左边线
 * - 给 Button 添加阴影效果
 * - 添加自定义 hover/transition 效果
 * - 重写组件整体视觉风格
 *
 * @example
 * ```typescript
 * // 框架适配器定义增强
 * const cardBorderEnhancer: StyleEnhancer = (token) => `
 *   .el-card {
 *     border-left: 3px solid ${token.colorPrimary};
 *   }
 * `;
 *
 * // 在 ThemeProvider 上下文中使用
 * useStyleEnhancer([cardBorderEnhancer, buttonShadowEnhancer]);
 *
 * // 或通过 ThemeProvider 的 enhancers prop
 * // <ThemeProvider :config="config" :enhancers="[cardBorderEnhancer]">
 * ```
 */

import { watchEffect, onScopeDispose, getCurrentScope } from 'vue';
import type { StyleValue } from './interface';
import { useThemeToken } from './context';
import { injectCSSVars, removeCSSVars, newStyleId } from './injectStyles';

/**
 * 样式增强器（高优先级，组件级定制）
 *
 * 与 `bridge` 同级的可选 prop，负责在 CSS 变量之后注入（`gy-enhance-*`），
 * 对具体 UI 组件做最终的视觉调整。
 * 接收完整 SemanticToken，可动态生成 CSS，也可传入静态字符串。
 *
 * ```typescript
 * const cardBorder: StyleEnhancer = (token) => `
 *   .el-card { border-left: 3px solid ${token.colorPrimary}; }
 * `
 * ```
 */
export type StyleEnhancer = StyleValue;

// ============================================================
// 内部状态
// ============================================================

// ============================================================
// 组合函数
// ============================================================

/**
 * 使用样式增强
 *
 * 将一组样式增强函数注入为 `<style>` 标签。
 * 当语义令牌变化时（如主题切换、模式切换）自动重新生成并更新注入的样式。
 * effectScope 销毁时自动清理。
 *
 * 必须在 ThemeProvider 子树中调用（需要 inject 语义令牌上下文）。
 *
 * @param enhancers - 样式增强函数或函数数组
 *
 * @example
 * ```typescript
 * // 在 ThemeProvider 内部的组件 setup 中调用
 * import { useStyleEnhancer } from 'gy-vue-theme'
 *
 * useStyleEnhancer([
 *   (token) => `html .el-card { border-left: 3px solid ${token.colorPrimary}; }`,
 *   (token) => `html .el-button { box-shadow: 0 2px 4px ${token.colorPrimaryBg}; }`,
 * ])
 *
 * // 单个增强函数
 * useStyleEnhancer((token) => `
 *   html .el-card { border-left: 3px solid ${token.colorPrimary}; }
 * `)
 * ```
 */
export function useStyleEnhancer(enhancers: StyleEnhancer | StyleEnhancer[]): void {
  if (typeof document === 'undefined') return;

  const fns = Array.isArray(enhancers) ? enhancers : [enhancers];
  if (fns.length === 0) return;

  const semanticToken = useThemeToken();
  const id = `gy-enhance-${newStyleId()}`;

  const stop = watchEffect(() => {
    const token = semanticToken.value;
    const css = fns
      .map((fn) => (typeof fn === 'string' ? fn : fn(token)))
      .filter(Boolean)
      .join('\n');
    if (css) {
      injectCSSVars(css, id);
    } else {
      removeCSSVars(id);
    }
  });

  if (getCurrentScope()) {
    onScopeDispose(() => {
      stop();
      removeCSSVars(id);
    });
  }
}
