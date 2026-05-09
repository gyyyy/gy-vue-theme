/**
 * 语义令牌映射函数
 *
 * 将基础令牌（BaseToken）映射为语义化令牌（SemanticToken）。
 * 所有语义化令牌的计算逻辑集中在此文件中。
 */

import type { BaseToken } from '@/token/interface/base';
import type { SemanticToken } from '@/token/interface/semantic';
import { getAlphaColorOnBg } from '@/util/color';

/**
 * 将基础令牌映射为语义化令牌
 *
 * @param baseToken - 完整的基础令牌对象
 * @param override - 用户覆盖的令牌值（优先级最高）
 * @returns 完整的语义化令牌对象
 */
export function formatToken(baseToken: BaseToken, override?: Partial<SemanticToken>): SemanticToken {
  const {
    // 颜色
    colorFillSecondary,
    colorFill,
    colorFillQuaternary,
    colorFillTertiary,
    colorTextQuaternary,
    colorText,
    colorTextSecondary,
    colorTextTertiary,
    colorError,
    colorBgContainer,
    colorBorderSecondary,
    colorPrimaryBg,
    colorPrimaryBgHover,
    colorErrorBg,
    colorWarningBg,
    colorBgBase,

    // 尺寸
    sizeXXS,
    sizeXS,
    sizeSM,
    size,
    sizeMS,
    sizeMD,
    sizeLG,
    sizeXL,
    sizeXXL,

    // 字号
    fontSizeSM,

    // 控件
    controlHeight,
    lineWidth,
  } = baseToken;

  // -------- 颜色语义映射 --------

  const colorWhite = '#FFFFFF';
  const colorBlack = '#000000';

  const colorFillContent = colorFillSecondary;
  const colorFillContentHover = colorFill;
  const colorFillAlter = colorFillQuaternary;
  const colorBgContainerDisabled = colorFillTertiary;
  const colorBgTextHover = colorFillSecondary;
  const colorBgTextActive = colorFill;

  const colorTextPlaceholder = colorTextQuaternary;
  const colorTextDisabled = colorTextQuaternary;
  const colorTextHeading = colorText;
  const colorTextLabel = colorTextSecondary;
  const colorTextDescription = colorTextTertiary;
  // colorBgSolid 以 textBase 为背景（反色），配对文本色为 bgBase
  const colorTextLightSolid = colorBgBase;
  const colorTextDarkSolid = colorBgBase;
  const colorHighlight = colorError;

  const colorBorderBg = colorBgContainer;
  const colorSplit = getAlphaColorOnBg(colorBorderSecondary, colorBgContainer);

  const colorIcon = colorTextTertiary;
  const colorIconHover = colorText;

  // -------- 控件状态映射 --------

  const controlOutline = getAlphaColorOnBg(colorPrimaryBg, colorBgContainer);
  const colorErrorOutline = getAlphaColorOnBg(colorErrorBg, colorBgContainer);
  const colorWarningOutline = getAlphaColorOnBg(colorWarningBg, colorBgContainer);

  const controlItemBgHover = colorFillTertiary;
  const controlItemBgActive = colorPrimaryBg;
  const controlItemBgActiveHover = colorPrimaryBgHover;
  const controlItemBgActiveDisabled = colorFill;
  const controlTmpOutline = colorFillQuaternary;

  // -------- 阴影 --------

  const boxShadow = '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)';
  const boxShadowSecondary = boxShadow;
  const boxShadowTertiary = '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)';

  // -------- 响应式断点 --------

  const screenXS = 480;
  const screenSM = 576;
  const screenMD = 768;
  const screenLG = 992;
  const screenXL = 1200;
  const screenXXL = 1600;

  const semanticToken: SemanticToken = {
    ...baseToken,

    // 基础色语义
    colorWhite,
    colorBlack,

    // 背景色语义
    colorFillContent,
    colorFillContentHover,
    colorFillAlter,
    colorBgContainerDisabled,
    colorBgTextHover,
    colorBgTextActive,

    // 文本色语义
    colorTextPlaceholder,
    colorTextDisabled,
    colorTextHeading,
    colorTextLabel,
    colorTextDescription,
    colorTextLightSolid,
    colorTextDarkSolid,
    colorHighlight,

    // 边框色语义
    colorBorderBg,
    colorSplit,

    // 图标色语义
    colorIcon,
    colorIconHover,

    // 控件状态
    controlOutline,
    colorErrorOutline,
    colorWarningOutline,
    controlItemBgHover,
    controlItemBgActive,
    controlItemBgActiveHover,
    controlItemBgActiveDisabled,
    controlTmpOutline,

    // 内边距（映射到尺寸序列）
    paddingXXS: sizeXXS,
    paddingXS: sizeXS,
    paddingSM: sizeSM,
    padding: size,
    paddingMD: sizeMD,
    paddingLG: sizeLG,
    paddingXL: sizeXL,

    // 外边距（映射到尺寸序列）
    marginXXS: sizeXXS,
    marginXS: sizeXS,
    marginSM: sizeSM,
    margin: size,
    marginMD: sizeMD,
    marginLG: sizeLG,
    marginXL: sizeXL,
    marginXXL: sizeXXL,

    // 内容区间距
    paddingContentHorizontalLG: sizeLG,
    paddingContentVerticalLG: sizeMS,
    paddingContentHorizontal: sizeMS,
    paddingContentVertical: sizeSM,
    paddingContentHorizontalSM: size,
    paddingContentVerticalSM: sizeXS,

    // 字体语义
    fontSizeIcon: fontSizeSM,
    fontWeightStrong: 600,

    // 控件布局语义
    controlOutlineWidth: lineWidth * 2,
    controlInteractiveSize: controlHeight / 2,
    controlPaddingHorizontal: 12,
    controlPaddingHorizontalSM: 8,
    lineWidthFocus: lineWidth * 3,

    // 不透明度
    opacityLoading: 0.65,

    // 阴影
    boxShadow,
    boxShadowSecondary,
    boxShadowTertiary,

    // 响应式断点
    screenXS,
    screenXSMin: screenXS,
    screenXSMax: screenSM - 1,
    screenSM,
    screenSMMin: screenSM,
    screenSMMax: screenMD - 1,
    screenMD,
    screenMDMin: screenMD,
    screenMDMax: screenLG - 1,
    screenLG,
    screenLGMin: screenLG,
    screenLGMax: screenXL - 1,
    screenXL,
    screenXLMin: screenXL,
    screenXLMax: screenXXL - 1,
    screenXXL,
    screenXXLMin: screenXXL,
  };

  // 应用用户覆盖
  if (override) {
    return { ...semanticToken, ...override };
  }

  return semanticToken;
}
