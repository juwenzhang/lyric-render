import type { BaseLyricItem, LyricSource, ParseOptions } from '../types'

/**
 * 默认的解析选项
 */
const DEFAULT_PARSE_OPTIONS: ParseOptions = {
  baseTime: 0,
  isWordSplit: false,
}

const LRC_REG = /\[(\d{2}):(\d{2})\.(\d{1,3})\](.*)/
const WORD_SPLIT_REG = /[\u4e00-\u9fa5a-zA-Z0-9]/g

/**
 * 解析歌词源
 * @param source 歌词源
 * @param options 解析选项
 * @returns 解析后的歌词项数组
 * @throws {Error} 如果解析过程中出现错误
 *
 * @example
 * const lyricItems = parseLyric(source);
 * console.log(lyricItems);
 *
 * @example
 * const lyricItems = parseLyric(source, {
 *   baseTime: 1000,
 *   isWordSplit: true
 * });
 * console.log(lyricItems);
 */
export const parseLyric = (
  source: LyricSource,
  options: ParseOptions = DEFAULT_PARSE_OPTIONS
): BaseLyricItem[] => {
  const { baseTime, isWordSplit } = options
  if (Array.isArray(source)) {
    return source
      .map((item) => ({
        ...item,
        time: item.time + (baseTime || 0),
      }))
      .sort((a, b) => a.time - b.time)
      .filter(Boolean)
  }
  if (typeof source === 'string') {
    const lyricList: BaseLyricItem[] = []
    const lines = source
      .split('\n')
      .filter((line) => line.trim() && LRC_REG.test(line))
    lines.forEach((line) => {
      const match = line.match(LRC_REG)
      if (!match) {
        return
      }
      const [, min, sec, ms, text] = match
      // 转化为时间戳的格式吧
      const time =
        Number(min) * 60 +
        Number(sec) +
        Number(ms.padEnd(3, '0')) / 1000 +
        (baseTime || 0)
      const pureText = text.trim()
      if (!pureText) {
        return
      }
      const lyricItem: BaseLyricItem = {
        time,
        text: pureText,
      }
      if (isWordSplit) {
        const words = pureText.match(WORD_SPLIT_REG) || []
        lyricItem.words = words.map((word, index) => ({
          time: time + index * 0.5,
          duration: 100,
          text: word,
        }))
      }
      lyricList.push(lyricItem)
    })
    return lyricList
  }
  return []
}
