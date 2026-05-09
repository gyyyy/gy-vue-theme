/**
 * 控件高度生成算法
 *
 * 基于种子令牌 controlHeight 的比例系数生成 4 级高度。
 */

import type { HeightMapToken } from '@/token/interface/base';

/**
 * 生成控件高度映射令牌
 *
 * @param baseHeight - 基础控件高度（种子令牌 controlHeight）
 * @returns HeightMapToken
 */
export function genHeightMap(baseHeight: number): HeightMapToken {
  return {
    controlHeightXS: baseHeight * 0.5,
    controlHeightSM: baseHeight * 0.75,
    controlHeight: baseHeight,
    controlHeightLG: baseHeight * 1.25,
  };
}
