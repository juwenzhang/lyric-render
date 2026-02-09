/**
 * 注意：注释的话是由 trae cue 功能生成的，自己不想写，让他来写即可吧
 */

/**
 * 基础歌词项
 * @interface BaseLyricItem
 * @description 基础歌词项，包含时间、文本、持续时间和单词数组
 * @property {number} time - 时间，单位为毫秒
 * @property {string} text - 文本
 * @property {number} duration - 持续时间，单位为毫秒
 * @property {Array<{ time: number; text: string }>} words - 单词数组，每个单词包含时间、文本
 */
export interface BaseLyricItem {
  time: number
  text: string
  duration?: number
  words?: Array<{
    time: number
    text: string
  }>
}

/**
 * 歌词源
 * @type LyricSource
 * @description 歌词源，可以是基础歌词项数组或字符串
 * @property {BaseLyricItem[]} items - 歌词项数组
 * @property {string} text - 歌词文本
 * @property {number} baseTime - 基础时间，单位为毫秒
 */
export type LyricSource = BaseLyricItem[] | string

/**
 * 解析选项
 * @interface ParseOptions
 * @description 解析选项，包含基础时间是否是否按单词分割
 * @property {number} baseTime - 基础时间，单位为毫秒
 * @property {boolean} isWordSplit - 是否按单词分割，默认值为false
 */
export interface ParseOptions {
  baseTime?: number
  isWordSplit?: boolean
}

/**
 * 滚动选项
 * @interface ScrollOptions
 * @description 滚动选项，包含容器高度、单行高度和对齐方式
 * @property {number} containerHeight - 容器高度，单位为像素
 * @property {number} singleLineHeight - 单行高度，单位为像素
 * @property {string} align - 对齐方式，默认值为'center'
 */
export interface ScrollOptions {
  containerHeight: number
  singleLineHeight: number
  align?: 'center' | 'top'
}

/**
 * 匹配歌词结果
 * @interface MatchLyricResult
 * @description 匹配歌词结果，包含索引和匹配的歌词项
 * @property {number} index - 索引
 * @property {BaseLyricItem | null} item - 匹配的歌词项，如果不存在则为null
 */
export interface MatchLyricResult {
  index: number
  item: BaseLyricItem | null
}
