/**
 * 组件令牌工具
 *
 * 提供组件令牌的定义工厂、获取组合函数和全局注册机制。
 */

import { computed, type ComputedRef } from 'vue';
import type { SemanticToken } from '@/token/interface/semantic';
import type { ComponentTokenMap, ComponentTokenDefinition } from '@/token/interface/component';
import { useThemeToken, useThemeConfig } from './context';

// ============================================================
// 全局注册表
// ============================================================

/** 组件令牌定义全局注册表 */
const componentTokenRegistry = new Map<string, ComponentTokenDefinition<keyof ComponentTokenMap>>();

// ============================================================
// 工厂函数
// ============================================================

/**
 * 定义组件令牌的默认值生成函数
 *
 * @typeParam Key - 组件名称（ComponentTokenMap 的键）
 * @param name - 组件名称
 * @param prepareToken - 默认值生成函数，接收语义令牌，返回组件令牌
 * @returns 组件令牌定义对象
 *
 * @example
 * ```typescript
 * const buttonToken = defineComponentToken('Button', (token) => ({
 *   fontWeight: 400,
 *   primaryColor: token.colorTextLightSolid,
 *   defaultBg: token.colorBgContainer,
 * }))
 * ```
 */
export function defineComponentToken<Key extends keyof ComponentTokenMap>(name: Key, prepareToken: (token: SemanticToken) => ComponentTokenMap[Key]): ComponentTokenDefinition<Key> {
  return { name, prepareToken };
}

// ============================================================
// 全局注册
// ============================================================

/**
 * 全局注册组件令牌定义
 *
 * 注册后可在 useComponentToken 中省略 definition 参数。
 *
 * @param definitions - 组件令牌定义数组
 */
export function registerComponentToken(...definitions: ComponentTokenDefinition<keyof ComponentTokenMap>[]): void {
  for (const def of definitions) {
    componentTokenRegistry.set(def.name as string, def);
  }
}

// ============================================================
// 组合函数
// ============================================================

/**
 * 获取指定组件的完整令牌
 *
 * 合并优先级（从高到低）：
 * 1. ThemeConfig.components[name] 中用户传入的覆盖值
 * 2. ComponentTokenDefinition.prepareToken() 生成的默认值
 *
 * @typeParam Key - 组件名称
 * @param name - 组件名称
 * @param definition - 组件令牌定义（可选，若已全局注册则可省略）
 * @returns 响应式的组件令牌对象
 */
export function useComponentToken<Key extends keyof ComponentTokenMap>(name: Key, definition?: ComponentTokenDefinition<Key>): ComputedRef<ComponentTokenMap[Key]> {
  const token = useThemeToken();
  const config = useThemeConfig();

  const def = definition ?? componentTokenRegistry.get(name as string) as ComponentTokenDefinition<Key> | undefined;

  return computed<ComponentTokenMap[Key]>(() => {
    // 生成默认值
    const defaults = def ? def.prepareToken(token.value) : {} as ComponentTokenMap[Key];

    // 获取用户覆盖值
    const userOverride = config.value.componentToken?.[name] ?? {};

    // 合并（移除 algorithm 元字段）
    const { algorithm: _, ...overrides } = userOverride as Record<string, unknown>;

    return { ...(defaults as unknown as Record<string, unknown>), ...overrides } as unknown as ComponentTokenMap[Key];
  });
}
