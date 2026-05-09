/**
 * 种子令牌默认值
 *
 * 定义系统默认的种子令牌完整值。
 * 这些值作为主题系统的起点，可被用户覆盖。
 */

import type { SeedToken } from './interface/seed';

/** 默认主要字体族 */
const DEFAULT_FONT_FAMILY = [
  '-apple-system',
  'BlinkMacSystemFont',
  "'Segoe UI'",
  'Roboto',
  "'Helvetica Neue'",
  'Arial',
  "'Noto Sans'",
  'sans-serif',
  "'Apple Color Emoji'",
  "'Segoe UI Emoji'",
  "'Segoe UI Symbol'",
  "'Noto Color Emoji'",
].join(', ');

/** 默认代码字体族 */
const DEFAULT_FONT_FAMILY_CODE = [
  "'SFMono-Regular'",
  'Consolas',
  "'Liberation Mono'",
  'Menlo',
  'Courier',
  'monospace',
].join(', ');

/**
 * 种子令牌默认值
 *
 * 包含所有种子令牌的默认值，构成完整的设计体系基础。
 */
export const defaultSeedToken: SeedToken = {
  // -------- 预设颜色 --------
  blue: '#1677FF',
  purple: '#722ED1',
  cyan: '#13C2C2',
  green: '#52C41A',
  magenta: '#EB2F96',
  red: '#F5222D',
  orange: '#FA8C16',
  yellow: '#FADB14',
  volcano: '#FA541C',
  geekblue: '#2F54EB',
  gold: '#FAAD14',
  lime: '#A0D911',

  // -------- 功能颜色 --------
  colorPrimary: '#1677FF',
  colorSuccess: '#52C41A',
  colorWarning: '#FAAD14',
  colorError: '#FF4D4F',
  colorInfo: '#1677FF',
  
  // -------- 中性基色 --------
  colorBgBase: '',
  colorTextBase: '',
  colorLinkBase: '',

  // -------- 字体 --------
  fontFamily: DEFAULT_FONT_FAMILY,
  fontFamilyCode: DEFAULT_FONT_FAMILY_CODE,
  fontSize: 14,

  // -------- 线条 --------
  lineWidth: 1,
  lineType: 'solid',

  // -------- 圆角 --------
  borderRadius: 6,

  // -------- 尺寸 --------
  sizeUnit: 4,
  sizeStep: 4,
  sizePopupArrow: 16,
  controlHeight: 32,

  // -------- 动画 --------
  motionUnit: 0.1,
  motionBase: 0,
  motionEaseOutCirc: 'cubic-bezier(0.08, 0.82, 0.17, 1)',
  motionEaseInOutCirc: 'cubic-bezier(0.78, 0.14, 0.15, 0.86)',
  motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
  motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  motionEaseOutBack: 'cubic-bezier(0.12, 0.4, 0.29, 1.46)',
  motionEaseInBack: 'cubic-bezier(0.71, -0.46, 0.88, 0.6)',
  motionEaseInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
  motionEaseOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',

  // -------- 其他 --------
  zIndexBase: 0,
  zIndexPopupBase: 1000,
  opacityImage: 1,
  wireframe: false,
  motion: true,
};
