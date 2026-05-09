# 主题使用指南

本文面向**应用开发者**，介绍如何在 Vue 应用中集成已开发好的主题和适配器。

## 概述

作为应用开发者，你的工作是把主题包和适配器**组装在一起**，为最终用户提供完整的主题体验。

你需要做的核心工作：

1. 安装主题包和适配器
2. 在应用入口注册适配器
3. 用 `ThemeProvider` 包裹应用，传入主题配置
4. 如果使用 CSS 变量驱动的 UI 框架（如 Element Plus），桥接 CSS 变量
5. （可选）使用样式增强（StyleEnhancer）进行深度定制

## 快速开始

### 1. 安装依赖

```bash
pnpm add gy-vue-theme
# 或 npm install gy-vue-theme
# 同时安装所需的主题包和适配器
pnpm add @gy-theme/my-theme @gy-theme/my-adapter
```

### 2. 应用入口

```vue
<!-- App.vue -->
<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { ThemeProvider } from 'gy-vue-theme'
import type { ThemeConfig } from 'gy-vue-theme'
import { myTheme } from '@gy-theme/my-theme'
import { setupMyAdapter, useMyCSSVars } from '@gy-theme/my-adapter'
import AppLayout from '@/layout/AppLayout.vue'

// 应用启动时注册组件令牌（只需调用一次）
setupMyAdapter()

const isDark = ref(false)
// 使用 @vueuse 库管理
// const isDark = useDark({...}) // 自动管理，不需要单独使用 useThemeStorage
// const toggleDark = useToggle(isDark)

const themeConfig = computed<ThemeConfig>(() => ({
  theme: myTheme,
  mode: isDark.value ? 'dark' : 'light',
}))

provide('toggleTheme', () => { isDark.value = !isDark.value })
provide('isDark', isDark)
</script>

<template>
  <!-- bridge prop 自动执行 CSS 变量桥接，无需手动创建桥接组件 -->
  <ThemeProvider :config="themeConfig" :bridge="useMyCSSVars">
    <AppLayout />
  </ThemeProvider>
</template>
```

## 核心 API

### ThemeProvider

主题提供者组件，接收 `ThemeConfig` 配置，通过 `provide/inject` 向下传递令牌。

```vue
<ThemeProvider :config="themeConfig" :bridge="[useMyCSSVars]">
  <App />
</ThemeProvider>
```

**prop：`config`**（类型：`ThemeConfig`）

```typescript
interface ThemeConfig {
  /** 主题定义（不提供时使用内置默认主题） */
  theme?: ThemeDefinition

  /** 颜色模式 */
  mode?: 'light' | 'dark'

  /** 紧凑模式 */
  compact?: boolean

  /** 种子令牌覆盖（运行时级别） */
  seedToken?: {
    common: Partial<SeedToken>
    light?: Partial<SeedToken>
    dark?: Partial<SeedToken>
  }

  /** 语义令牌覆盖（最高优先级） */
  semanticToken?: Partial<SemanticToken>

  /** 组件令牌覆盖 */
  componentToken?: { [K in keyof ComponentTokenMap]?: Partial<ComponentTokenMap[K]> & { algorithm?: boolean } }

  /** CSS 变量配置 */
  cssVar?: false | { prefix?: string; selector?: string }
}
```

**prop：`bridge`**（类型：`(() => void) | (() => void)[]`）

CSS 变量桥接函数。这些函数在 ThemeProvider 的内部子组件中运行，可以正确 `inject` 主题令牌。传入适配器提供的桥接函数即可完成 CSS 变量注入：

```vue
<!-- 单个函数 -->
<ThemeProvider :config="config" :bridge="useMyCSSVars">

<!-- 多个函数 -->
<ThemeProvider :config="config" :bridge="[useMyCSSVars, useNaiveUICSSVars]">
```

**prop：`enhancers`**（类型：`StyleEnhancer | StyleEnhancer[]`，可选）

样式增强函数。用于注入超出 CSS 变量映射能力的深度定制样式（如边框、阴影、动画等）。增强函数接收当前语义令牌，返回任意 CSS 文本，主题/模式切换时自动更新。

```vue
<script setup lang="ts">
import { cardAccentBorder, buttonElevation } from '@gy-theme/my-adapter'
</script>

<template>
  <ThemeProvider :config="themeConfig" :bridge="useMyCSSVars" :enhancers="[cardAccentBorder, buttonElevation]">
    <App />
  </ThemeProvider>
</template>
```

也可以内联定义增强函数：

```vue
<ThemeProvider :config="themeConfig" :enhancers="(token) => `html .el-card { border-left: 3px solid ${token.colorPrimary}; }`">
```

### 组合函数

在 `ThemeProvider` 的子组件中使用：

```typescript
import {
  useThemeToken,    // 获取语义令牌 ComputedRef<SemanticToken>
  useThemeMode,     // 获取颜色模式 ComputedRef<ThemeMode>
  useThemeConfig,   // 获取主题配置 ComputedRef<ThemeConfig>
  useResolvedTheme, // 获取完整解析结果 ComputedRef<ResolvedTheme>
} from 'gy-vue-theme'
```

使用示例：

```vue
<script setup lang="ts">
import { useThemeToken, useThemeMode } from 'gy-vue-theme'

const token = useThemeToken()
const mode = useThemeMode()
</script>

<template>
  <div :style="{
    color: token.value.colorText,
    backgroundColor: token.value.colorBgContainer,
    borderRadius: token.value.borderRadius + 'px',
  }">
    当前模式：{{ mode.value }}
  </div>
</template>
```

## 亮暗模式切换

### 手动切换

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const isDark = ref(false)
const themeConfig = computed(() => ({
  theme: myTheme,
  mode: isDark.value ? 'dark' : 'light',
}))
</script>

<template>
  <ThemeProvider :config="themeConfig">
    <button @click="isDark = !isDark">
      {{ isDark ? '切换到亮色' : '切换到暗色' }}
    </button>
    <router-view />
  </ThemeProvider>
</template>
```

### 使用 useThemeStorage（偏好持久化）

`useThemeStorage` 提供主题偏好的自动持久化、注册表校验和跟随系统功能：

```vue
<script setup lang="ts">
import { ThemeProvider, useThemeStorage } from 'gy-vue-theme'
import { myTheme } from '@gy-theme/my-theme'
import { mysteryPurple } from '@gy-theme/mystery-purple'

const {
  toConfig,           // 生成 ThemeConfig，可直接传给 ThemeProvider
  setTheme,       // 切换主题（注册表校验，无效名称自动忽略）
  toggleMode,         // 切换亮/暗
  setCompact,         // 切换紧凑模式
  setFollowSystem,    // 设置是否跟随系统
  isDark,             // 当前是否暗色 ComputedRef<boolean>
  effectiveMode,      // 实际生效的模式
  availableThemes,    // 所有可用主题名列表
} = useThemeStorage({
  themes: {
    '我的主题': myTheme,
    '神秘紫': mysteryPurple,
  },
  defaults: {
    name: '我的主题',
    followSystem: true,
  },
})
</script>

<template>
  <ThemeProvider :config="toConfig()">
    <!-- 主题切换器 -->
    <select @change="setTheme(($event.target as HTMLSelectElement).value)">
      <option v-for="name in availableThemes" :key="name">{{ name }}</option>
    </select>
    <button @click="toggleMode()">
      {{ isDark ? '☀️ 亮色' : '🌙 暗色' }}
    </button>
    <router-view />
  </ThemeProvider>
</template>
```

特性：

- **注册表校验**：存储的主题名必须存在于注册表中，否则自动回退到默认
- **跟随系统**：`followSystem: true` 时响应 `prefers-color-scheme` 变化
- **SSR 安全**：服务端环境静默使用默认值
- **自定义存储**：可替换为 `sessionStorage`、IndexedDB 等

## 嵌套主题

`ThemeProvider` 支持嵌套。内层只需声明要覆盖的字段，其余继承外层：

```vue
<template>
  <!-- 全局：影安蓝 亮色 -->
  <ThemeProvider :config="{ theme: myTheme, mode: 'light' }">
    <MainContent />

    <!-- 局部：仅切换为暗色，主题继承外层 -->
    <ThemeProvider :config="{ mode: 'dark' }">
      <DarkSidebar />
    </ThemeProvider>

    <!-- 局部：切换为另一个主题 -->
    <ThemeProvider :config="{ theme: anotherTheme }">
      <SpecialSection />
    </ThemeProvider>
  </ThemeProvider>
</template>
```

## 运行时令牌覆盖

应用开发者可以在运行时覆盖令牌，无需修改主题定义：

```typescript
const themeConfig: ThemeConfig = {
  theme: myTheme,
  mode: 'light',

  // 覆盖种子令牌（影响整个色板派生）
  seedToken: {
    common: {
      colorPrimary: '#722ED1',  // 覆盖主色
    },
  },

  // 覆盖语义令牌（最高优先级，不经过算法）
  semanticToken: {
    colorFillContent: '#F0E6FF',
  },

  // 覆盖组件令牌
  componentToken: {
    ElButton: {
      fontWeight: 600,
    },
  },
}
```

覆盖优先级（从低到高）：

```
默认种子令牌 → 主题 seedToken → ThemeConfig.seedToken
                    ↓ 算法派生
   算法语义值 → common → light/dark → ThemeConfig.semanticToken
```

## CSS 变量

### 自动注入

ThemeProvider **默认自动注入** `--gy-*` CSS 变量到 `:root`，无需额外配置。主题/模式切换时自动更新，组件卸载时自动清理。

```css
/* 在任何 CSS 中直接引用主题 CSS 变量 */
.my-card {
  background: var(--gy-color-bg-container);
  color: var(--gy-color-text);
  border-radius: var(--gy-border-radius);
  font-size: var(--gy-font-size);
}
```

可通过 `cssVar` 配置自定义前缀和选择器：

```typescript
const config: ThemeConfig = {
  theme: myTheme,
  cssVar: {
    prefix: 'app',       // 变量前缀（默认 'gy'）
    selector: '.my-app', // 挂载选择器（默认 ':root'）
  },
}
// 产出: --app-color-primary, --app-font-size, ... （挂载到 .my-app）
```

不需要 CSS 变量时可显式关闭：

```typescript
const config: ThemeConfig = {
  theme: myTheme,
  cssVar: false, // 禁用 CSS 变量注入
}
```

> **注意**：`--gy-*` CSS 变量代表的是语义令牌（SemanticToken），适用于用户的自定义样式。
> 它与适配器桥接的 `--el-*` 等框架 CSS 变量**不冲突、互不影响**，可以同时使用。

### 手动操作

如需在 ThemeProvider 之外手动操控 CSS 变量（如 SSR 预注入、工具脚本等），可使用底层工具函数：

```typescript
import { tokenToCSSVars, cssVarsToString, injectCSSVars, removeCSSVars, clearAllCSSVars } from 'gy-vue-theme'

// 转换令牌为 CSS 变量 Map
const vars = tokenToCSSVars(semanticToken, 'gy')
// → { '--gy-color-primary': '#1677FF', '--gy-font-size': '14px', ... }

// 生成 CSS 文本
const cssText = cssVarsToString(vars, ':root')

// 注入到 DOM（<style> 标签）
injectCSSVars(cssText, 'my-vars')

// 移除
removeCSSVars('my-vars')

// 清除所有
clearAllCSSVars()
```

## 静态获取令牌

在非 Vue 上下文中（如工具函数、测试、Node.js），可以静态获取令牌：

```typescript
import { resolveTheme, getDesignToken } from 'gy-vue-theme'
import { myTheme } from '@gy-theme/my-theme'

// 获取语义令牌
const token = getDesignToken({ theme: myTheme, mode: 'dark' })
console.log(token.colorPrimary) // '#1890FF'

// 获取完整解析结果
const resolved = resolveTheme({ theme: myTheme, mode: 'dark', compact: true })
console.log(resolved.seedToken, resolved.baseToken, resolved.semanticToken)
```

## 颜色工具函数

库提供了一组颜色工具函数，方便在应用中使用：

```typescript
import {
  darken,
  lighten,
  mixColors,
  getAlphaColor,
  generateLightPalette,
  generateDarkPalette,
} from 'gy-vue-theme'

darken('#1890FF', 20)              // 加深 20%
lighten('#1890FF', 20)             // 减淡 20%
mixColors('#1890FF', '#FFFFFF', 50) // 混合
getAlphaColor('#1890FF', 0.5)       // 半透明
generateLightPalette('#1890FF')     // 生成 10 级亮色色板
generateDarkPalette('#1890FF')      // 生成 10 级暗色色板
```

## 完整 API 速查

### 主题定义

| API | 说明 |
|-----|------|
| `defineTheme(options)` | 创建主题定义 |
| `defaultTheme` | 内置默认主题 |
| `defaultLightAlgorithm` | 内置亮色算法 |
| `defaultDarkAlgorithm` | 内置暗色算法 |
| `applyCompact(baseToken)` | 紧凑模式修饰器 |

### 主题引擎

| API | 说明 |
|-----|------|
| `ThemeProvider` | 主题提供者组件（props: `config`, `bridge`, `enhancers`） |
| `useThemeToken()` | 获取语义令牌 |
| `useThemeConfig()` | 获取主题配置 |
| `useResolvedTheme()` | 获取完整解析结果 |
| `useThemeMode()` | 获取颜色模式 |
| `resolveTheme(config?)` | 静态解析主题 |
| `getDesignToken(config?)` | 静态获取令牌 |
| `hashToken(token)` | 生成令牌哈希 |
| `useStyleEnhancer(enhancers)` | 注入样式增强，响应式更新 |

### 组件令牌

| API | 说明 |
|-----|------|
| `defineComponentToken(name, fn)` | 定义组件令牌 |
| `registerComponentToken(...defs)` | 注册组件令牌 |
| `useComponentToken(name, definition?)` | 获取组件令牌 |

### 偏好持久化

| API | 说明 |
|-----|------|
| `useThemeStorage(options)` | 创建持久化管理器 |
| `.preference` | 当前偏好 `Ref<ThemePreference>` |
| `.currentTheme` | 当前主题定义 `ComputedRef<ThemeDefinition>` |
| `.toConfig()` | 生成部分 ThemeConfig（theme + mode + compact） |
| `.setTheme(name)` | 切换主题 |
| `.setMode(mode)` | 设置颜色模式 |
| `.toggleMode()` | 切换亮/暗 |
| `.setCompact(boolean)` | 切换紧凑 |
| `.setFollowSystem(boolean)` | 跟随系统 |
| `.isDark` | 是否暗色 |
| `.effectiveMode` | 生效模式 |
| `.systemMode` | 系统偏好模式 |
| `.availableThemes` | 可用主题列表 |
| `.clear()` | 清除存储恢复默认 |
| `.destroy()` | 销毁系统主题监听 |

### CSS 变量

| API | 说明 |
|-----|------|
| `tokenToCSSVars(token, prefix?)` | 令牌转 CSS Vars |
| `cssVarsToString(vars, selector?)` | Vars 转 CSS 文本 |
| `injectCSSVars(content, id)` | 注入 CSS 文本到 DOM |
| `removeCSSVars(id)` | 移除 |
| `clearAllCSSVars()` | 清除全部 |
| `useCSSVarsBridge(mapping, options?)` | 单组件 CSS 变量桥接 |
| `useCSSVarsBridgeAll(bridges)` | 批量执行多个桥接函数 |

### 类型

| 类型 | 说明 |
|-----|------|
| `StyleEnhancer` | `(token: SemanticToken) => string` 样式增强函数 |
| `CSSVarsMapping<T>` | 组件令牌到 CSS 变量名的映射 |
| `CSSVarsBridgeOptions` | 桥接选项（`selector` 等） |
