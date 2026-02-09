import type { BaseLyricItem, MatchLyricResult, ScrollOptions } from '../types'

/**
 * 防抖函数
 * @param func 函数
 * @param delay 延迟时间，默认300毫秒
 * @returns 防抖函数
 *
 * @example
 * const debounceFunc = debounce((args: any[]) => {
 *   console.log(args);
 * }, 300);
 * debounceFunc(1, 2, 3);
 * // 300ms 后输出 [1, 2, 3]
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number = 300
): ((...args: Parameters<T>) => void) => {
  let timer: NodeJS.Timeout | null = null
  return (...args) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * 匹配歌词
 * @param currentTime 当前时间，单位为毫秒
 * @param lyricItems 歌词项数组
 * @returns 匹配歌词结果，包含索引和匹配的歌词项
 *
 * @example
 * const matchResult = matchLyric(currentTime, lyricItems);
 * console.log(matchResult);
 */
export const matchLyric = (
  currentTime: number,
  lyricItems: BaseLyricItem[]
): MatchLyricResult => {
  if (lyricItems.length === 0) {
    return {
      index: -1,
      item: null,
    }
  }
  let left = 0
  let right = lyricItems.length - 1
  let resIndex = -1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (lyricItems[mid].time <= currentTime) {
      resIndex = mid
      left = mid + 1
    } else {
      right = mid - 1
    }
  }
  return {
    index: resIndex,
    item: resIndex === -1 ? null : lyricItems[resIndex],
  }
}

/**
 * 计算滚动位置
 * @param index 索引
 * @param options 滚动选项
 * @returns 滚动位置
 *
 * @example
 * const scrollTop = calculateScrollTop(index, options);
 * console.log(scrollTop);
 */
export const calculateScrollTop = (
  index: number,
  options: ScrollOptions
): number => {
  const { containerHeight, singleLineHeight, align = 'center' } = options
  if (index === -1) {
    return 0
  }
  // 顶部对齐方式
  if (align === 'top') {
    return index * singleLineHeight
  }
  // 居中对齐方式吧
  const halfContainer = containerHeight / 2
  const halfLine = singleLineHeight / 2
  return Math.max(0, index * singleLineHeight - halfContainer + halfLine)
}

/**
 * 计算显示歌词数量
 * @param containerHeight 容器高度，单位为像素
 * @param singleLineHeight 单行高度，单位为像素
 * @returns 显示歌词数量
 *
 * @example
 * const showCount = calculateShowCount(containerHeight, singleLineHeight);
 * console.log(showCount);
 */
export const calculateShowCount = (
  containerHeight: number,
  singleLineHeight: number
): number => {
  return Math.floor(containerHeight / singleLineHeight)
}
