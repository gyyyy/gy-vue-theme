/**
 * 尺寸序列生成算法
 *
 * 基于 sizeUnit 和 sizeStep 的线性算法生成 9 级尺寸序列。
 */

import type { SizeMapToken } from '@/token/interface/base';

/**
 * 生成尺寸映射令牌
 *
 * @param baseSize - 尺寸基础单位（种子令牌 sizeUnit，默认 4）
 * @param step - 尺寸步长（种子令牌 sizeStep，默认 4）
 * @returns SizeMapToken
 */
export function genSizeMap(baseSize: number, step: number): SizeMapToken {
  return {
    sizeXXS: baseSize * (step - 3),
    sizeXS: baseSize * (step - 2),
    sizeSM: baseSize * (step - 1),
    size: baseSize * step,
    sizeMS: baseSize * step,
    sizeMD: baseSize * (step + 1),
    sizeLG: baseSize * (step + 2),
    sizeXL: baseSize * (step + 4),
    sizeXXL: baseSize * (step + 8),
  };
}
