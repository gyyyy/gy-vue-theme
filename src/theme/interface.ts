/**
 * 主题引擎核心类型定义
 *
 * 定义 ThemeMode、ThemeDefinition、ThemeConfig、ResolvedTheme 等核心类型。
 */

import type { SeedToken } from '@/token/interface/seed';
import type { BaseToken } from '@/token/interface/base';
import type { SemanticToken } from '@/token/interface/semantic';
import type { ComponentTokenMap } from '@/token/interface/component';

// ============================================================
// 样式增强类型
// ============================================================

/**
 * CSS 样式的最小单元：静态字符串或基于令牌的工厂函数
 *
 * - **字符串**：直接作为 CSS 文本注入，适合从 `.css`/`.less`/`.scss` 文件
 *   通过 Vite `?inline` 导入的静态样式（Vite 会在构建期编译 Less/SCSS）：
 *   ```typescript
 *   import resetCSS  from './reset.css?inline'
 *   import resetLess from './reset.less?inline'   // 需要项目安装 less
 *   import resetSCSS from './reset.scss?inline'   // 需要项目安装 sass
 *   defineTheme({ baseStyles: resetCSS })
 *   ```
 * - **函数**：接收语义令牌，返回 CSS 文本，主题/模式切换时响应式更新：
 *   ```typescript
 *   const fn: StyleValue = (token) => `
 *     .el-card { border-left: 3px solid ${token.colorPrimary}; }
 *   `
 *   ```
 */
export type StyleValue = string | ((token: SemanticToken) => string);

/**
 * 基础样式（低优先级，全局基线）
 *
 * 在 CSS 变量之前注入（`gy-base-*`），可被所有后续样式覆盖。
 * 适合放 CSS reset、字体渲染优化、滚动条默认外观等基础规则。
 *
 * ```typescript
 * const reset: BaseStyle = `*, *::before, *::after { box-sizing: border-box; }`
 * const bodyFont: BaseStyle = (token) => `body { font-family: ${token.fontFamily}; }`
 * ```
 */
export type BaseStyle = StyleValue;

// ============================================================
// 基础类型
// ============================================================

/** 颜色模式：亮色或暗色 */
export type ThemeMode = 'light' | 'dark';

/**
 * 色彩派生算法函数
 *
 * 负责从种子令牌生成完整的基础令牌（包含色板、中性色等）。
 * 亮色和暗色模式使用不同的色彩派生算法。
 *
 * @param seedToken - 种子令牌
 * @returns 完整的基础令牌
 */
export type ColorDerivativeFunc = (seedToken: SeedToken) => BaseToken;

// ============================================================
// 主题定义
// ============================================================

/**
 * 主题定义
 *
 * 由主题开发者（库使用者）通过 defineTheme() 创建。
 * 每个主题包含种子令牌覆盖、色彩派生算法和语义覆盖。
 */
export interface ThemeDefinition {
  /** 主题名称（唯一标识） */
  name: string;

  /**
   * 默认颜色模式
   *
   * 声明该主题的首选模式。当 ThemeConfig 未指定 mode 时，
   * 优先使用此值，否则回退到 'light'。
   *
   * @default 'light'
   */
  defaultMode?: ThemeMode;

  /**
   * 基础样式
   *
   * 在所有主题样式（CSS 变量、增强器）之前注入，优先级最低，可被完全覆盖。
   * 适合用于：
   * - 全局 CSS reset / normalize
   * - 跨组件的基础视觉约定（默认字体、行高等）
   * - 覆盖组件库出厂样式中与设计规范冲突的部分
   *
   * 接受 `BaseStyle`（静态字符串或令牌驱动函数）的单值或数组。
   * 支持 Vite `?inline` 导入，可直接使用 CSS/Less/SCSS 文件：
   * ```typescript
   * import resetCSS  from './reset.css?inline'
   * import resetLess from './reset.less?inline'   // 需要项目安装 less
   * import resetSCSS from './reset.scss?inline'   // 需要项目安装 sass
   * defineTheme({ baseStyles: resetCSS })
   * ```
   */
  baseStyles?: BaseStyle | BaseStyle[];

  /**
   * 种子令牌覆盖
   *
   * 与 `semanticToken` 结构对称：
   * - `common`：两种模式共享（品牌色、字体、尺寸等），算法以此为输入生成整套色板
   * - `light`：仅亮色模式生效，可选
   * - `dark`：仅暗色模式生效，可选
   *
   * `light` / `dark` 的合并优先级高于 `common`。
   * `colorBgBase`、`colorTextBase`、`colorLink` 等在亮/暗模式下语义相反的令牌，
   * 请放在 `light` / `dark` 中，避免两个算法收到同一份基准值。
   */
  seedToken?: {
    common: Partial<SeedToken>;
    light?: Partial<SeedToken>;
    dark?: Partial<SeedToken>;
  };

  /**
   * 色彩派生算法
   *
   * 分别指定亮色/暗色模式的派生算法。
   * 不提供时使用库内置的默认算法（defaultLightAlgorithm / defaultDarkAlgorithm）。
   *
   * @example
   * ```typescript
   * defineTheme({
   *   name: '影安蓝',
   *   algorithm: {
   *     light: defaultLightAlgorithm,
   *     dark: defaultDarkAlgorithm,
   *   },
   * })
   * ```
   */
  algorithm?: {
    light?: ColorDerivativeFunc;
    dark?: ColorDerivativeFunc;
  };

  /**
   * 语义化令牌覆盖
   *
   * 在算法派生完成后，直接覆盖指定的语义化令牌值。
   * 支持三个层级：
   * - `common`：两种模式共享的覆盖
   * - `light`：仅亮色模式生效
   * - `dark`：仅暗色模式生效
   *
   * 覆盖优先级（从低到高）：
   * 1. 算法派生 → 2. common → 3. light/dark（按当前模式）
   *    → 4. 运行时覆盖（ThemeConfig.semanticToken）
   *
   * 注意：这不会影响算法的级联计算。如果需要从源头改变派生结果，
   * 应通过 `seedToken`（种子令牌覆盖）或自定义算法实现。
   *
   * @example
   * ```typescript
   * defineTheme({
   *   name: '影安蓝',
   *   semanticToken: {
   *     common: { controlItemBgActive: '#BAE7FF' },
   *     light: { colorBgLayout: '#F6F8FA', colorText: '#24292F' },
   *     dark: { colorBgLayout: '#0D1117', colorText: '#F0F6FC' },
   *   },
   * })
   * ```
   */
  semanticToken?: {
    common?: Partial<SemanticToken>;
    light?: Partial<SemanticToken>;
    dark?: Partial<SemanticToken>;
  };
}

// ============================================================
// 主题配置
// ============================================================

/**
 * 主题运行时配置
 *
 * 由应用开发者传递给 ThemeProvider，选择主题、模式，并可覆盖令牌。
 */
export interface ThemeConfig {
  /**
   * 主题定义（通过 defineTheme 创建）
   * 不提供时使用内置的默认主题
   */
  theme?: ThemeDefinition;

  /**
   * 颜色模式
   * - 'light'（默认）：亮色模式
   * - 'dark'：暗色模式（需主题支持）
   */
  mode?: ThemeMode;

  /**
   * 是否启用紧凑模式
   * 仅影响尺寸相关令牌，与颜色模式正交
   */
  compact?: boolean;

  /**
   * 种子令牌覆盖（运行时级别）
   *
   * 结构与 `ThemeDefinition.seedToken` 相同。
   * 优先级高于主题定义中的 `seedToken`，适合应用端进行微调。
   */
  seedToken?: {
    common: Partial<SeedToken>;
    light?: Partial<SeedToken>;
    dark?: Partial<SeedToken>;
  };

  /**
   * 语义化令牌覆盖（运行时级别）
   *
   * 在所有算法派生及主题级覆盖之后，再应用此覆盖。
   * 优先级最高，适合应用开发者进行微调。
   */
  semanticToken?: Partial<SemanticToken>;

  /**
   * 组件令牌覆盖
   * 按组件名分组
   */
  componentToken?: {
    [K in keyof ComponentTokenMap]?: Partial<ComponentTokenMap[K]> & {
      /** 是否让组件令牌也参与算法派生 */
      algorithm?: boolean;
    };
  };

  /**
   * CSS 变量模式配置
   *
   * 默认自动注入 --gy-* CSS 变量到 :root。
   * 设为 false 可禁用注入。
   * 设为对象可自定义前缀和选择器。
   */
  cssVar?: false | {
    /** CSS 变量前缀，默认 'gy' */
    prefix?: string;
    /** 挂载点选择器，默认 ':root' */
    selector?: string;
  };
}

// ============================================================
// 解析后的主题
// ============================================================

/**
 * 解析后的完整主题对象
 */
export interface ResolvedTheme {
  /** 主题名称 */
  name: string;
  /** 当前颜色模式 */
  mode: ThemeMode;
  /** 是否紧凑模式 */
  compact: boolean;
  /** 种子令牌（合并后） */
  seedToken: SeedToken;
  /** 基础令牌（算法派生后） */
  baseToken: BaseToken;
  /** 语义化令牌（格式化映射后） */
  semanticToken: SemanticToken;
  /** 组件令牌覆盖配置 */
  componentToken: ThemeConfig['componentToken'];
  /** CSS 变量配置 */
  cssVar: ThemeConfig['cssVar'];
  /** 令牌哈希值（用于缓存键） */
  hashId: string;
}
