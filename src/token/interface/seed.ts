/**
 * 种子令牌接口
 *
 * 种子令牌是整个设计体系的输入源，由设计师或主题配置者控制。
 * 数量最少，影响面最大。修改任一种子令牌，将通过派生算法
 * 自动影响到整个设计体系的所有下游令牌。
 */

import type { PresetColorName } from '../presetColors';

/**
 * 种子令牌接口
 *
 * 包含品牌色、中性色基础、字体、线条、圆角、尺寸、动画等
 * 控制整个设计体系的最小变量集。
 */
export interface SeedToken extends Record<PresetColorName, string> {
  // -------- 功能颜色 --------

  /** 品牌主色 */
  colorPrimary: string;
  /** 成功色 */
  colorSuccess: string;
  /** 警告色 */
  colorWarning: string;
  /** 错误色 */
  colorError: string;
  /** 信息色 */
  colorInfo: string;

  // -------- 中性基色 --------

  /** 基础背景色 */
  colorBgBase: string;
  /** 基础文本色 */
  colorTextBase: string;
  /** 链接色，空字符串时回退到 colorInfo */
  colorLinkBase: string;

  // -------- 字体 --------

  /** 主要字体族 */
  fontFamily: string;
  /** 代码字体族 */
  fontFamilyCode: string;
  /** 基础字号（px） */
  fontSize: number;

  // -------- 线条 --------

  /** 基础线宽（px） */
  lineWidth: number;
  /** 基础线型 */
  lineType: string;

  // -------- 圆角 --------

  /** 基础圆角（px） */
  borderRadius: number;

  // -------- 尺寸 --------

  /** 尺寸基础单位（px） */
  sizeUnit: number;
  /** 尺寸步长 */
  sizeStep: number;
  /** 弹出箭头尺寸（px） */
  sizePopupArrow: number;
  /** 基础控件高度（px） */
  controlHeight: number;

  // -------- 动画 --------

  /** 动画时长单位（s） */
  motionUnit: number;
  /** 动画时长基数（s） */
  motionBase: number;
  /** 缓动曲线：圆形出 */
  motionEaseOutCirc: string;
  /** 缓动曲线：圆形入出 */
  motionEaseInOutCirc: string;
  /** 缓动曲线：标准出 */
  motionEaseOut: string;
  /** 缓动曲线：标准入出 */
  motionEaseInOut: string;
  /** 缓动曲线：回弹出 */
  motionEaseOutBack: string;
  /** 缓动曲线：回弹入 */
  motionEaseInBack: string;
  /** 缓动曲线：五次方入 */
  motionEaseInQuint: string;
  /** 缓动曲线：五次方出 */
  motionEaseOutQuint: string;

  // -------- 其他 --------

  /** 基础层级 */
  zIndexBase: number;
  /** 弹出层基础层级 */
  zIndexPopupBase: number;
  /** 图片不透明度 */
  opacityImage: number;
  /** 是否启用线框模式 */
  wireframe: boolean;
  /** 是否启用动画 */
  motion: boolean;
}
