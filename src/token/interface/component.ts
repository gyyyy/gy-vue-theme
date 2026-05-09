/**
 * 组件令牌接口
 *
 * 组件令牌层是三层令牌架构的最顶层。
 * 本库仅提供空的可扩展接口，由使用者通过 TypeScript 声明合并自行定义。
 *
 * @example
 * ```typescript
 * // 在用户项目中扩展
 * declare module 'gy-vue-theme' {
 *   interface ComponentTokenMap {
 *     Button: {
 *       fontWeight: number;
 *       primaryColor: string;
 *     }
 *   }
 * }
 * ```
 */

import type { SemanticToken } from './semantic';

/**
 * 组件令牌映射表
 *
 * 空接口，使用者通过 TypeScript Declaration Merging 扩展。
 * 键为组件名（如 'Button'），值为该组件的令牌类型。
 */
export interface ComponentTokenMap {
  // 由使用者通过声明合并扩展
}

/**
 * 组件令牌定义
 *
 * 封装了组件名称和默认值生成函数的定义对象。
 */
export interface ComponentTokenDefinition<Key extends keyof ComponentTokenMap> {
  /** 组件名称 */
  name: Key;
  /** 默认值生成函数，接收语义令牌，返回组件令牌默认值 */
  prepareToken: (token: SemanticToken) => ComponentTokenMap[Key];
}
