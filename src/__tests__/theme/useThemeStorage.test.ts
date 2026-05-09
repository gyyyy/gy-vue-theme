/**
 * useThemeStorage 主题偏好持久化测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { useThemeStorage, type StorageLike, type ThemePreference } from '@/theme/useThemeStorage';
import { defineTheme } from '@/theme/defineTheme';

// ============================================================
// 测试用主题注册表
// ============================================================

/** 创建一组测试用主题 */
function createTestThemes() {
  return {
    '默认': defineTheme({ name: 'default' }),
    '科技蓝': defineTheme({ name: 'tech-blue' }),
    '商务灰': defineTheme({ name: 'business-gray' }),
  };
}

// ============================================================
// 模拟 Storage
// ============================================================

function createMockStorage(): StorageLike & { _store: Map<string, string> } {
  const store = new Map<string, string>();
  return {
    _store: store,
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { store.set(key, value); }),
    removeItem: vi.fn((key: string) => { store.delete(key); }),
  };
}

// ============================================================
// 模拟 matchMedia
// ============================================================

type MediaChangeHandler = (e: MediaQueryListEvent) => void;

function createMockMatchMedia(initialDark = false) {
  let currentMatches = initialDark;
  const handlers: MediaChangeHandler[] = [];

  const mediaQueryList = {
    get matches() { return currentMatches; },
    media: '(prefers-color-scheme: dark)',
    addEventListener: vi.fn((_event: string, handler: MediaChangeHandler) => {
      handlers.push(handler);
    }),
    removeEventListener: vi.fn((_event: string, handler: MediaChangeHandler) => {
      const idx = handlers.indexOf(handler);
      if (idx >= 0) handlers.splice(idx, 1);
    }),
    _simulateChange(dark: boolean) {
      currentMatches = dark;
      const event = { matches: dark } as MediaQueryListEvent;
      handlers.forEach((h) => h(event));
    },
    _handlers: handlers,
  };

  const matchMediaMock = vi.fn((_query: string) => mediaQueryList);
  return { matchMediaMock, mediaQueryList };
}

// ============================================================
// 基础功能
// ============================================================

describe('useThemeStorage', () => {
  let storage: ReturnType<typeof createMockStorage>;
  let themes: ReturnType<typeof createTestThemes>;

  beforeEach(() => {
    storage = createMockStorage();
    themes = createTestThemes();
  });

  it('无存储数据时应使用默认值', () => {
    const { preference } = useThemeStorage({
      themes,
      storage,
      defaults: { name: '默认', mode: 'light', compact: false },
    });
    expect(preference.value.name).toBe('默认');
    expect(preference.value.mode).toBe('light');
    expect(preference.value.compact).toBe(false);
  });

  it('不指定 defaults.name 时应取注册表第一个', () => {
    const { preference, currentTheme } = useThemeStorage({
      themes,
      storage,
    });
    expect(preference.value.name).toBe('默认');
    expect(currentTheme.value.name).toBe('default');
  });

  it('应从 storage 恢复已有偏好', () => {
    storage.setItem('gy-theme-preference', JSON.stringify({
      name: '科技蓝', mode: 'dark', compact: true,
    }));
    const { preference, currentTheme } = useThemeStorage({ themes, storage });
    expect(preference.value.name).toBe('科技蓝');
    expect(preference.value.mode).toBe('dark');
    expect(preference.value.compact).toBe(true);
    expect(currentTheme.value.name).toBe('tech-blue');
  });

  it('storage 数据应覆盖默认值', () => {
    storage.setItem('gy-theme-preference', JSON.stringify({ name: '商务灰' }));
    const { preference, currentTheme } = useThemeStorage({
      themes,
      storage,
      defaults: { name: '默认', mode: 'light' },
    });
    expect(preference.value.name).toBe('商务灰');
    expect(currentTheme.value.name).toBe('business-gray');
    expect(preference.value.mode).toBe('light'); // defaults 兜底
  });

  it('自定义 key 应生效', () => {
    const { preference } = useThemeStorage({
      themes,
      storage,
      key: 'my-app-theme',
      defaults: { name: '默认' },
    });
    preference.value = { ...preference.value };
    expect(storage.getItem).toHaveBeenCalledWith('my-app-theme');
  });

  it('应从 storage 恢复 followSystem 偏好', () => {
    storage.setItem('gy-theme-preference', JSON.stringify({ followSystem: true }));
    const { preference } = useThemeStorage({ themes, storage });
    expect(preference.value.followSystem).toBe(true);
  });
});

// ============================================================
// 注册表校验
// ============================================================

describe('注册表校验', () => {
  it('空注册表应抛出错误', () => {
    expect(() => useThemeStorage({
      themes: {},
      storage: createMockStorage(),
    })).toThrow('themes 注册表不能为空');
  });

  it('storage 中的 themeName 不在注册表中时应兜底到默认', () => {
    const storage = createMockStorage();
    storage.setItem('gy-theme-preference', JSON.stringify({ name: '已删除的主题' }));
    const themes = createTestThemes();
    const { preference, currentTheme } = useThemeStorage({
      themes,
      storage,
      defaults: { name: '科技蓝' },
    });
    // 应兜底到 defaults.name
    expect(preference.value.name).toBe('科技蓝');
    expect(currentTheme.value.name).toBe('tech-blue');
  });

  it('defaults.name 不在注册表中时应兜底到第一个', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { preference } = useThemeStorage({
      themes,
      storage,
      defaults: { name: '不存在的主题' },
    });
    expect(preference.value.name).toBe('默认'); // 第一个
  });

  it('availableThemes 应包含所有注册主题名', () => {
    const themes = createTestThemes();
    const { availableThemes } = useThemeStorage({
      themes,
      storage: createMockStorage(),
    });
    expect(availableThemes).toEqual(['默认', '科技蓝', '商务灰']);
  });
});

// ============================================================
// setTheme
// ============================================================

describe('setTheme', () => {
  it('合法名称应更新并写入 storage', async () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { preference, currentTheme, setTheme: setTheme } = useThemeStorage({
      themes, storage, defaults: { name: '默认' },
    });
    setTheme('科技蓝');
    expect(preference.value.name).toBe('科技蓝');
    expect(currentTheme.value.name).toBe('tech-blue');
    await nextTick();
    const stored = JSON.parse(storage._store.get('gy-theme-preference')!) as ThemePreference;
    expect(stored.name).toBe('科技蓝');
  });

  it('非法名称应被忽略并输出警告', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { preference, setTheme: setTheme } = useThemeStorage({
      themes, storage, defaults: { name: '默认' },
    });
    setTheme('不存在');
    expect(preference.value.name).toBe('默认'); // 不变
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('不存在'));
    warnSpy.mockRestore();
  });
});

// ============================================================
// setMode
// ============================================================

describe('setMode', () => {
  it('应更新 mode 并写入 storage，同时关闭 followSystem', async () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { preference, setMode } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light', followSystem: true },
    });
    setMode('dark');
    expect(preference.value.mode).toBe('dark');
    expect(preference.value.followSystem).toBe(false);
    await nextTick();
    const stored = JSON.parse(storage._store.get('gy-theme-preference')!) as ThemePreference;
    expect(stored.mode).toBe('dark');
    expect(stored.followSystem).toBe(false);
  });
});

// ============================================================
// setCompact
// ============================================================

describe('setCompact', () => {
  it('应更新 compact 并写入 storage', async () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { preference, setCompact } = useThemeStorage({
      themes, storage, defaults: { name: '默认', compact: false },
    });
    setCompact(true);
    expect(preference.value.compact).toBe(true);
    await nextTick();
    const stored = JSON.parse(storage._store.get('gy-theme-preference')!) as ThemePreference;
    expect(stored.compact).toBe(true);
  });
});

// ============================================================
// clear
// ============================================================

describe('clear', () => {
  it('应清除 storage 并恢复默认值', async () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { preference, setTheme: setTheme, setMode, clear } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light' },
    });
    setTheme('科技蓝');
    setMode('dark');
    await nextTick();
    expect(storage._store.has('gy-theme-preference')).toBe(true);

    clear();
    expect(preference.value.name).toBe('默认');
    expect(preference.value.mode).toBe('light');
    expect(storage._store.has('gy-theme-preference')).toBe(false);
  });
});

// ============================================================
// toConfig
// ============================================================

describe('toConfig', () => {
  it('应返回包含 theme 的完整 ThemeConfig', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { toConfig, setTheme: setTheme, setMode, setCompact } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light', compact: false },
    });
    setTheme('科技蓝');
    setMode('dark');
    setCompact(true);
    const config = toConfig();
    expect(config.theme?.name).toBe('tech-blue');
    expect(config.mode).toBe('dark');
    expect(config.compact).toBe(true);
  });

  it('mode 始终由 effectiveMode 提供', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { toConfig } = useThemeStorage({ themes, storage });
    const config = toConfig();
    expect(config.mode).toBe('light');
    expect(config.theme?.name).toBe('default');
    expect('compact' in config).toBe(false);
  });

  it('可直接作为 ThemeProvider 的完整配置', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { toConfig } = useThemeStorage({
      themes, storage, defaults: { name: '商务灰' },
    });
    const config = toConfig();
    // 包含 theme，不需要额外的主题查找
    expect(config.theme).toBeDefined();
    expect(config.theme?.name).toBe('business-gray');
    expect(config.mode).toBe('light');
  });
});

// ============================================================
// currentTheme
// ============================================================

describe('currentTheme', () => {
  it('修改 themeName 后 currentTheme 应联动更新', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { currentTheme, setTheme } = useThemeStorage({
      themes, storage, defaults: { name: '默认' },
    });
    expect(currentTheme.value.name).toBe('default');

    setTheme('商务灰');
    expect(currentTheme.value.name).toBe('business-gray');
  });

  it('非法 themeName 应自动兜底', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { preference, currentTheme } = useThemeStorage({
      themes, storage, defaults: { name: '默认' },
    });
    // 直接篡改（绕过 setTheme 校验）
    preference.value = { ...preference.value, name: '被删除了' };
    // currentTheme 应兜底到默认
    expect(currentTheme.value.name).toBe('default');
  });
});

// ============================================================
// toggleMode
// ============================================================

describe('toggleMode', () => {
  it('应在亮暗模式之间切换', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { preference, toggleMode, effectiveMode } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light' },
    });
    expect(effectiveMode.value).toBe('light');
    toggleMode();
    expect(preference.value.mode).toBe('dark');
    expect(effectiveMode.value).toBe('dark');
    toggleMode();
    expect(preference.value.mode).toBe('light');
    expect(effectiveMode.value).toBe('light');
  });

  it('切换时应自动关闭 followSystem', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { preference, toggleMode } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light', followSystem: true },
    });
    expect(preference.value.followSystem).toBe(true);
    toggleMode();
    expect(preference.value.followSystem).toBe(false);
  });
});

// ============================================================
// effectiveMode & isDark
// ============================================================

describe('effectiveMode & isDark', () => {
  it('非跟随系统时应返回手动设置的模式', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { effectiveMode, isDark, setMode } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light' },
    });
    expect(effectiveMode.value).toBe('light');
    expect(isDark.value).toBe(false);
    setMode('dark');
    expect(effectiveMode.value).toBe('dark');
    expect(isDark.value).toBe(true);
  });

  it('未设置 mode 时 effectiveMode 应默认 light', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    const { effectiveMode } = useThemeStorage({ themes, storage });
    expect(effectiveMode.value).toBe('light');
  });
});

// ============================================================
// followSystem 与系统主题检测
// ============================================================

describe('followSystem', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('followSystem 启用时 effectiveMode 应跟随系统', () => {
    const { matchMediaMock } = createMockMatchMedia(true);
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

    const storage = createMockStorage();
    const themes = createTestThemes();
    const { effectiveMode, isDark, systemMode } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light', followSystem: true },
    });
    expect(systemMode.value).toBe('dark');
    expect(effectiveMode.value).toBe('dark');
    expect(isDark.value).toBe(true);
  });

  it('followSystem 关闭时应使用手动 mode', () => {
    const { matchMediaMock } = createMockMatchMedia(true);
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

    const storage = createMockStorage();
    const themes = createTestThemes();
    const { effectiveMode } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light', followSystem: false },
    });
    expect(effectiveMode.value).toBe('light');
  });

  it('系统主题变化时 systemMode 应自动更新', () => {
    const { matchMediaMock, mediaQueryList } = createMockMatchMedia(false);
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

    const storage = createMockStorage();
    const themes = createTestThemes();
    const { systemMode, effectiveMode } = useThemeStorage({
      themes, storage, defaults: { name: '默认', followSystem: true },
    });
    expect(systemMode.value).toBe('light');
    expect(effectiveMode.value).toBe('light');

    mediaQueryList._simulateChange(true);
    expect(systemMode.value).toBe('dark');
    expect(effectiveMode.value).toBe('dark');

    mediaQueryList._simulateChange(false);
    expect(systemMode.value).toBe('light');
    expect(effectiveMode.value).toBe('light');
  });

  it('setFollowSystem 应更新并持久化', async () => {
    const { matchMediaMock } = createMockMatchMedia(true);
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

    const storage = createMockStorage();
    const themes = createTestThemes();
    const { preference, effectiveMode, setFollowSystem } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light', followSystem: false },
    });
    expect(effectiveMode.value).toBe('light');

    setFollowSystem(true);
    expect(preference.value.followSystem).toBe(true);
    expect(effectiveMode.value).toBe('dark');

    await nextTick();
    const stored = JSON.parse(storage._store.get('gy-theme-preference')!) as ThemePreference;
    expect(stored.followSystem).toBe(true);
  });

  it('toConfig 在 followSystem 时应返回系统模式', () => {
    const { matchMediaMock } = createMockMatchMedia(true);
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

    const storage = createMockStorage();
    const themes = createTestThemes();
    const { toConfig } = useThemeStorage({
      themes, storage, defaults: { name: '默认', mode: 'light', followSystem: true },
    });
    const config = toConfig();
    expect(config.mode).toBe('dark');
  });

  it('destroy 应移除 matchMedia 监听器', () => {
    const { matchMediaMock, mediaQueryList } = createMockMatchMedia(false);
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;

    const storage = createMockStorage();
    const themes = createTestThemes();
    const { destroy, systemMode } = useThemeStorage({
      themes, storage, defaults: { name: '默认', followSystem: true },
    });
    expect(mediaQueryList._handlers.length).toBe(1);

    destroy();
    expect(mediaQueryList.removeEventListener).toHaveBeenCalled();
    expect(mediaQueryList._handlers.length).toBe(0);

    const modeBefore = systemMode.value;
    mediaQueryList._simulateChange(true);
    expect(systemMode.value).toBe(modeBefore);
  });
});

// ============================================================
// 容错
// ============================================================

describe('容错处理', () => {
  it('storage 中存在非法 JSON 时应回退到默认值', () => {
    const storage = createMockStorage();
    const themes = createTestThemes();
    storage.setItem('gy-theme-preference', 'not-json!!!');
    const { preference, currentTheme } = useThemeStorage({
      themes, storage, defaults: { name: '科技蓝', mode: 'light' },
    });
    expect(preference.value.name).toBe('科技蓝');
    expect(preference.value.mode).toBe('light');
    expect(currentTheme.value.name).toBe('tech-blue');
  });

  it('storage 不可用时应静默使用默认值', () => {
    const themes = createTestThemes();
    const brokenStorage: StorageLike = {
      getItem: () => { throw new Error('denied'); },
      setItem: () => { throw new Error('denied'); },
      removeItem: () => { throw new Error('denied'); },
    };
    const { preference, setMode } = useThemeStorage({
      themes,
      storage: brokenStorage,
      defaults: { name: '默认', mode: 'light' },
    });
    expect(preference.value.mode).toBe('light');
    expect(() => setMode('dark')).not.toThrow();
    expect(preference.value.mode).toBe('dark');
  });
});
