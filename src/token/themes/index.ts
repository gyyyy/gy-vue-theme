/**
 * 主题算法导出
 *
 * 导出内置的亮色/暗色色彩派生算法和紧凑模式修饰函数。
 */

export { defaultLightAlgorithm } from './light/index';
export { defaultDarkAlgorithm } from './dark/index';
export { applyCompact } from './compact';
export { generateLightPalette, generateDarkPalette } from './shared/genColorPalette';
