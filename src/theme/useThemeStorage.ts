/**
 * 主题偏好持久化
 *
 * 提供 opt-in 的 localStorage 持久化能力，
 * 存储终端用户的主题偏好（选了哪个主题、亮暗模式、紧凑模式、是否跟随系统等）。
 *
 * 核心设计：接收完整的**主题注册表**（`themes`），库负责校验、解析、兜底，
 * 从而保证持久化的 `themeName` 一定能映射到一个有效的 `ThemeDefinition`。
 *
 * 支持跟随系统 prefers-color-scheme 自动切换亮暗模式。
 * SSR 环境下静默回退到默认值。
 */

import { ref, computed, watch, onScopeDispose, type Ref, type ComputedRef } from 'vue';
import type { ThemeMode, ThemeDefinition, ThemeConfig } from './interface';

// ============================================================
// 类型定义
// ============================================================

/**
 * 可持久化的主题偏好
 *
 * 存储终端用户的选择：当前使用的主题名称、颜色模式、紧凑模式、是否跟随系统。
 * 不包含主题定义（ThemeDefinition）或令牌等库内部数据。
 */
export interface ThemePreference {
  /** 当前使用的主题名称（如 "科技蓝"、"商务灰"），必须是注册表中的合法 key */
  name?: string;
  /** 颜色模式 */
  mode?: ThemeMode;
  /** 是否紧凑模式 */
  compact?: boolean;
  /** 是否跟随系统主题 */
  followSystem?: boolean;
}

/** useThemeStorage 配置选项 */
export interface ThemeStorageOptions {
  /**
   * 主题注册表
   *
   * key 为主题显示名称（也是持久化存储的标识），value 为对应的主题定义。
   * 所有可用主题都必须在此注册，库会据此校验存储值并在找不到时自动兜底。
   *
   * @example
   * ```typescript
   * {
   *   '默认': defineTheme({ name: 'default' }),
   *   '科技蓝': defineTheme({ name: 'tech-blue', ... }),
   *   '商务灰': defineTheme({ name: 'business-gray', ... }),
   * }
   * ```
   */
  themes: Record<string, ThemeDefinition>;

  /**
   * localStorage 存储键名
   * @default 'gy-theme-preference'
   */
  key?: string;

  /**
   * 初始默认值（localStorage 中无数据时使用）
   *
   * `defaults.name` 必须是 `themes` 注册表中的合法 key。
   * 不提供时自动使用注册表中的第一个主题。
   */
  defaults?: ThemePreference;

  /**
   * 自定义存储后端（用于替换 localStorage）
   *
   * 提供 `getItem` / `setItem` / `removeItem` 方法即可。
   * 未提供时使用 `window.localStorage`。
   */
  storage?: StorageLike;
}

/** 兼容 Storage 接口的最小子集 */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** useThemeStorage 返回值 */
export interface ThemeStorageReturn {
  /** 当前偏好（响应式） */
  preference: Ref<ThemePreference>;

  /**
   * 当前生效的主题定义（响应式）
   *
   * 根据 `preference.name` 从注册表中查找；
   * 若名称无效则自动兜底到默认主题。
   */
  currentTheme: ComputedRef<ThemeDefinition>;

  /** 注册表中所有可用主题名称 */
  availableThemes: string[];

  /**
   * 实际生效的模式（响应式）
   *
   * 跟随系统时返回系统检测到的模式，否则返回用户手动设置的模式。
   */
  effectiveMode: ComputedRef<ThemeMode>;

  /** 当前是否为暗色模式（便捷计算属性） */
  isDark: ComputedRef<boolean>;

  /** 系统当前偏好的模式（仅在浏览器中有效） */
  systemMode: Ref<ThemeMode>;

  /**
   * 转换为部分 ThemeConfig（仅 theme / mode / compact）
   *
   * 包含解析后的 `theme`（ThemeDefinition），可直接传给 ThemeProvider：
   * ```vue
   * <ThemeProvider :config="toConfig()">
   * ```
   */
  toConfig: () => Pick<ThemeConfig, 'theme' | 'mode' | 'compact'>;

  /**
   * 切换当前主题
   *
   * 名称必须存在于注册表中，否则忽略并在开发环境发出警告。
   */
  setTheme: (name: string) => void;

  /** 设置颜色模式并持久化（同时关闭 followSystem） */
  setMode: (mode: ThemeMode) => void;

  /** 切换亮色/暗色模式（同时关闭 followSystem） */
  toggleMode: () => void;

  /** 设置紧凑模式并持久化 */
  setCompact: (compact: boolean) => void;

  /** 设置是否跟随系统主题 */
  setFollowSystem: (follow: boolean) => void;

  /** 清除存储，恢复到默认值 */
  clear: () => void;

  /** 销毁系统主题监听器（通常由 onScopeDispose 自动调用） */
  destroy: () => void;
}

// ============================================================
// 内部工具
// ============================================================

/** 检测是否可以安全使用 storage */
function isStorageAvailable(storage: StorageLike): boolean {
  try {
    const key = '__gy_storage_test__';
    storage.setItem(key, '1');
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** 获取默认 storage（SSR 安全） */
function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 从 storage 读取偏好 */
function readPreference(storage: StorageLike | null, key: string, defaults: ThemePreference): ThemePreference {
  if (!storage) {
    return { ...defaults };
  }
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return { ...defaults };
    }
    const parsed = JSON.parse(raw) as Partial<ThemePreference>;
    // 合并：存储值覆盖默认值
    return {
      name: parsed.name ?? defaults.name,
      mode: parsed.mode ?? defaults.mode,
      compact: parsed.compact ?? defaults.compact,
      followSystem: parsed.followSystem ?? defaults.followSystem,
    };
  } catch {
    // JSON 解析失败，返回默认值
    return { ...defaults };
  }
}

/** 将偏好写入 storage */
function writePreference(storage: StorageLike | null, key: string, preference: ThemePreference): void {
  if (!storage) {
    return;
  }
  try {
    // 清理 undefined 字段，保持存储简洁
    const clean: Record<string, unknown> = {};
    if (preference.name !== undefined) clean.name = preference.name;
    if (preference.mode !== undefined) clean.mode = preference.mode;
    if (preference.compact !== undefined) clean.compact = preference.compact;
    if (preference.followSystem !== undefined) clean.followSystem = preference.followSystem;
    storage.setItem(key, JSON.stringify(clean));
  } catch {
    // 存储写入失败（quota exceeded 等），静默忽略
  }
}

/** 检测系统当前的颜色模式（SSR 安全） */
function detectSystemMode(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

// ============================================================
// 组合函数
// ============================================================

/**
 * 主题偏好持久化组合函数
 *
 * 1. 接收完整的主题注册表 `themes`，保证持久化的名称一定能解析到有效主题。
 * 2. 从 localStorage（或自定义 storage）读取并自动同步用户的主题偏好。
 * 3. 支持跟随系统 `prefers-color-scheme` 自动切换亮暗模式。
 * 4. `toConfig()` 返回包含解析后 `theme` 的完整配置，可直接传给 ThemeProvider。
 *
 * 完全 opt-in：不调用此函数则不产生任何副作用。
 *
 * @param options - 配置选项（themes 必传）
 * @returns 响应式偏好对象与操作方法
 *
 * @example
 * ```typescript
 * import { useThemeStorage, ThemeProvider, defineTheme } from 'gy-vue-theme'
 *
 * const { toConfig, setTheme, toggleMode, isDark, availableThemes } = useThemeStorage({
 *   themes: {
 *     '默认': defineTheme({ name: 'default' }),
 *     '科技蓝': defineTheme({ name: 'tech-blue', ... }),
 *   },
 *   key: 'my-app-theme',
 *   defaults: { name: '默认', followSystem: true },
 * })
 *
 * // 模板中 — toConfig() 已包含 theme，无需额外拼装
 * // <ThemeProvider :config="toConfig()">
 * //   <button @click="toggleMode()">{{ isDark ? '亮色' : '暗色' }}</button>
 * //   <button v-for="name in availableThemes" @click="setTheme(name)">{{ name }}</button>
 * // </ThemeProvider>
 * ```
 */
export function useThemeStorage(options: ThemeStorageOptions): ThemeStorageReturn {
  const {
    themes,
    key = 'gy-theme-preference',
    defaults = {},
  } = options;

  // -------- 注册表校验 --------

  const themeNames = Object.keys(themes);
  if (themeNames.length === 0) {
    throw new Error('[useThemeStorage] themes 注册表不能为空，至少需要注册一个主题。');
  }

  // 确定兜底主题名：优先使用 defaults.name（需合法），否则取注册表第一个
  const fallbackName = (defaults.name && defaults.name in themes) ? defaults.name : themeNames[0];

  // 规范化 defaults：确保 themeName 是合法的
  const normalizedDefaults: ThemePreference = {
    ...defaults,
    name: fallbackName,
  };

  // -------- 存储 --------

  const storage = options.storage ?? getDefaultStorage();
  const canStore = storage ? isStorageAvailable(storage) : false;
  const activeStorage = canStore ? storage : null;

  // 初始化响应式偏好
  const rawPreference = readPreference(activeStorage, key, normalizedDefaults);

  // 校验存储中的 themeName 是否合法，不合法则兜底
  if (rawPreference.name && !(rawPreference.name in themes)) {
    rawPreference.name = fallbackName;
  }

  const preference = ref<ThemePreference>(rawPreference);

  // -------- 系统主题监听 --------

  const systemMode = ref<ThemeMode>(detectSystemMode());
  let mediaQuery: MediaQueryList | null = null;
  let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null;

  if (typeof window !== 'undefined' && window.matchMedia) {
    try {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaHandler = (e: MediaQueryListEvent) => {
        systemMode.value = e.matches ? 'dark' : 'light';
      };
      mediaQuery.addEventListener('change', mediaHandler);
    } catch {
      // matchMedia 不可用，静默忽略
    }
  }

  function destroy(): void {
    if (mediaQuery && mediaHandler) {
      mediaQuery.removeEventListener('change', mediaHandler);
      mediaQuery = null;
      mediaHandler = null;
    }
  }

  try {
    onScopeDispose(destroy);
  } catch {
    // 在 effect scope 外调用时不报错
  }

  // -------- 计算属性 --------

  /** 当前生效的主题定义：根据 themeName 从注册表查找，查不到则兜底 */
  const currentTheme = computed<ThemeDefinition>(() => {
    const name = preference.value.name;
    if (name && name in themes) {
      return themes[name];
    }
    return themes[fallbackName];
  });

  /** 实际生效的模式 */
  const effectiveMode = computed<ThemeMode>(() => {
    if (preference.value.followSystem) {
      return systemMode.value;
    }
    return preference.value.mode ?? 'light';
  });

  /** 是否暗色模式 */
  const isDark = computed(() => effectiveMode.value === 'dark');

  // -------- 持久化 --------

  watch(
    preference,
    (newVal) => {
      writePreference(activeStorage, key, newVal);
    },
    { deep: true },
  );

  // -------- 操作方法 --------

  function setTheme(name: string): void {
    if (!(name in themes)) {
      console.warn(`[useThemeStorage] 主题 "${name}" 不在注册表中，可用主题：${themeNames.join(', ')}`);
      return;
    }
    preference.value = { ...preference.value, name: name };
  }

  function setMode(mode: ThemeMode): void {
    preference.value = { ...preference.value, mode, followSystem: false };
  }

  function toggleMode(): void {
    setMode(effectiveMode.value === 'dark' ? 'light' : 'dark');
  }

  function setCompact(compact: boolean): void {
    preference.value = { ...preference.value, compact };
  }

  function setFollowSystem(follow: boolean): void {
    preference.value = { ...preference.value, followSystem: follow };
  }

  function clear(): void {
    if (activeStorage) {
      try {
        activeStorage.removeItem(key);
      } catch {
        // 静默忽略
      }
    }
    preference.value = { ...normalizedDefaults };
  }

  function toConfig(): Pick<ThemeConfig, 'theme' | 'mode' | 'compact'> {
    const config: Pick<ThemeConfig, 'theme' | 'mode' | 'compact'> = {
      theme: currentTheme.value,
      mode: effectiveMode.value,
    };
    const pref = preference.value;
    if (pref.compact !== undefined) config.compact = pref.compact;
    return config;
  }

  return {
    preference,
    currentTheme,
    availableThemes: themeNames,
    effectiveMode,
    isDark,
    systemMode,
    toConfig,
    setTheme,
    setMode,
    toggleMode,
    setCompact,
    setFollowSystem,
    clear,
    destroy,
  };
}
