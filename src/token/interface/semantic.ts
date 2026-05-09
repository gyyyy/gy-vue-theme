/**
 * 语义化令牌接口
 *
 * 将基础令牌映射为具有明确业务语义的变量层。
 * 组件开发者直接使用语义化令牌，无需关心底层的颜色算法和梯度计算。
 */

import type { BaseToken } from './base';

/**
 * 语义化令牌接口
 *
 * 继承 BaseToken 的所有属性，并添加语义化映射的令牌属性。
 * 这些属性通过 formatToken() 函数从基础令牌派生。
 */
export interface SemanticToken extends BaseToken {
  // -------- 基本色语义 --------
  
  /** 浅色 */
  colorWhite: string;
  /** 深色 */
  colorBlack: string;

  // -------- 背景色语义 --------

  /** 内容区域填充色 */
  colorFillContent: string;
  /** 内容区域填充色悬停态 */
  colorFillContentHover: string;
  /** 交替行背景色 */
  colorFillAlter: string;
  /** 禁用态容器背景 */
  colorBgContainerDisabled: string;
  /** 文本背景悬停 */
  colorBgTextHover: string;
  /** 文本背景激活 */
  colorBgTextActive: string;

  // -------- 文本色语义 --------

  /** 占位文本色 */
  colorTextPlaceholder: string;
  /** 禁用文本色 */
  colorTextDisabled: string;
  /** 标题文本色 */
  colorTextHeading: string;
  /** 标签文本色 */
  colorTextLabel: string;
  /** 描述文本色 */
  colorTextDescription: string;
  /** 浅色实心文本（用于深色 Solid 背景上的文字） */
  colorTextLightSolid: string;
  /** 深色实心文本（用于浅色 Solid 背景上的文字） */
  colorTextDarkSolid: string;
  /** 高亮色 */
  colorHighlight: string;

  // -------- 边框色语义 --------

  /** 带背景的边框色 */
  colorBorderBg: string;
  /** 分割线色 */
  colorSplit: string;

  // -------- 图标色语义 --------

  /** 默认图标色 */
  colorIcon: string;
  /** 图标悬停色 */
  colorIconHover: string;

  // -------- 控件状态 --------

  /** 主要控件聚焦轮廓色 */
  controlOutline: string;
  /** 错误控件轮廓色 */
  colorErrorOutline: string;
  /** 警告控件轮廓色 */
  colorWarningOutline: string;

  /** 控件项悬停背景 */
  controlItemBgHover: string;
  /** 控件项选中背景 */
  controlItemBgActive: string;
  /** 控件项选中悬停背景 */
  controlItemBgActiveHover: string;
  /** 控件项选中禁用背景 */
  controlItemBgActiveDisabled: string;
  /** 临时轮廓色 */
  controlTmpOutline: string;

  // -------- 内边距语义 --------

  /** 超超小号内边距 */
  paddingXXS: number;
  /** 超小号内边距 */
  paddingXS: number;
  /** 小号内边距 */
  paddingSM: number;
  /** 标准内边距 */
  padding: number;
  /** 中号内边距 */
  paddingMD: number;
  /** 大号内边距 */
  paddingLG: number;
  /** 超大号内边距 */
  paddingXL: number;

  // -------- 外边距语义 --------

  /** 超超小号外边距 */
  marginXXS: number;
  /** 超小号外边距 */
  marginXS: number;
  /** 小号外边距 */
  marginSM: number;
  /** 标准外边距 */
  margin: number;
  /** 中号外边距 */
  marginMD: number;
  /** 大号外边距 */
  marginLG: number;
  /** 超大号外边距 */
  marginXL: number;
  /** 超超大号外边距 */
  marginXXL: number;

  // -------- 内容区间距 --------

  /** 大号内容水平内边距 */
  paddingContentHorizontalLG: number;
  /** 大号内容垂直内边距 */
  paddingContentVerticalLG: number;
  /** 标准内容水平内边距 */
  paddingContentHorizontal: number;
  /** 标准内容垂直内边距 */
  paddingContentVertical: number;
  /** 小号内容水平内边距 */
  paddingContentHorizontalSM: number;
  /** 小号内容垂直内边距 */
  paddingContentVerticalSM: number;

  // -------- 字体语义 --------

  /** 图标字号 */
  fontSizeIcon: number;
  /** 加粗字重 */
  fontWeightStrong: number;

  // -------- 控件布局语义 --------

  /** 控件轮廓宽度 */
  controlOutlineWidth: number;
  /** 控件交互尺寸 */
  controlInteractiveSize: number;
  /** 控件水平内边距 */
  controlPaddingHorizontal: number;
  /** 小号控件水平内边距 */
  controlPaddingHorizontalSM: number;
  /** 聚焦线宽 */
  lineWidthFocus: number;

  // -------- 不透明度语义 --------

  /** 加载态不透明度 */
  opacityLoading: number;

  // -------- 阴影语义 --------

  /** 基础阴影 */
  boxShadow: string;
  /** 次级阴影 */
  boxShadowSecondary: string;
  /** 三级阴影 */
  boxShadowTertiary: string;

  // -------- 响应式断点 --------

  /** 超小屏断点 */
  screenXS: number;
  /** 超小屏最小值 */
  screenXSMin: number;
  /** 超小屏最大值 */
  screenXSMax: number;
  /** 小屏断点 */
  screenSM: number;
  /** 小屏最小值 */
  screenSMMin: number;
  /** 小屏最大值 */
  screenSMMax: number;
  /** 中屏断点 */
  screenMD: number;
  /** 中屏最小值 */
  screenMDMin: number;
  /** 中屏最大值 */
  screenMDMax: number;
  /** 大屏断点 */
  screenLG: number;
  /** 大屏最小值 */
  screenLGMin: number;
  /** 大屏最大值 */
  screenLGMax: number;
  /** 超大屏断点 */
  screenXL: number;
  /** 超大屏最小值 */
  screenXLMin: number;
  /** 超大屏最大值 */
  screenXLMax: number;
  /** 超超大屏断点 */
  screenXXL: number;
  /** 超超大屏最小值 */
  screenXXLMin: number;
}
