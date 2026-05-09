/**
 * 通用梯度令牌生成
 *
 * 生成动画时长等通用梯度令牌。
 */

import type { CommonMapToken } from '@/token/interface/base';

/**
 * 生成通用映射令牌
 *
 * @param baseDuration - 动画基础时长
 * @param unit - 动画时长单位
 * @returns CommonMapToken
 */
export function genCommonMap(baseDuration: number, unit: number): CommonMapToken {
  return {
    motionDurationFast: `${(baseDuration + unit * 1).toFixed(1)}s`,
    motionDurationMid: `${(baseDuration + unit * 2).toFixed(1)}s`,
    motionDurationSlow: `${(baseDuration + unit * 3).toFixed(1)}s`,
  };
}
