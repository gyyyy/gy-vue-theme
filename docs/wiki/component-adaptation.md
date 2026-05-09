# UI 组件适配指南

本文面向**框架适配者**，介绍如何将 `gy-vue-theme` 的语义令牌桥接到具体 UI 框架（如 Ant Design、Element Plus）或自定义组件库的样式上。

## 概述

适配器解决的核心问题：**让 UI 框架的组件样式能跟随主题变化。**

适配器与主题**完全正交**，新主题自动适配已有的适配器，新适配器也能自动接受所有已有主题。两者通过 `SemanticToken` 契约层解耦。

适配器的核心工作分为三步：

1. **定义组件令牌**（必需）：通过 `defineComponentToken()` 将语义令牌映射为组件级设计变量
2. **桥接 CSS 变量**（可选）：针对 CSS 变量驱动的 UI 框架，将组件令牌注入为对应的 CSS 自定义属性
3. **样式增强**（可选）：通过 `StyleEnhancer` 注入任意 CSS 规则，突破框架原有样式限制

```
SemanticToken ──→ ComponentToken ──→ CSS 变量桥接（Ant Design、Element Plus 等）
                       │
                       ├──→ useComponentToken()（自定义组件 / JS 消费）
                       │
      SemanticToken ───┴──→ StyleEnhancer（深度样式定制）
```

组件令牌是**始终需要定义**的中间抽象层。它既可以被应用开发者的自定义组件直接消费，也可以进一步桥接为 CSS 变量来驱动第三方 UI 框架。

## 核心概念

### 组件令牌

组件令牌是特定于某个 UI 组件的设计变量，例如 Button 的 `primaryBg`、Card 的 `headerColor`。它们从 `SemanticToken` 派生，是语义令牌与具体组件之间的关联层：

```
SemanticToken.colorPrimary  → ElButton.primaryBg
SemanticToken.colorBorder   → ElInput.borderColor
SemanticToken.colorSuccess  → StatusTag.successBg
```

定义组件令牌后，应用开发者可以：
- 通过 `useComponentToken('ElButton')` 在 JS 中获取类型安全的设计值
- 在自定义 CSS 中引用这些值
- 通过 `ThemeConfig.componentToken` 在运行时覆盖特定组件的令牌

### CSS 变量桥接

对于通过 CSS 自定义属性驱动样式的 UI 框架（如 Element Plus），还需要一个桥接层，将**组件令牌**的值注入为框架对应的 CSS 变量：

```
ElButton.primaryBg       → --el-color-primary
ElInput.borderColor      → --el-border-color
ElInput.fontSize         → --el-font-size-base
```

框架内部会自动读取这些 CSS 变量来渲染组件，无需其他操作。

## 实现步骤

> **说明**：以下示例使用简化的组件令牌类型和映射来演示通用模式。

### 第一步：定义组件令牌文件

**在组件令牌定义文件中**完成三件事：定义 TypeScript 接口、通过声明合并扩展 `ComponentTokenMap`、创建 `defineComponentToken` 实例。类型既可以和令牌定义放在同一个文件，也可以像当前仓库的 Element Plus 适配器一样拆到独立的 `types.ts`：

```typescript
// src/tokens/button.ts
import { defineComponentToken } from 'gy-vue-theme'
import type { SemanticToken } from 'gy-vue-theme'

// 组件令牌接口
export interface ElButtonToken {
  primaryBg: string
  primaryText: string
  primaryBorder: string
  primaryHoverBg: string
  defaultBg: string
  defaultText: string
  defaultBorder: string
  fontSize: number
  fontWeight: number
  borderRadius: number
}

// 声明合并：将组件令牌扩展到 ComponentTokenMap
declare module 'gy-vue-theme' {
  interface ComponentTokenMap {
    ElButton: ElButtonToken
  }
}

// 组件令牌定义
export const elButtonToken = defineComponentToken('ElButton', (t: SemanticToken) => ({
  primaryBg: t.colorPrimary,
  primaryText: t.colorTextLightSolid,
  primaryBorder: t.colorPrimary,
  primaryHoverBg: t.colorPrimaryHover,
  defaultBg: t.colorBgContainer,
  defaultText: t.colorText,
  defaultBorder: t.colorBorder,
  fontSize: t.fontSize,
  fontWeight: t.fontWeightStrong,
  borderRadius: t.borderRadius,
}))
```

```typescript
// src/tokens/input.ts
import { defineComponentToken } from 'gy-vue-theme'
import type { SemanticToken } from 'gy-vue-theme'

export interface ElInputToken {
  bgColor: string
  textColor: string
  borderColor: string
  hoverBorderColor: string
  activeBorderColor: string
  placeholderColor: string
  fontSize: number
  borderRadius: number
}

declare module 'gy-vue-theme' {
  interface ComponentTokenMap {
    ElInput: ElInputToken
  }
}

export const elInputToken = defineComponentToken('ElInput', (t: SemanticToken) => ({
  bgColor: t.colorBgContainer,
  textColor: t.colorText,
  borderColor: t.colorBorder,
  hoverBorderColor: t.colorPrimaryHover,
  activeBorderColor: t.colorPrimary,
  placeholderColor: t.colorTextPlaceholder,
  fontSize: t.fontSize,
  borderRadius: t.borderRadius,
}))
```

映射函数的参数 `t` 就是当前生效的 `SemanticToken`，无论使用什么主题、什么颜色模式，这个函数都能正确地产出匹配当前视觉风格的组件令牌。

### 第二步：汇总令牌（tokens/index.ts）

在 `tokens/index.ts` 中统一导出所有组件的类型和实例：

```typescript
// src/tokens/index.ts
export type { ElButtonToken } from './button'
export type { ElInputToken } from './input'
// ... 其他类型

export { elButtonToken } from './button'
export { elInputToken } from './input'
// ... 其他实例

export const allComponentTokens = [
  elButtonToken,
  elInputToken,
  // ...
]
```

到这里，组件令牌已经可以被 `useComponentToken()` 消费了。如果你适配的是自建组件库，可以直接跳到「在组件中消费组件令牌」章节。

### 第三步：编写 CSS 变量映射函数（针对 CSS Var 驱动的框架，可选）

对于 Element Plus 这类框架，还需要将组件令牌映射到框架的 CSS 变量。每个 bridge 文件职责单一，**只包含纯映射函数**，从对应的 token 文件导入类型，不包含任何 Vue/DOM 调用：

```typescript
// src/bridges/button.ts
import type { CSSVarsMapping } from 'gy-vue-theme'
import type { ElButtonToken } from '../tokens/button'

// 纯映射函数（无副作用）
const mapButtonVars: CSSVarsMapping<ElButtonToken> = (t: ElButtonToken) => ({
  '--el-button-bg-color': t.defaultBg,
  '--el-button-text-color': t.defaultText,
  '--el-button-border-color': t.defaultBorder,
  '--el-button-hover-text-color': t.primaryHoverBg,
  '--el-button-hover-border-color': t.primaryHoverBg,
  '--el-border-radius-base': `${t.borderRadius}px`,
  '--el-font-size-base': `${t.fontSize}px`,
  // ... 更多映射
})
```

```typescript
// src/bridges/input.ts
import type { CSSVarsMapping } from 'gy-vue-theme'
import type { ElInputToken } from '../tokens/input'

const mapInputVars: CSSVarsMapping<ElInputToken> = (t: ElInputToken) => ({
  '--el-input-bg-color': t.bgColor,
  '--el-input-text-color': t.textColor,
  '--el-input-border-color': t.borderColor,
  '--el-input-hover-border-color': t.hoverBorderColor,
  '--el-input-focus-border-color': t.activeBorderColor,
  '--el-input-placeholder-color': t.placeholderColor,
  // ... 更多映射
})
```

适配者的开发量只集中在**映射函数**上，将组件令牌字段映射到框架的 CSS 变量名。桥接层的运行时逻辑全部由核心库处理：

- **响应式**：主题/模式切换时 CSS 变量自动更新
- **清理**：组件卸载（`onScopeDispose`）时自动移除已注入的 CSS 变量
- **目标控制**：通过 `options.target` 指定挂载的 DOM 元素，默认 `document.documentElement`
- **选择器模式**：通过 `options.selector` 指定 CSS 选择器，使用 `<style>` 标签注入
- **SSR 安全**：无 `document` 时静默跳过，不抛异常

#### 元素模式 vs 选择器模式

`useCSSVarsBridge` 支持两种注入模式：

- **元素模式**（默认）：通过 `style.setProperty` 直接写入 DOM 元素。适用于全局 CSS 变量（如 `--el-color-primary`）。
- **选择器模式**：通过 `<style>` 标签注入带选择器的 CSS 规则。适用于**组件级 CSS 变量**（如 `--el-button-bg-color`）。

```typescript
// 元素模式：全局变量挂载到 :root
useCSSVarsBridge('ElGlobal', mapGlobalVars)

// 选择器模式：组件变量通过 <style> 标签注入
// 生成：html .el-button { --el-button-bg-color: ...; }
useCSSVarsBridge('ElButton', mapButtonVars, { selector: '.el-button' })
```

> **为什么需要选择器模式？**
> 许多框架（如 Element Plus）在组件元素上定义 CSS 变量（如 `.el-button { --el-button-bg-color: ... }`），
> 这使得 `:root` 级别的 `style.setProperty` 无法覆盖它们。
> 选择器模式会自动添加 `html` 前缀（如 `html .el-button { ... }`）以确保优先级高于组件自身的定义。

这样做的好处：
- 应用开发者通过 `ThemeConfig.componentToken.ElButton` 覆盖的值会**自动反映到 CSS 变量中**
- 组件令牌成为唯一的组件级设计值来源，无论是 JS 消费还是 CSS 变量注入

### 第四步：创建桥接入口（bridge.ts）

当前仓库的 Element Plus 适配器将映射函数与便捷组合函数都放在 `bridge.ts` 中。`useCSSVarsBridge` 的调用集中在这里，避免散落在各处：

```typescript
// src/bridge.ts
import { defineComponent } from 'vue'
import { useCSSVarsBridge } from 'gy-vue-theme'
import type { CSSVarsBridgeOptions } from 'gy-vue-theme'
import { mapGlobalTokenToElementVars, mapButtonVars, mapInputVars } from './bridge'

/**
 * 一键桥接 Element Plus 全局 CSS 变量
 *
 * 在 ThemeProvider 内部的 Vue setup 中调用即可。
 */
export function useElementPlusCSSVars(options: CSSVarsBridgeOptions = {}): void {
  useCSSVarsBridge('ElGlobal', mapGlobalTokenToElementVars, options)
}

/**
 * 一键桥接 Element Plus 全局 + 所有组件级 CSS 变量
 */
export function useAllElementPlusCSSVars(options: CSSVarsBridgeOptions = {}): void {
  useElementPlusCSSVars(options)
  useCSSVarsBridge('ElButton', mapButtonVars, { ...options, selector: '.el-button' })
  useCSSVarsBridge('ElInput', mapInputVars, { ...options, selector: '.el-input' })
  // ... 其他组件
}

/**
 * Renderless 桥接组件，作为 useElementPlusCSSVars 的组件形式
 */
export const ElementPlusThemeBridge = defineComponent({
  name: 'ElementPlusThemeBridge',
  setup() {
    useElementPlusCSSVars()
    return () => null
  },
})
```

### 第五步：创建适配器入口

```typescript
// src/index.ts
import { registerComponentToken } from 'gy-vue-theme'
import { allComponentTokens } from './tokens'
import './types'

/**
 * 注册所有组件令牌并初始化适配器
 */
export function setupElementPlusAdapter(): void {
  registerComponentToken(...allComponentTokens)
}

// 组件令牌类型
export type { ElButtonToken, ElInputToken } from './types'

// CSS 变量桥接（可选，仅 CSS Var 驱动的框架需要）
export { useElementPlusCSSVars, useAllElementPlusCSSVars, ElementPlusThemeBridge } from './bridge'

// 样式增强（可选）
export { cardAccentBorder, buttonElevation, createElementPlusEnhancers, createEnhancer } from './enhancers'
```

应用端的使用方式：

```vue
<script setup lang="ts">
import { ThemeProvider } from 'gy-vue-theme'
import { setupElementPlusAdapter, useAllElementPlusCSSVars } from 'my-element-plus-adapter'

// 应用启动时注册组件令牌
setupElementPlusAdapter()
</script>

<template>
  <!-- 方式 1（推荐）：通过 bridge prop 自动桥接，可选 enhancers 深度定制 -->
  <ThemeProvider :config="themeConfig" :bridge="useAllElementPlusCSSVars" :enhancers="[cardAccentBorder, buttonElevation]">
    <App />
  </ThemeProvider>

  <!-- 方式 2：仅桥接全局变量时，使用适配器导出的桥接组件 -->
  <!-- <ThemeProvider :config="themeConfig">
    <ElementPlusThemeBridge />
    <App />
  </ThemeProvider> -->
</template>
```

## 在组件中消费组件令牌

注册组件令牌后，应用开发者可以通过 `useComponentToken()` 在 JS 中获取令牌值。这适用于自定义组件、业务组件等任何需要响应主题的场景：

```vue
<!-- AppCard.vue -->
<script setup lang="ts">
import { useComponentToken } from 'gy-vue-theme'

const token = useComponentToken('AppCard')
</script>

<template>
  <div
    :style="{
      backgroundColor: token.value.bgColor,
      border: `1px solid ${token.value.borderColor}`,
      borderRadius: token.value.borderRadius + 'px',
      padding: token.value.padding + 'px',
    }"
  >
    <div
      :style="{
        backgroundColor: token.value.headerBg,
        color: token.value.headerColor,
      }"
    >
      <slot name="header" />
    </div>
    <slot />
  </div>
</template>
```

切换主题或亮暗模式时，组件令牌会自动重新计算，组件样式随之更新。

应用端也可以在运行时覆盖特定组件的令牌：

```typescript
const themeConfig: ThemeConfig = {
  theme: myTheme,
  componentToken: {
    ElButton: { fontWeight: 600 },
    AppCard: { borderRadius: 12 },
  },
}
```

覆盖的值会同时影响 `useComponentToken()` 和 CSS 变量桥接。

## 推荐包结构

```
my-adapter/
├── src/
│   ├── index.ts              # 入口：setupXxxAdapter + 统一导出
│   ├── types.ts              # ComponentTokenMap 声明合并与类型定义
│   ├── tokens.ts             # defineComponentToken 实例与 allComponentTokens
│   ├── bridge.ts             # CSSVarsMapping + useXxxCSSVars 便捷函数
│   ├── enhancers.ts          # StyleEnhancer 预置与工具函数
│   └── utils.ts              # 颜色/格式辅助函数
├── package.json
└── tsconfig.json
```

**关键设计原则：**
- 类型既可以和 `defineComponentToken` 放在同一个文件，也可以独立到 `types.ts`；当前仓库采用后者
- bridge 可以按组件拆目录，也可以像当前仓库一样集中在单个 `bridge.ts`
- `useCSSVarsBridge` 的调用应集中在桥接入口，避免散落到业务代码
- CSS Var 桥接整体是可选能力；不需要时只保留组件令牌即可

## 适配其他 UI 框架

无论适配什么框架，流程都是一致的：

1. **定义组件令牌**：可以按组件拆分文件，也可以像当前仓库一样集中到 `types.ts` + `tokens.ts`
2. **汇总注册入口**：在 `index.ts` 中调用 `registerComponentToken(...allComponentTokens)` 并统一导出公共 API
3. **编写映射函数**（如需要）：在 `bridge.ts` 或拆分的 bridge 文件中编写纯 `CSSVarsMapping<T>`
4. **创建便捷函数**（如需要）：集中调用 `useCSSVarsBridge` 组合成 `useXxxCSSVars`
5. **样式增强**（可选）：定义 `StyleEnhancer` 注入任意 CSS 规则

对于 CSS 变量驱动的框架（如 Naive UI），关键是找到框架的 CSS 变量命名规则（如 `--n-*`），编写组件令牌到这些变量的映射函数。`watchEffect`、DOM 注入/清除等运行时逻辑全部由核心库的 `useCSSVarsBridge()` 处理。

建议适配器同时导出：
- **组合函数**（如 `useNaiveUICSSVars`）：传给 `ThemeProvider` 的 `bridge` prop
- **桥接组件**（如 `<NaiveUIThemeBridge>`）：作为替代方案放在 `ThemeProvider` 内部

对于不使用 CSS 变量的框架或自建组件库，跳过第三步，直接通过 `useComponentToken()` 在 JS 中消费即可。

## 映射参考：SemanticToken 常用字段

定义组件令牌时最常用的语义令牌字段：

| 语义令牌 | 用途 | 典型组件令牌用途 |
| --- | --- | --- |
| `colorPrimary` | 主色 | Button 主色背景、链接色 |
| `colorPrimaryHover` | 主色悬停 | Button 悬停背景 |
| `colorPrimaryActive` | 主色激活 | Button 按下背景 |
| `colorPrimaryBg` | 主色浅背景 | Tag 浅色背景、Alert 背景 |
| `colorSuccess` / `Warning` / `Error` / `Info` | 功能色 | StatusTag 各状态色 |
| `colorText` | 主文本 | 组件默认文本色 |
| `colorTextSecondary` | 次要文本 | 描述文本、辅助信息 |
| `colorTextPlaceholder` | 占位文本 | Input 占位符 |
| `colorTextDisabled` | 禁用文本 | 禁用态组件文本 |
| `colorBgContainer` | 容器背景 | Card、Input、Modal 背景 |
| `colorBgLayout` | 页面背景 | 布局区域背景 |
| `colorBgElevated` | 浮层背景 | Dropdown、Popover 背景 |
| `colorBorder` | 边框 | Input 边框、Card 边框 |
| `colorFill` | 填充 | Checkbox、Switch 填充 |
| `fontSize` | 基础字号 | 组件默认字号 |
| `fontFamily` | 字体族 | 全局字体 |
| `borderRadius` | 圆角 | 组件默认圆角 |
| `controlHeight` | 控件高度 | Button、Input 高度 |
| `lineWidth` | 边框宽度 | 边框粗细 |
| `boxShadow` | 阴影 | Card、Dropdown 阴影 |
| `colorTextLightSolid` | 亮底文本（白色） | 按钮文本、徽标文本 |

## 样式增强（深度定制）

CSS 变量桥接只能替换框架已有 CSS 变量的值，无法注入任意 CSS 规则。当主题需要**突破框架原有样式限制**时（如给 Card 添加左边线、Button 添加阴影、组件添加过渡动画等），可以使用 **StyleEnhancer** 机制。

### StyleEnhancer 是什么

`StyleEnhancer` 是一个函数，接收当前的 `SemanticToken`，返回任意 CSS 文本：

```typescript
import type { StyleEnhancer } from 'gy-vue-theme'

// 给 Card 添加主题色左边线
export const cardAccentBorder: StyleEnhancer = (token) => `
  html .el-card {
    border-left: 3px solid ${token.colorPrimary};
  }
`

// 给 Button 添加主题色阴影
export const buttonElevation: StyleEnhancer = (token) => `
  html .el-button--primary {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  html .el-button--primary:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
`
```

核心库通过 `useStyleEnhancer()` 将增强函数注入为 `<style>` 标签，并在语义令牌变化时（主题/模式切换）自动重新生成。

### 谁来定义增强？

| 角色 | 场景 |
|------|------|
| **主题开发者** | 在主题包中定义增强，为主题添加独特的视觉特征 |
| **框架适配者** | 提供预置增强（如 `cardAccentBorder`、`buttonElevation`），作为主题风格的可选组成部分 |
| **应用开发者** | 在应用层定制个性化样式（通过 ThemeProvider 的 `enhancers` prop） |

### 在适配器中提供增强

建议在适配器中创建 `enhancers.ts`，提供预置增强函数和工具：

```typescript
// src/enhancers.ts
import type { StyleEnhancer } from 'gy-vue-theme'

// 预置增强
export const cardAccentBorder: StyleEnhancer = (token) => `
  html .el-card { border-left: 3px solid ${token.colorPrimary}; }
`

// 工具函数：快速创建增强
export function createEnhancer(selector: string, styles: (token: Parameters<StyleEnhancer>[0]) => string): StyleEnhancer {
  return (token) => `html ${selector} {\n  ${styles(token)}\n}`
}

// 推荐增强集合
export function createElementPlusEnhancers(): StyleEnhancer[] {
  return [cardAccentBorder, /* ... */]
}
```

应用端使用方式：

```vue
<ThemeProvider :config="themeConfig" :bridge="useElementPlusCSSVars" :enhancers="[cardAccentBorder, buttonElevation]">
```

### CSS 变量桥接 VS 样式增强

| 对比项 | CSS 变量桥接 | 样式增强 |
| --- | --- | --- |
| 能力范围 | 替换框架已有 CSS 变量的值 | 注入任意 CSS 规则 |
| 数据来源 | ComponentToken | SemanticToken |
| 注入方式 | `style.setProperty` 或 `<style>` 标签 | `<style>` 标签 |
| 典型用途 | 颜色、字号、间距等值替换 | 边框、阴影、渐变、动画等深度定制 |
| 是否必需 | 可选，但框架适配器通常需要 | 可选，按需使用 |

## 开发建议

1. **始终定义组件令牌**：组件令牌是语义令牌与组件之间的唯一关联层。即使只需要 CSS 变量桥接，也应先定义组件令牌，再从组件令牌桥接到 CSS 变量。
2. **映射函数应纯粹**：`defineComponentToken` 的回调不应有副作用，纯粹从语义令牌派生组件令牌。
3. **CSS 变量映射要完整**：遗漏某个 CSS 变量会导致该组件状态下回退到框架的默认值，造成视觉不一致。
4. **参考目标框架的源码**：找到框架定义 CSS 变量的文件，确保覆盖所有关键变量。
5. **测试多种主题**：在不同主题下验证适配效果，确保映射逻辑通用，不与特定主题耦合。
6. **StyleEnhancer 保持可选**：增强函数是附加的视觉优化，不应覆盖或破坏框架原有的基础样式。使用 `html` 前缀提升优先级时要注意不要过度覆盖。
7. **增强与桥接分工明确**：能通过 CSS 变量桥接实现的效果（如颜色、字号替换），就用桥接；只有框架不提供对应 CSS 变量的深度定制（如边框、阴影、动画），才使用 StyleEnhancer。
