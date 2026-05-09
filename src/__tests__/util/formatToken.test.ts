/**
 * formatToken 语义令牌映射测试
 */

import { describe, it, expect } from 'vitest';
import { formatToken } from '@/util/formatToken';
import { defaultLightAlgorithm } from '@/token/themes/light/index';
import { defaultSeedToken } from '@/token/seed';

describe('formatToken', () => {
  const baseToken = defaultLightAlgorithm(defaultSeedToken);
  const semanticToken = formatToken(baseToken);

  // -------- 颜色语义映射 --------

  it('应包含背景色语义令牌', () => {
    expect(semanticToken.colorFillContent).toBeDefined();
    expect(semanticToken.colorFillContentHover).toBeDefined();
    expect(semanticToken.colorFillAlter).toBeDefined();
    expect(semanticToken.colorBgContainerDisabled).toBeDefined();
    expect(semanticToken.colorBgTextHover).toBeDefined();
    expect(semanticToken.colorBgTextActive).toBeDefined();
  });

  it('应包含文本色语义令牌', () => {
    expect(semanticToken.colorTextPlaceholder).toBeDefined();
    expect(semanticToken.colorTextDisabled).toBeDefined();
    expect(semanticToken.colorTextHeading).toBeDefined();
    expect(semanticToken.colorTextLabel).toBeDefined();
    expect(semanticToken.colorTextDescription).toBeDefined();
    expect(semanticToken.colorTextLightSolid).toBe(baseToken.colorBgBase);
    expect(semanticToken.colorTextDarkSolid).toBe(baseToken.colorBgBase);
    expect(semanticToken.colorHighlight).toBeDefined();
  });

  it('应包含边框色语义令牌', () => {
    expect(semanticToken.colorBorderBg).toBeDefined();
    expect(semanticToken.colorSplit).toBeDefined();
  });

  it('应包含图标色语义令牌', () => {
    expect(semanticToken.colorIcon).toBeDefined();
    expect(semanticToken.colorIconHover).toBeDefined();
  });

  // -------- 控件状态 --------

  it('应包含控件状态令牌', () => {
    expect(semanticToken.controlOutline).toBeDefined();
    expect(semanticToken.colorErrorOutline).toBeDefined();
    expect(semanticToken.colorWarningOutline).toBeDefined();
    expect(semanticToken.controlItemBgHover).toBeDefined();
    expect(semanticToken.controlItemBgActive).toBeDefined();
    expect(semanticToken.controlItemBgActiveHover).toBeDefined();
    expect(semanticToken.controlItemBgActiveDisabled).toBeDefined();
    expect(semanticToken.controlTmpOutline).toBeDefined();
  });

  // -------- 间距映射 --------

  it('padding 应映射到尺寸序列', () => {
    expect(semanticToken.paddingXXS).toBe(baseToken.sizeXXS);
    expect(semanticToken.paddingXS).toBe(baseToken.sizeXS);
    expect(semanticToken.paddingSM).toBe(baseToken.sizeSM);
    expect(semanticToken.padding).toBe(baseToken.size);
    expect(semanticToken.paddingMD).toBe(baseToken.sizeMD);
    expect(semanticToken.paddingLG).toBe(baseToken.sizeLG);
    expect(semanticToken.paddingXL).toBe(baseToken.sizeXL);
  });

  it('margin 应映射到尺寸序列', () => {
    expect(semanticToken.marginXXS).toBe(baseToken.sizeXXS);
    expect(semanticToken.marginXS).toBe(baseToken.sizeXS);
    expect(semanticToken.marginSM).toBe(baseToken.sizeSM);
    expect(semanticToken.margin).toBe(baseToken.size);
    expect(semanticToken.marginXXL).toBe(baseToken.sizeXXL);
  });

  it('内容区间距应正确映射', () => {
    expect(semanticToken.paddingContentHorizontalLG).toBe(baseToken.sizeLG);
    expect(semanticToken.paddingContentVerticalLG).toBe(baseToken.sizeMS);
    expect(semanticToken.paddingContentHorizontal).toBe(baseToken.sizeMS);
    expect(semanticToken.paddingContentVertical).toBe(baseToken.sizeSM);
  });

  // -------- 字体语义 --------

  it('字体语义令牌应正确', () => {
    expect(semanticToken.fontSizeIcon).toBe(baseToken.fontSizeSM);
    expect(semanticToken.fontWeightStrong).toBe(600);
  });

  // -------- 控件布局 --------

  it('控件布局令牌应正确计算', () => {
    expect(semanticToken.controlOutlineWidth).toBe(baseToken.lineWidth * 2);
    expect(semanticToken.controlInteractiveSize).toBe(baseToken.controlHeight / 2);
    expect(semanticToken.controlPaddingHorizontal).toBe(12);
    expect(semanticToken.controlPaddingHorizontalSM).toBe(8);
    expect(semanticToken.lineWidthFocus).toBe(baseToken.lineWidth * 3);
  });

  // -------- 其他 --------

  it('不透明度应为 0.65', () => {
    expect(semanticToken.opacityLoading).toBe(0.65);
  });

  it('应包含阴影令牌', () => {
    expect(semanticToken.boxShadow).toContain('rgba');
    expect(semanticToken.boxShadowSecondary).toBeDefined();
    expect(semanticToken.boxShadowTertiary).toBeDefined();
  });

  // -------- 响应式断点 --------

  it('应包含响应式断点', () => {
    expect(semanticToken.screenXS).toBe(480);
    expect(semanticToken.screenSM).toBe(576);
    expect(semanticToken.screenMD).toBe(768);
    expect(semanticToken.screenLG).toBe(992);
    expect(semanticToken.screenXL).toBe(1200);
    expect(semanticToken.screenXXL).toBe(1600);
  });

  it('Min/Max 应正确配对', () => {
    expect(semanticToken.screenXSMin).toBe(semanticToken.screenXS);
    expect(semanticToken.screenXSMax).toBe(semanticToken.screenSM - 1);
    expect(semanticToken.screenSMMin).toBe(semanticToken.screenSM);
    expect(semanticToken.screenSMMax).toBe(semanticToken.screenMD - 1);
  });

  // -------- 继承基础令牌 --------

  it('应继承基础令牌的所有属性', () => {
    // SemanticToken extends BaseToken
    expect(semanticToken.fontSize).toBe(baseToken.fontSize);
    expect(semanticToken.colorPrimary).toBe(baseToken.colorPrimary);
    expect(semanticToken.sizeXS).toBe(baseToken.sizeXS);
  });

  // -------- 覆盖 --------

  it('override 参数应覆盖计算出的值', () => {
    const overridden = formatToken(baseToken, {
      colorTextPlaceholder: '#AAAAAA',
      fontWeightStrong: 700,
    });
    expect(overridden.colorTextPlaceholder).toBe('#AAAAAA');
    expect(overridden.fontWeightStrong).toBe(700);
  });

  it('不传 override 时应返回纯映射结果', () => {
    const result = formatToken(baseToken);
    expect(result).toBeDefined();
    expect(result.colorTextLightSolid).toBe(baseToken.colorBgBase);
  });
});
