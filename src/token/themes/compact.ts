/**
 * 紧凑模式修饰算法
 *
 * 紧凑模式仅修改尺寸相关令牌，不影响颜色。
 * 与颜色模式（亮色/暗色）正交，可自由组合。
 */

import type { BaseToken } from '@/token/interface/base';
import { genFontMap } from './shared/genFontMap';
import { genSizeMap } from './shared/genSizeMap';
import { genHeightMap } from './shared/genHeight';

/**
 * 应用紧凑模式修饰
 *
 * 修改尺寸相关令牌：
 * - 步长缩减：sizeStep - 2
 * - 控件高度缩减：controlHeight - 4
 * - 字号基准降级：使用 fontSizeSM（12）替代 fontSize（14）
 *
 * @param baseToken - 原始基础令牌
 * @returns 应用紧凑修饰后的基础令牌
 */
export function applyCompact(baseToken: BaseToken): BaseToken {
  const step = baseToken.sizeStep - 2;
  const height = baseToken.controlHeight - 4;

  return {
    ...baseToken,
    // 重新生成紧凑模式尺寸序列
    ...genSizeMap(baseToken.sizeUnit, step),
    // 使用小号字号作为基准重新计算字号映射
    ...genFontMap(baseToken.fontSizeSM),
    // 缩减控件高度
    ...genHeightMap(height),
    controlHeight: height,
    // 保留紧凑步长信息
    sizeStep: step,
  };
}
