# 主题（样式）开发指南

本文面向**主题开发者**，介绍如何基于 `gy-vue-theme` 的令牌体系创建一套新的视觉主题。

## 概述

主题定义的本质是回答一个问题：**这套视觉风格长什么样？**

你需要做的核心工作：

1. 确定**种子令牌**：品牌色、字体等共用字段放 `token.seed`，按亮/暗色模式区分的字段则可放 `token.light`/`token.dark`
2. 如有需要，通过 `semanticToken` 对算法派生结果做**精确覆盖**
3. 通过 `defineTheme()` 导出一个冻结的 `ThemeDefinition` 对象

你**不需要**关心框架适配（那是适配器的事），也不需要关心应用集成（那是使用者的事）。三者通过 `SemanticToken` 契约层解耦。

## 令牌三层架构

```
SeedToken（种子令牌）
    │  影响最大、数量最少的设计变量
    v  色彩派生算法
BaseToken（基础令牌）
    │  色板梯度、字号序列、间距序列等
    v  语义映射
SemanticToken（语义令牌）
    │  业务含义：colorPrimary、colorBgLayout、fontSize ...
    v  组件桥接
ComponentToken（组件令牌）
       各 UI 框架自己的令牌
```

主题开发者主要关注最上面两层：**种子令牌**和**语义令牌覆盖**。

## 快速开始

### 最简主题

只需一行种子令牌即可创建主题，其余全部使用默认值：

```typescript
import { defineTheme } from 'gy-vue-theme'

export const greenTheme = defineTheme({
  name: 'green',
  token: { colorPrimary: '#00B96B' },
})
```

### 完整主题

```typescript
import { defineTheme } from 'gy-vue-theme'
import type { ThemeDefinition, BaseStyle } from 'gy-vue-theme'

// 种子令牌覆盖（亮/暗模式共用）
const seedTokenOverrides = {
  colorPrimary: '#1890FF',
  colorSuccess: '#52C41A',
  colorWarning: '#FAAD14',
  colorError: '#FF4D4F',
  colorInfo: '#1890FF',
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: 14,
  borderRadius: 6,
  controlHeight: 32,
} as const

// 亮色专属种子令牌（中性色基准 + 链接色）
const lightSeedOverrides = {
  colorBgBase: '#FFFFFF',
  colorTextBase: '#24292F',
  colorLinkBase: '#0969DA',
} as const

// 暗色专属种子令牌（中性色基准 + 链接色）
const darkSeedOverrides = {
  colorBgBase: '#0D1117',
  colorTextBase: '#F0F6FC',
  colorLinkBase: '#58A6FF',
} as const

// 亮色语义覆盖（算法无法精确还原的值）
const lightSemanticOverrides = {
  colorBgSpotlight: '#EAEEF2',
  colorFillContent: '#EAEEF2',
  colorBorder: '#D0D7DE',
  colorBorderSecondary: '#EAEEF2',
  colorSplit: '#D0D7DE',
  // ...
}

// 暗色语义覆盖（算法无法精确还原的值）
const darkSemanticOverrides = {
  colorBgSpotlight: '#21262D',
  colorFillContent: '#21262D',
  colorBorder: '#30363D',
  colorBorderSecondary: '#21262D',
  colorSplit: '#21262D',
  // ...
}

// 静态 CSS 字符串：不依赖令牌，最低优先级注入
const staticBase = `
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-font-smoothing: antialiased; }
  html, body { margin: 0; padding: 0; }
`

// 动态函数：随令牌/模式响应式更新，用令牌值配置 body 字体
const tokenBase: BaseStyle = (token) => `
  body {
    font-family: ${token.fontFamily};
    font-size: ${token.fontSize}px;
    color: ${token.colorText};
    background-color: ${token.colorBgLayout};
  }
`

export const myTheme: Readonly<ThemeDefinition> = defineTheme({
  name: 'my-theme',
  defaultMode: 'light',
  baseStyles: [staticBase, tokenBase],
  token: {
    seed: seedTokenOverrides,
    light: lightSeedOverrides,
    dark: darkSeedOverrides,
  },
  semanticToken: {
    light: lightSemanticOverrides,
    dark: darkSemanticOverrides,
  },
})

export default myTheme
```

## ThemeDefinition 接口详解

```typescript
interface ThemeDefinition {
  /** 主题唯一标识名 */
  name: string

  /** 默认颜色模式，不指定时回落到 'light' */
  defaultMode?: 'light' | 'dark'

  /**
   * 基础/重置样式
   *
   * 在 CSS 变量和样式增强器之前注入（最低优先级），适合放全局 reset、
   * 字体渲染优化、滚动条样式等基础规则。
   *
   * 支持两种形式：
   * - `string`：静态 CSS 字符串（也可用 Vite `?inline` 导入 CSS/Less/SCSS 文件）
   * - `(token: SemanticToken) => string`：动态函数，随令牌/模式更新
   *
   * 可传单个值或数组，数组按顺序注入。
   */
  baseStyles?: BaseStyle | BaseStyle[]

  /**
   * 种子令牌覆盖
   * - seed：亮/暗模式共用，**必填**（品牌色、字体、尺寸等）
   * - light：仅亮色模式生效，可选
   * - dark：仅暗色模式生效，可选
   */
  token?: {
    seed: Partial<SeedToken>
    light?: Partial<SeedToken>
    dark?: Partial<SeedToken>
  }

  /**
   * 色彩派生算法
   * 不提供时使用内置默认算法
   */
  algorithm?: {
    light?: ColorDerivativeFunc
    dark?: ColorDerivativeFunc
  }

  /**
   * 语义令牌覆盖
   * 在算法派生之后应用，用于精确修正
   */
  semanticToken?: {
    /** 亮暗共享 */
    common?: Partial<SemanticToken>
    /** 仅亮色模式 */
    light?: Partial<SemanticToken>
    /** 仅暗色模式 */
    dark?: Partial<SemanticToken>
  }
}
```

### 各字段说明

#### `name`

主题的唯一标识，用于 `useThemeStorage` 等注册表场景。建议使用英文短横线命名，如 `'my-theme'`、`'tech-blue'`。

#### `defaultMode`

声明主题的首选颜色模式。当应用端 `ThemeConfig` 未指定 `mode` 时，优先使用此值。

#### `baseStyles`

全局基础/重置样式，在 CSS 变量和样式增强器之前注入（最低优先级），用于放置与令牌无关或弱相关的全局基础规则。

注入顺序（优先级从低到高）：

```
baseStyles（gy-base-*）
  → CSS 变量（gy-theme-*）
    → 样式增强器（gy-enhance-*）
```

`BaseStyle` 支持两种形式，可混合在数组中：

```typescript
// 1. 静态 CSS 字符串，无需令牌，最适合 reset / 渲染优化
const staticBase: BaseStyle = `
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-font-smoothing: antialiased; }
`

// 2. 动态函数，接收完整 SemanticToken，随模式切换响应式更新
const tokenBase: BaseStyle = (t: SemanticToken) => `
  body {
    font-family: ${t.fontFamily};
    font-size: ${t.fontSize}px;
    color: ${t.colorText};
    background-color: ${t.colorBgLayout};
  }
`

defineTheme({
  // ...
  baseStyles: [staticBase, tokenBase],
})
```

**使用 Vite `?inline` 导入样式文件**（推荐用于 CSS/Less/SCSS reset 文件）：

```typescript
// Vite 在构建时将 Less 编译为 CSS 字符串，运行时直接注入 <style> 标签
import resetStyles from './styles/reset.less?inline'
import scrollbarStyles from './styles/scrollbar.css?inline'

defineTheme({
  // ...
  baseStyles: [resetStyles, scrollbarStyles, tokenBase],
})
```

> **何时用 `baseStyles`，何时用 `enhancers`？**
> - `baseStyles`：全局 reset、字体渲染优化、滚动条默认外观等，这些样式与令牌弱相关或无关，且应该被组件样式轻易覆盖。
> - `enhancers`（样式增强器）：对具体 UI 组件的细粒度调整，注入优先级最高，用于"最后一层"定制。

#### `token`

种子令牌覆盖对象，包含三个子字段：

- **`token.seed`**（必填）：两种模式共用的种子令牌。这是推动整个色板生成的核心。适合放在这里的字段：**与模式无关的品牌色、字体、尺寸、圆角**等。
- **`token.light`**（可选）：仅亮色模式生效，合并优先级高于 `seed`。
- **`token.dark`**（可选）：仅暗色模式生效，合并优先级高于 `seed`。

以下字段**强烈建议**放在 `token.light` / `token.dark` 而非 `token.seed` 中，因为它们的合理值在亮/暗模式下完全相反：

| 字段 | 亮色推荐值 | 暗色推荐值 | 原因 |
|------|-----------|-----------|------|
| `colorBgBase` | 浅色（如 `#FFF`） | 深色（如 `#000` / `#0D1117`） | 与文字方向相反 |
| `colorTextBase` | 深色（如 `#000` / `#24292F`） | 浅色（如 `#FFF` / `#F0F6FC`） | 亮色底文字深，暗色底文字浅 |
| `colorLinkBase` | 深蓝（如 `#0969DA`） | 亮蓝（如 `#58A6FF`） | 亮色模式需要低亮度保持对比度，暗色则相反 |

合并优先级（从低到高）：

```
defaultSeedToken
  → theme.token.seed（共享）
    → theme.token.light / theme.token.dark（按当前模式）
      → config.token.seed（运行时共享）
        → config.token.light / config.token.dark（运行时模式专属）
```

#### `algorithm`

色彩派生算法，用于从种子令牌生成完整的基础令牌（色板、中性色等）。两个字段都是可选的，不提供时自动使用内置默认算法。

> **大多数主题不需要自定义算法。** 除非你有非常特殊的色板生成逻辑，否则只需覆盖种子令牌和语义令牌即可。

#### `semanticToken`

在算法派生完成后，对语义令牌进行精确覆盖。典型场景：

- 算法生成的 `colorBgLayout` 不符合设计稿 → 在 `light` / `dark` 中精确指定
- 亮暗模式通用的调整 → 放在 `common` 中

覆盖优先级（从低到高）：

```
算法派生值 → common → light/dark（当前模式） → 运行时 ThemeConfig.semanticToken
```

## 种子令牌速查

| 类别 | 令牌 | 说明 | 默认值 | 备注 |
|------|------|------|--------|------|
| 品牌色 | `colorPrimary` | 主色调 | `#1677FF` | |
| 功能色 | `colorSuccess` | 成功 | `#52C41A` | |
| 功能色 | `colorWarning` | 警告 | `#FAAD14` | |
| 功能色 | `colorError` | 错误 | `#FF4D4F` | |
| 功能色 | `colorInfo` | 信息 | `#1677FF` | |
| 中性色 | `colorBgBase` | 背景基色 | 空（算法自动派生） | **推荐放 `token.light`/`token.dark`** |
| 中性色 | `colorTextBase` | 文本基色 | 空（算法自动派生） | **推荐放 `token.light`/`token.dark`** |
| 中性色 | `colorLinkBase` | 链接基色 | 空（回落到 colorInfo） | **推荐放 `token.light`/`token.dark`** |
| 字体 | `fontFamily` | 字体族 | 系统字体栈 |
| 字体 | `fontFamilyCode` | 等宽字体族 | 代码字体栈 |
| 字体 | `fontSize` | 基础字号(px) | `14` |
| 圆角 | `borderRadius` | 基础圆角(px) | `6` |
| 尺寸 | `sizeUnit` | 间距单位(px) | `4` |
| 尺寸 | `sizeStep` | 间距步长(px) | `4` |
| 尺寸 | `controlHeight` | 控件高度(px) | `32` |
| 线条 | `lineWidth` | 边框宽度(px) | `1` |
| 线条 | `lineType` | 边框类型 | `'solid'` |
| 动画 | `motion` | 是否启用动画 | `true` |
| 其他 | `wireframe` | 线框风格 | `false` |

完整列表见 `SeedToken` 类型定义。

## 常见语义令牌覆盖

以下是主题开发中最常需要精确覆盖的语义令牌：

| 令牌 | 说明 |
|------|------|
| `colorBgContainer` | 容器背景（卡片、弹窗等） |
| `colorBgLayout` | 页面布局背景 |
| `colorBgElevated` | 高层级容器背景（下拉、浮层） |
| `colorBgSpotlight` | 聚光/强调背景 |
| `colorText` | 主要文本 |
| `colorTextSecondary` | 次要文本 |
| `colorTextTertiary` | 辅助文本 |
| `colorTextDescription` | 描述性文本 |
| `colorTextPlaceholder` | 占位文本 |
| `colorBorder` | 主边框 |
| `colorBorderSecondary` | 次要边框 |
| `colorSplit` | 分割线 |
| `colorFillContent` | 内容区填充 |
| `colorFillAlter` | 交替填充（表格斑马条纹等） |
| `boxShadow` | 主阴影 |
| `boxShadowSecondary` | 次要阴影 |
| `boxShadowTertiary` | 最轻阴影 |

## 推荐包结构

```
theme-my-brand/
├── src/
│   ├── assets/           # 样式文件，如全局 reset 样式、外部字体
│   └── index.ts          # 主题定义，导出 ThemeDefinition
├── package.json
└── tsconfig.json
```

## 开发建议

1. **先从 `token.seed` 开始**：大多数风格差异只需调整品牌色和几个功能色即可。算法会自动生成完整的色板梯度。
2. **用 `token.light`/`token.dark` 分离模式相关的种子令牌**：`colorBgBase`、`colorTextBase`、`colorLink` 在亮/暗模式下语义相反，放在共享 `token.seed` 里会让两个算法拿到错误的基准值。
3. **语义覆盖只用于精确修正**：如果算法生成的背景色、文本色与设计稿不完全一致，再通过 `semanticToken.light` / `.dark` 精确覆盖。
4. **不需要覆盖与默认值相同的字段**：`defineTheme` 会自动回落到内置默认值，只写差异部分即可。
5. **不需要指定 algorithm**：除非有特殊的色板算法需求，内置的 `defaultLightAlgorithm` 和 `defaultDarkAlgorithm` 能满足绝大部分场景。
