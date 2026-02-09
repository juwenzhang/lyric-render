import { useState, useCallback, useEffect } from 'react'
import { parseLyric, defaultLyricCache } from '@lyric-render/core'
import type {
  BaseLyricItem,
  LyricSource,
  ParseOptions,
} from '@lyric-render/core'

/**
 * 歌词状态
 * @enum {LyricState}
 * @property {'idle' | 'loading' | 'loaded' | 'error'}
 *   idle - 初始状态，未加载任何歌词数据
 *   loading - 加载中状态，正在加载歌词数据
 *   loaded - 加载完成状态，已成功加载歌词数据
 *   error - 加载错误状态，加载歌词数据时发生错误
 * @default 'idle'
 */
export type LyricState = 'idle' | 'loading' | 'loaded' | 'error'

/**
 * useLyric的返回值
 * @interface {UseLyricResult}
 * @property {BaseLyricItem[]} lyricList - 歌词项数组
 * @property {LyricState} lyricState - 歌词状态
 * @property {function} parseLyric - 解析歌词的函数
 * @property {function} setLyricState - 设置歌词状态的函数
 * @property {function} setBaseTime - 设置基础时间的函数
 */
export interface UseLyricResult {
  lyricList: BaseLyricItem[]
  lyricState: LyricState
  parseLyric: (
    source: LyricSource,
    options?: ParseOptions
  ) => void | Promise<void>
  setLyricState: (state: LyricState) => void
  setBaseTime: (baseTime: number) => void
}

/**
 * useLyric
 * @function
 * @param initialSource - 初始歌词源
 * @returns {UseLyricResult} - 歌词相关数据和函数
 * @description 用于解析歌词数据并管理歌词状态
 * @param initialSource - 初始歌词源
 * @returns {UseLyricResult} - 歌词相关数据和函数
 * @returns {UseLyricResult} - 歌词相关数据和函数
 */
export const useLyric = (initialSource?: LyricSource): UseLyricResult => {
  const [lyricList, setLyricList] = useState<BaseLyricItem[]>([])
  const [lyricState, setLyricState] = useState<LyricState>('idle')
  const [baseTime, setBaseTime] = useState<number>(0)

  /**
   * 如果 source 存在的话，则进行初始化解析
   */
  useEffect(() => {
    if (initialSource) {
      doParseLyric(initialSource)
    }
  }, [initialSource])

  /**
   * 解析歌词的具体逻辑
   */
  const doParseLyric = useCallback(
    (source: LyricSource, options: ParseOptions = {}) => {
      setLyricState('loading')
      try {
        // 生成缓存键
        const cacheKey =
          typeof source === 'string' ? source : JSON.stringify(source)
        // 检查缓存
        const cachedLyrics = defaultLyricCache.get(cacheKey)
        if (cachedLyrics) {
          setLyricList(cachedLyrics)
          setLyricState(cachedLyrics.length > 0 ? 'loaded' : 'error')
          return
        }
        // 解析歌词
        const lyrics = parseLyric(source, { ...options, baseTime })
        // 缓存结果
        defaultLyricCache.set(cacheKey, lyrics)
        setLyricList(lyrics)
        setLyricState(lyrics.length > 0 ? 'loaded' : 'error')
      } catch (error) {
        setLyricState('error')
      }
    },
    [baseTime]
  )

  const setBaseTimeCallback = useCallback((time: number) => {
    setBaseTime(time)
  }, [])

  return {
    lyricList,
    lyricState,
    parseLyric: doParseLyric,
    setLyricState,
    setBaseTime: setBaseTimeCallback,
  }
}
