# gy-vue-theme

基于**设计令牌**的 Vue 主题开发库，提供三层令牌架构，将主题设计、框架适配和应用消费完全解耦。

## 架构

```
┌──────────────────────────────────────────────────────────────┐
│  主题开发者                                                    │
│  defineTheme() → 种子令牌 + 语义令牌覆盖                         │
├──────────────────── SemanticToken (契约层)────────────────────┤
│  框架适配者                                                    │
│  defineComponentToken() → 组件令牌 + CSS 变量桥接 + 样式增强      │
├──────────────────────────────────────────────────────────────┤
│  应用开发者                                                    │
│  ThemeProvider + 可选 ThemeStorage → 组装使用                  │
└──────────────────────────────────────────────────────────────┘
```

三个角色通过 `SemanticToken` 契约层解耦。
任意主题可搭配任意框架适配器。

## 特性

- **三层令牌架构**：SeedToken → BaseToken（算法派生）→ SemanticToken → ComponentToken
- **亮暗模式**：每个主题独立支持亮色/暗色模式，与主题定义解耦
- **紧凑模式**：与颜色模式正交的尺寸紧凑方案
- **CSS 变量集成**：令牌值一键注入为 CSS 自定义属性
- **CSS 变量桥接**：`useCSSVarsBridge` 将组件令牌桥接到 UI 框架的 CSS 变量
- **样式增强**：`useStyleEnhancer` 注入任意 CSS 规则，突破框架原有样式限制
- **偏好持久化**：`useThemeStorage` 支持注册表校验、跟随系统、SSR 安全
- **TypeScript 优先**：完整类型推导，组件令牌通过声明合并扩展
- **零运行时开销**：不使用的功能不产生副作用

## 安装

```bash
pnpm add gy-vue-theme
# 或
npm install gy-vue-theme
```

> **要求**：Vue >= 3.3.0

## 快速开始

```vue
<script setup lang="ts">
import { ThemeProvider, defineTheme } from 'gy-vue-theme'

const myTheme = defineTheme({
  name: 'my-theme',
  seedToken: { common: { colorPrimary: '#1890FF' } },
})
</script>

<template>
  <ThemeProvider :config="{ theme: myTheme, mode: 'light' }">
    <router-view />
  </ThemeProvider>
</template>
```

```vue
<!-- 子组件中消费令牌 -->
<script setup lang="ts">
import { useThemeToken, useThemeMode } from 'gy-vue-theme'

const token = useThemeToken()
const mode = useThemeMode()
</script>

<template>
  <div :style="{ color: token.value.colorPrimary }">
    当前模式：{{ mode.value }}
  </div>
</template>
```

## 文档

详细使用指南按角色分为三份文档，请根据你的角色选择阅读：

| 文档 | 面向角色 | 内容 |
| --- | --- | --- |
| [主题开发指南](docs/wiki/theme-development.md) | 主题开发者 | 如何定义种子令牌、语义覆盖，创建新主题包 |
| [组件适配指南](docs/wiki/component-adaptation.md) | 框架适配者 | 如何声明组件令牌、桥接 CSS 变量到 UI 框架 |
| [主题使用指南](docs/wiki/theme-usage.md) | 应用开发者 | 如何集成主题和适配器、切换模式、偏好持久化 |

## 开发

```bash
# 安装依赖
pnpm install    # 推荐
npm install     # 兼容

# 运行测试
pnpm test

# 构建
pnpm run build

# 类型检查
pnpm run type-check
```

## 许可证

[MIT](LICENSE)