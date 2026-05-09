/**
 * CSS 变量样式注入
 *
 * 管理 <style> 标签的创建、更新和清理。
 */

/** 已注入的 style 标签缓存（hashId → style 元素） */
const styleCache = new Map<string, HTMLStyleElement>();

/**
 * 生成唯一的短随机 ID（6 位字母数字）
 */
export function newStyleId(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * 将 CSS 变量声明注入到 DOM
 *
 * 创建或更新一个 <style> 标签，将 CSS 变量声明写入其中。
 * 通过 ID 标识唯一的 style 标签，相同 ID 复用同一标签。
 *
 * @param content - CSS 文本内容
 * @param id - 唯一标识（用于 style 标签 id）
 */
export function injectCSSVars(content: string, id: string): void {
  // SSR 环境中不注入
  if (typeof document === 'undefined') {
    return;
  }

  let style = styleCache.get(id);

  if (!style) {
    style = document.createElement('style');
    style.setAttribute('data-gy-theme', id);
    styleCache.set(id, style);
  }

  // 每次都移到 head 末尾，确保在第三方 CSS 之后，
  // 同优先级规则按顺序后者胜出，bridge 始终能覆盖
  document.head.appendChild(style);

  style.textContent = content;
}

/**
 * 移除已注入的 CSS 变量样式
 *
 * @param id - 对应的唯一哈希标识
 */
export function removeCSSVars(id: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const style = styleCache.get(id);
  if (style) {
    style.remove();
    styleCache.delete(id);
  }
}

/**
 * 清除所有已注入的 CSS 变量样式
 */
export function clearAllCSSVars(): void {
  if (typeof document === 'undefined') {
    return;
  }

  for (const [id, style] of styleCache) {
    style.remove();
    styleCache.delete(id);
  }
}

/**
 * 打印已注入的 CSS 内容（调试用）
 *
 * 不传参数时打印全部已注入样式；
 * 传入 `id` 时只打印 ID 完全匹配或以该字符串开头的条目。
 *
 * 常见 ID 前缀：
 * - `gy-theme-` — ThemeProvider 注入的语义令牌 CSS 变量
 * - `gy-base-`  — ThemeProvider 注入的基础样式
 * - `gy-bridge-` — useCSSVarsBridge 注入的组件令牌桥接
 *
 * @param id - 可选的 ID 或前缀过滤字符串
 *
 * @example
 * ```typescript
 * import { dumpCSSVars } from 'gy-vue-theme'
 *
 * // 打印所有注入的 CSS
 * dumpCSSVars()
 *
 * // 只打印主题变量
 * dumpCSSVars('gy-theme-')
 *
 * // 只打印某个桥接
 * dumpCSSVars('gy-bridge-ElButton')
 * ```
 */
export function dumpCSSVars(id?: string): void {
  const entries = [...styleCache.entries()].filter(
    ([key]) => id === undefined || key === id || key.startsWith(id),
  );

  if (entries.length === 0) {
    const hint = id ? `（未找到匹配 "${id}" 的注入样式）` : '（当前无任何注入样式）';
    console.log(`[gy-vue-theme] dumpCSSVars ${hint}`);
    return;
  }

  for (const [key, style] of entries) {
    console.groupCollapsed(`[gy-vue-theme] #${key}`);
    console.log(style.textContent);
    console.groupEnd();
  }
}
