/**
 * 令牌计算与解析
 *
 * 核心的令牌解析逻辑：合并种子令牌、选择色彩算法、
 * 生成基础令牌、应用紧凑修饰、格式化语义令牌。
 */

import type { SeedToken } from '@/token/interface/seed';
import type { SemanticToken } from '@/token/interface/semantic';
import type { ThemeMode, ThemeDefinition, ThemeConfig, ResolvedTheme, ColorDerivativeFunc } from './interface';
import { defaultSeedToken } from '@/token/seed';
import { defaultLightAlgorithm } from '@/token/themes/light/index';
import { defaultDarkAlgorithm } from '@/token/themes/dark/index';
import { applyCompact } from '@/token/themes/compact';
import { formatToken } from '@/util/formatToken';
import { defaultTheme } from './defineTheme';

/**
 * 根据主题定义和模式选择色彩派生算法
 *
 * @param theme - 主题定义
 * @param mode - 颜色模式
 * @returns 对应模式的色彩派生算法
 */
export function resolveColorAlgorithm(theme: ThemeDefinition, mode: ThemeMode): ColorDerivativeFunc {
  const algorithm = theme.algorithm;
  if (mode === 'dark') {
    return algorithm?.dark ?? defaultDarkAlgorithm;
  }
  return algorithm?.light ?? defaultLightAlgorithm;
}

/**
 * 令牌哈希值生成
 *
 * 使用 FNV-1a 算法生成令牌集合的哈希字符串，
 * 用于缓存键和 CSS 变量作用域隔离。
 *
 * @param token - 令牌对象
 * @returns 哈希字符串
 */
export function hashToken(token: SemanticToken): string {
  const str = JSON.stringify(token);
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * 解析主题配置，生成完整的令牌集合
 *
 * 完整流程：
 * 1. 合并种子令牌：defaultSeed + theme.seedToken.common + theme.seedToken.light/dark + config.seedToken.common + config.seedToken.light/dark
 * 2. 选择色彩算法（根据模式）
 * 3. 生成基础令牌
 * 4. 应用紧凑模式修饰（如果启用）
 * 5. 格式化为语义令牌
 * 6. 应用语义令牌覆盖：theme.semanticToken + config.semanticToken
 * 7. 生成哈希值
 *
 * @param config - 主题配置
 * @returns 解析后的完整主题对象
 */
export function resolveTheme(config: ThemeConfig = {}): ResolvedTheme {
  const theme = config.theme ?? defaultTheme;
  const mode: ThemeMode = config.mode ?? theme.defaultMode ?? 'light';
  const compact = config.compact ?? false;

  // 1. 合并种子令牌
  //    优先级（从低到高）：
  //    defaultSeed → theme.seedToken.common → theme.seedToken.light/dark（模式专属）
  //              → config.seedToken.common → config.seedToken.light/dark（模式专属）
  const themeModToken = mode === 'dark' ? theme.seedToken?.dark : theme.seedToken?.light;
  const configModToken = mode === 'dark' ? config.seedToken?.dark : config.seedToken?.light;
  const mergedSeed: SeedToken = {
    ...defaultSeedToken,
    ...theme.seedToken?.common,
    ...themeModToken,
    ...config.seedToken?.common,
    ...configModToken,
  };

  // 2. 选择色彩算法
  const algorithm = resolveColorAlgorithm(theme, mode);

  // 3. 生成基础令牌
  let baseToken = algorithm(mergedSeed);

  // 4. 应用紧凑模式修饰
  if (compact) {
    baseToken = applyCompact(baseToken);
  }

  // 5. 格式化为语义令牌
  // 6. 应用语义令牌覆盖
  //    优先级：算法派生 → common → light/dark（按模式） → 运行时覆盖
  const semantic = theme.semanticToken;
  const modeSemantic = mode === 'dark' ? semantic?.dark : semantic?.light;

  const semanticToken: SemanticToken = {
    ...formatToken(baseToken),
    ...semantic?.common,
    ...modeSemantic,
    ...config.semanticToken,
  };

  // 7. 生成哈希值
  const hash = hashToken(semanticToken);

  return {
    name: theme.name,
    mode,
    compact,
    seedToken: mergedSeed,
    baseToken,
    semanticToken,
    componentToken: config.componentToken,
    cssVar: config.cssVar,
    hashId: hash,
  };
}

/**
 * 静态获取设计令牌
 *
 * 无需 Vue 组件上下文即可获取完整令牌的静态函数。
 * 用于非组件场景（如 Node.js 脚本、构建时生成等）。
 *
 * @param config - 主题配置
 * @returns 完整的语义化令牌
 */
export function getDesignToken(config?: ThemeConfig): SemanticToken {
  return resolveTheme(config).semanticToken;
}
