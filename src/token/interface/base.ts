/**
 * 基础令牌接口
 *
 * 基础令牌（也称 Map Token）由种子令牌通过数学算法自动派生生成。
 * 包含颜色色板、中性色、字号序列、尺寸序列、圆角序列等梯度变量。
 */

import type { SeedToken } from './seed';
import type { ColorPalettes } from '../presetColors';

// ============================================================
// 功能色原始色板子接口
// ============================================================

type FunctionalColorName = 'Primary' | 'Success' | 'Warning' | 'Error' | 'Info' | 'Link';
type FunctionalColorLightIndex = 1 | 2 | 3 | 4 | 5;
type FunctionalColorDarkIndex = 1 | 2 | 3 | 4;

/**
 * 功能色原始色板令牌
 *
 * 6 种功能色 × 9 级（Light1~5 + Dark1~4）= 54 个色板令牌。
 * Light 数字越大越亮（远离基准色），Dark 数字越大越暗（远离基准色）。
 * 基准色本身已在 ColorMapToken 中以语义名（如 colorPrimary）导出，不重复。
 * 供组件令牌按需直接取色，不受语义命名限制。
 */
export type FunctionalColorPalettes = {
  [K in `color${FunctionalColorName}Light${FunctionalColorLightIndex}`]: string;
} & {
  [K in `color${FunctionalColorName}Dark${FunctionalColorDarkIndex}`]: string;
};

// ============================================================
// 颜色梯度子接口
// ============================================================

/**
 * 功能色梯度令牌
 *
 * 每种功能色（Primary/Success/Warning/Error/Info）都生成
 * 10 个语义化颜色令牌。
 */
export interface ColorMapToken {
  // ---- Primary ----
  /** 主色最浅背景 */
  colorPrimaryBg: string;
  /** 主色背景悬停 */
  colorPrimaryBgHover: string;
  /** 主色边框 */
  colorPrimaryBorder: string;
  /** 主色边框悬停 */
  colorPrimaryBorderHover: string;
  /** 主色悬停 */
  colorPrimaryHover: string;
  /** 主色 */
  colorPrimary: string;
  /** 主色激活 */
  colorPrimaryActive: string;
  /** 主色文本悬停 */
  colorPrimaryTextHover: string;
  /** 主色文本 */
  colorPrimaryText: string;
  /** 主色文本激活 */
  colorPrimaryTextActive: string;

  // ---- Success ----
  /** 成功色最浅背景 */
  colorSuccessBg: string;
  /** 成功色背景悬停 */
  colorSuccessBgHover: string;
  /** 成功色边框 */
  colorSuccessBorder: string;
  /** 成功色边框悬停 */
  colorSuccessBorderHover: string;
  /** 成功色悬停 */
  colorSuccessHover: string;
  /** 成功色 */
  colorSuccess: string;
  /** 成功色激活 */
  colorSuccessActive: string;
  /** 成功色文本悬停 */
  colorSuccessTextHover: string;
  /** 成功色文本 */
  colorSuccessText: string;
  /** 成功色文本激活 */
  colorSuccessTextActive: string;

  // ---- Warning ----
  /** 警告色最浅背景 */
  colorWarningBg: string;
  /** 警告色背景悬停 */
  colorWarningBgHover: string;
  /** 警告色边框 */
  colorWarningBorder: string;
  /** 警告色边框悬停 */
  colorWarningBorderHover: string;
  /** 警告色悬停 */
  colorWarningHover: string;
  /** 警告色 */
  colorWarning: string;
  /** 警告色激活 */
  colorWarningActive: string;
  /** 警告色文本悬停 */
  colorWarningTextHover: string;
  /** 警告色文本 */
  colorWarningText: string;
  /** 警告色文本激活 */
  colorWarningTextActive: string;

  // ---- Error ----
  /** 错误色最浅背景 */
  colorErrorBg: string;
  /** 错误色背景悬停 */
  colorErrorBgHover: string;
  /** 错误色边框 */
  colorErrorBorder: string;
  /** 错误色边框悬停 */
  colorErrorBorderHover: string;
  /** 错误色悬停 */
  colorErrorHover: string;
  /** 错误色 */
  colorError: string;
  /** 错误色激活 */
  colorErrorActive: string;
  /** 错误色文本悬停 */
  colorErrorTextHover: string;
  /** 错误色文本 */
  colorErrorText: string;
  /** 错误色文本激活 */
  colorErrorTextActive: string;

  // ---- Info ----
  /** 信息色最浅背景 */
  colorInfoBg: string;
  /** 信息色背景悬停 */
  colorInfoBgHover: string;
  /** 信息色边框 */
  colorInfoBorder: string;
  /** 信息色边框悬停 */
  colorInfoBorderHover: string;
  /** 信息色悬停 */
  colorInfoHover: string;
  /** 信息色 */
  colorInfo: string;
  /** 信息色激活 */
  colorInfoActive: string;
  /** 信息色文本悬停 */
  colorInfoTextHover: string;
  /** 信息色文本 */
  colorInfoText: string;
  /** 信息色文本激活 */
  colorInfoTextActive: string;

  // ---- Link ----
  /** 链接色 */
  colorLink: string;
  /** 链接色悬停 */
  colorLinkHover: string;
  /** 链接色激活 */
  colorLinkActive: string;

  // ---- Background ----
  /** 容器背景色 */
  colorBgContainer: string;
  /** 浮层背景色 */
  colorBgElevated: string;
  /** 布局背景色 */
  colorBgLayout: string;
  /** 聚光灯背景色 */
  colorBgSpotlight: string;
  /** 模糊背景色 */
  colorBgBlur: string;
  /** 遮罩背景色 */
  colorBgMask: string;

  /** 纯色（反色）背景 */
  colorBgSolid: string;
  /** 纯色（反色）背景悬停 */
  colorBgSolidHover: string;
  /** 纯色（反色）背景激活 */
  colorBgSolidActive: string;

  // ---- Fill ----
  /** 一级填充色 */
  colorFill: string;
  /** 二级填充色 */
  colorFillSecondary: string;
  /** 三级填充色 */
  colorFillTertiary: string;
  /** 四级填充色（最浅） */
  colorFillQuaternary: string;

  // ---- Text ----
  /** 基础文本色 */
  colorTextBase: string;
  /** 基础背景色 */
  colorBgBase: string;

  /** 一级文本色（最深） */
  colorText: string;
  /** 二级文本色 */
  colorTextSecondary: string;
  /** 三级文本色 */
  colorTextTertiary: string;
  /** 四级文本色（最浅） */
  colorTextQuaternary: string;

  // ---- Border ----
  /** 一级边框色 */
  colorBorder: string;
  /** 二级边框色 */
  colorBorderSecondary: string;
}

// ============================================================
// 字号梯度子接口
// ============================================================

/** 字号相关的梯度令牌 */
export interface FontMapToken {
  /** 小号字号 */
  fontSizeSM: number;
  /** 标准字号 */
  fontSize: number;
  /** 大号字号 */
  fontSizeLG: number;
  /** 超大号字号 */
  fontSizeXL: number;

  /** 一级标题字号 */
  fontSizeHeading1: number;
  /** 二级标题字号 */
  fontSizeHeading2: number;
  /** 三级标题字号 */
  fontSizeHeading3: number;
  /** 四级标题字号 */
  fontSizeHeading4: number;
  /** 五级标题字号 */
  fontSizeHeading5: number;

  /** 标准行高 */
  lineHeight: number;
  /** 小号行高 */
  lineHeightSM: number;
  /** 大号行高 */
  lineHeightLG: number;

  /** 一级标题行高 */
  lineHeightHeading1: number;
  /** 二级标题行高 */
  lineHeightHeading2: number;
  /** 三级标题行高 */
  lineHeightHeading3: number;
  /** 四级标题行高 */
  lineHeightHeading4: number;
  /** 五级标题行高 */
  lineHeightHeading5: number;

  /** 标准字体高度（px） */
  fontHeight: number;
  /** 小号字体高度（px） */
  fontHeightSM: number;
  /** 大号字体高度（px） */
  fontHeightLG: number;
}

// ============================================================
// 尺寸梯度子接口
// ============================================================

/** 尺寸相关的梯度令牌 */
export interface SizeMapToken {
  /** 超超小号尺寸 */
  sizeXXS: number;
  /** 超小号尺寸 */
  sizeXS: number;
  /** 小号尺寸 */
  sizeSM: number;
  /** 标准尺寸 */
  size: number;
  /** 中小号尺寸 */
  sizeMS: number;
  /** 中号尺寸 */
  sizeMD: number;
  /** 大号尺寸 */
  sizeLG: number;
  /** 超大号尺寸 */
  sizeXL: number;
  /** 超超大号尺寸 */
  sizeXXL: number;
}

// ============================================================
// 控件高度子接口
// ============================================================

/** 控件高度梯度令牌 */
export interface HeightMapToken {
  /** 超小号控件高度 */
  controlHeightXS: number;
  /** 小号控件高度 */
  controlHeightSM: number;
  /** 标准控件高度（继承自 SeedToken） */
  controlHeight: number;
  /** 大号控件高度 */
  controlHeightLG: number;
}

// ============================================================
// 样式梯度子接口
// ============================================================

/** 样式相关的梯度令牌（线宽、圆角） */
export interface StyleMapToken {
  /** 加粗线宽 */
  lineWidthBold: number;

  /** 超小号圆角 */
  borderRadiusXS: number;
  /** 小号圆角 */
  borderRadiusSM: number;
  /** 标准圆角（继承自 SeedToken） */
  borderRadius: number;
  /** 大号圆角 */
  borderRadiusLG: number;
  /** 外部圆角 */
  borderRadiusOuter: number;
}

// ============================================================
// 通用梯度子接口
// ============================================================

/** 通用梯度令牌（动画时长等） */
export interface CommonMapToken {
  /** 快速动画时长 */
  motionDurationFast: string;
  /** 中速动画时长 */
  motionDurationMid: string;
  /** 慢速动画时长 */
  motionDurationSlow: string;
}

// ============================================================
// 完整的基础令牌接口
// ============================================================

/**
 * 基础令牌（Map Token）
 *
 * 由种子令牌通过算法派生生成，是完整的梯度变量集合。
 * 继承了种子令牌的所有属性，并添加了派生出的梯度变量。
 */
export interface BaseToken extends
  SeedToken,
  ColorPalettes,
  FunctionalColorPalettes,
  ColorMapToken,
  FontMapToken,
  SizeMapToken,
  HeightMapToken,
  StyleMapToken,
  CommonMapToken {}
