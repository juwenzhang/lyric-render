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

    // 处理双语歌词，假设翻译行紧跟在原文行之后
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(LRC_REG)
      if (!match) {
        continue
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
        continue
      }
      const lyricItem: BaseLyricItem = {
        time,
        text: pureText,
      }

      // 检查下一行是否为翻译（时间相同或接近）
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        const nextMatch = nextLine.match(LRC_REG)
        if (nextMatch) {
          const [, nextMin, nextSec, nextMs, nextText] = nextMatch
          const nextTime =
            Number(nextMin) * 60 +
            Number(nextSec) +
            Number(nextMs.padEnd(3, '0')) / 1000 +
            (baseTime || 0)
          // 如果时间相同或非常接近，认为是翻译
          if (Math.abs(nextTime - time) < 0.1) {
            lyricItem.translate = nextText.trim()
            i++ // 跳过下一行，因为已经作为翻译处理
          }
        }
      }

      if (isWordSplit) {
        // 改进单词分割逻辑，使用更合理的规则
        // 对于中文，每个字符作为一个单词
        // 对于英文，连续的字母和数字作为一个单词
        const words: { text: string; start: number; end: number }[] = []
        let currentWord = ''
        let currentStart = 0

        for (let i = 0; i < pureText.length; i++) {
          const char = pureText[i]
          const isChinese = /[\u4e00-\u9fa5]/.test(char)
          const isAlphanumeric = /[a-zA-Z0-9]/.test(char)

          if (isChinese || isAlphanumeric) {
            if (currentWord === '') {
              currentStart = i
            }
            currentWord += char
          } else {
            if (currentWord) {
              words.push({ text: currentWord, start: currentStart, end: i })
              currentWord = ''
            }
            // 保留标点符号作为单独的单词
            words.push({ text: char, start: i, end: i + 1 })
          }
        }

        if (currentWord) {
          words.push({
            text: currentWord,
            start: currentStart,
            end: pureText.length,
          })
        }

        // 计算每个单词的时间，基于歌词长度和下一句歌词的时间
        let totalDuration = 2 // 默认2秒
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1]
          const nextMatch = nextLine.match(LRC_REG)
          if (nextMatch) {
            const [, nextMin, nextSec, nextMs] = nextMatch
            const nextTime =
              Number(nextMin) * 60 +
              Number(nextSec) +
              Number(nextMs.padEnd(3, '0')) / 1000 +
              (baseTime || 0)
            totalDuration = Math.max(0.5, nextTime - time) // 确保至少有0.5秒的持续时间
          }
        }

        // 计算每个单词的时间，基于歌词总时长和单词长度
        const totalTextLength = pureText.length
        let accumulatedTime = 0

        lyricItem.words = words.map((word, index) => {
          const wordDuration =
            totalDuration * (word.text.length / totalTextLength)
          const wordTime = time + accumulatedTime
          accumulatedTime += wordDuration

          return {
            time: wordTime,
            duration: wordDuration,
            text: word.text,
          }
        })
      }
      lyricList.push(lyricItem)
    }
    return lyricList
  }
  return []
}
