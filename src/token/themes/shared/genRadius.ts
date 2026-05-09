/**
 * 圆角序列生成算法
 *
 * 基于种子令牌 borderRadius 的分段函数，生成 5 级圆角序列。
 */

import type { StyleMapToken } from '@/token/interface/base';

/**
 * 生成圆角相关样式令牌
 *
 * @param baseRadius - 基础圆角（种子令牌 borderRadius）
 * @param lineWidth - 基础线宽（种子令牌 lineWidth）
 * @returns StyleMapToken（包含圆角和线宽扩展）
 */
export function genStyleMap(baseRadius: number, lineWidth: number): StyleMapToken {
  let radiusXS: number;
  if (baseRadius >= 6) {
    radiusXS = 2;
  } else if (baseRadius >= 4) {
    radiusXS = baseRadius - 2;
  } else if (baseRadius >= 2) {
    radiusXS = baseRadius - 1;
  } else {
    radiusXS = baseRadius;
  }

  let radiusSM: number;
  if (baseRadius >= 6) {
    radiusSM = 4;
  } else if (baseRadius >= 4) {
    radiusSM = baseRadius - 1;
  } else {
    radiusSM = baseRadius;
  }

  let radiusLG: number;
  if (baseRadius >= 16) {
    radiusLG = 16;
  } else if (baseRadius >= 6) {
    radiusLG = baseRadius + 2;
  } else if (baseRadius >= 4) {
    radiusLG = baseRadius + 1;
  } else {
    radiusLG = baseRadius;
  }

  let radiusOuter: number;
  if (baseRadius > 4 && baseRadius < 8) {
    radiusOuter = 4;
  } else if (baseRadius >= 8) {
    radiusOuter = baseRadius - 4 + 4;
  } else {
    radiusOuter = baseRadius;
  }

  return {
    lineWidthBold: lineWidth + 1,

    borderRadiusXS: radiusXS,
    borderRadiusSM: radiusSM,
    borderRadius: baseRadius,
    borderRadiusLG: radiusLG,
    borderRadiusOuter: radiusOuter,
  };
}
