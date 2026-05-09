/**
 * CSS 变量桥接组合函数
 *
 * 提供通用的 CSS 变量桥接能力，让适配者只需定义映射函数，
 * watchEffect、DOM 注入/清除、生命周期管理全部由库内部处理。
 *
 * 架构：ComponentToken → 映射函数 → CSS 自定义属性
 *
 * 支持两种注入模式：
 * 1. 元素模式（默认）：通过 style.setProperty 直接注入到 target 元素
 * 2. 选择器模式：通过 <style> 标签注入带选择器的 CSS 规则
 *    适用于需要覆盖组件级 CSS 变量的场景
 */

import { watchEffect, onScopeDispose, getCurrentScope } from 'vue';
import type { ComponentTokenMap } from '@/token/interface/component';
import { useComponentToken } from './useComponentToken';
import { injectCSSVars, removeCSSVars, newStyleId } from './injectStyles';

// ============================================================
// 类型
// ============================================================

/**
 * CSS 变量映射函数
 *
 * 接收组件令牌对象，返回 CSS 变量名 → 值的映射表。
 *
 * @typeParam Token - 组件令牌类型
 *
 * @example
 * ```typescript
 * const mapping: CSSVarsMapping<ElGlobalToken> = (token) => ({
 *   '--el-color-primary': token.colorPrimary,
 *   '--el-font-size-base': `${token.fontSizeBase}px`,
 * })
 * ```
 */
export type CSSVarsMapping<Token> = (token: Token) => Record<string, string>;

/**
 * CSS 变量桥接配置
 */
export interface CSSVarsBridgeOptions {
  /**
   * 挂载目标元素，默认 document.documentElement
   *
   * 仅在元素模式（未指定 selector）下生效。
   */
  target?: HTMLElement;

  /**
   * CSS 选择器，指定后使用 `<style>` 标签注入模式
   *
   * 适用于组件级 CSS 变量覆盖。
   * 会自动添加 `html` 前缀以确保优先级高于组件自身的 CSS 变量定义。
   *
   * @example
   * ```typescript
   * // 覆盖 Button 组件的 CSS 变量
   * useCSSVarsBridge('ElButton', mapping, { selector: '.el-button' })
   * // 生成: html .el-button { --el-button-bg-color: ...; }
   * ```
   */
  selector?: string;
}

// ============================================================
// DOM 工具
// ============================================================

/**
 * 将 CSS 变量注入到指定 DOM 元素
 */
function applyVars(e: HTMLElement, vars: Record<string, string>): void {
  for (const [key, value] of Object.entries(vars)) {
    e.style.setProperty(key, value);
  }
}

/**
 * 清除指定 DOM 元素上的 CSS 变量
 */
function removeVars(e: HTMLElement, vars: Record<string, string>): void {
  for (const key of Object.keys(vars)) {
    e.style.removeProperty(key);
  }
}

/**
 * 将 CSS 变量映射对象转为 CSS 规则文本
 *
 * @param selector - CSS 选择器
 * @param vars - CSS 变量键值对
 * @returns CSS 规则文本
 */
function varsToCSS(selector: string, vars: Record<string, string>): string {
  const props = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `${selector} {\n${props}\n}`;
}

// ============================================================
// 组合函数
// ============================================================

/**
 * 将组件令牌桥接为 CSS 自定义属性
 *
 * 在 ThemeProvider 内部的 Vue setup 中调用。
 * 自动获取指定组件令牌、执行映射、注入 DOM，并在主题变化时响应式更新。
 *
 * 支持两种模式：
 * - **元素模式**（默认）：通过 style.setProperty 直接注入到 target 元素，适用于全局变量
 * - **选择器模式**：通过 `<style>` 标签注入，适用于组件级 CSS 变量覆盖
 *
 * @typeParam Key - 组件名称（ComponentTokenMap 的键）
 * @param name - 组件令牌名称
 * @param mapping - CSS 变量映射函数
 * @param options - 配置选项
 *
 * @example
 * ```typescript
 * // 全局变量（元素模式）
 * useCSSVarsBridge('ElGlobal', mapGlobalVars)
 *
 * // 组件变量（选择器模式）
 * useCSSVarsBridge('ElButton', mapButtonVars, { selector: '.el-button' })
 * ```
 */
export function useCSSVarsBridge<Key extends keyof ComponentTokenMap>(name: Key, mapping: CSSVarsMapping<ComponentTokenMap[Key]>, options: CSSVarsBridgeOptions = {}): void {
  const { selector } = options;

  // 选择器模式：通过 <style> 标签注入
  if (selector) {
    if (typeof document === 'undefined') return;

    const componentToken = useComponentToken(name);
    const id = `gy-bridge-${name}-${newStyleId()}`;
    // 使用 html 前缀提高优先级，确保覆盖组件自身定义的 CSS 变量
    // 对逗号分隔的多选择器逐一加前缀，保证每个选择器都有正确的特异性
    const fullSelector = selector.split(',').map(s => `html ${s.trim()}`).join(', ');

    const stop = watchEffect(() => {
      const vars = mapping(componentToken.value);
      const cssText = varsToCSS(fullSelector, vars);
      injectCSSVars(cssText, id);
    });

    if (getCurrentScope()) {
      onScopeDispose(() => {
        stop();
        removeCSSVars(id);
      });
    }
    return;
  }

  // 元素模式：通过 style.setProperty 直接注入
  const target = options.target ?? (typeof document !== 'undefined' ? document.documentElement : null);
  if (!target) return;

  const componentToken = useComponentToken(name);

  let lastVars: Record<string, string> = {};

  const stop = watchEffect(() => {
    // 清除旧变量
    removeVars(target, lastVars);
    // 从组件令牌生成新变量
    lastVars = mapping(componentToken.value);
    // 注入新变量
    applyVars(target, lastVars);
  });

  if (getCurrentScope()) {
    onScopeDispose(() => {
      stop();
      removeVars(target, lastVars);
    });
  }
}

/**
 * 将多组组件令牌桥接为 CSS 自定义属性
 *
 * 一次性桥接多个组件令牌到 CSS 变量，等价于多次调用 useCSSVarsBridge。
 *
 * @param bridges - 桥接定义数组
 * @param options - 共享配置
 *
 * @example
 * ```typescript
 * // 适配器中一次桥接多个组件令牌
 * useCSSVarsBridgeAll([
 *   { name: 'ElGlobal', mapping: mapGlobalVars },
 *   { name: 'ElButton', mapping: mapButtonVars },
 *   { name: 'ElInput',  mapping: mapInputVars },
 * ])
 * ```
 */
export function useCSSVarsBridgeAll(bridges: Array<{ name: keyof ComponentTokenMap; mapping: CSSVarsMapping<any> }>, options: CSSVarsBridgeOptions = {}): void {
  for (const bridge of bridges) {
    useCSSVarsBridge(bridge.name, bridge.mapping, options);
  }
}
