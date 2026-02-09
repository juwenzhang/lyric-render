import React, { useState, useRef, useCallback, useEffect } from 'react'
import { matchLyric, calculateScrollTop, debounce } from '@lyric-render/core'
import type {
  BaseLyricItem,
  MatchLyricResult,
  ScrollOptions,
} from '@lyric-render/core'

/**
 * 歌词同步的选项
 * @param lyricList 歌词列表
 * @param singleLineHeight 单行高度
 * @param align 对齐方式
 * @param onLyricChange 歌词改变时的回调
 * @param currentSegmentStartTime 当前音频分段的开始时间
 */
export interface UseAudioSyncOptions {
  lyricList: BaseLyricItem[]
  singleLineHeight: number
  align: 'center' | 'top'
  onLyricChange?: (lyric: MatchLyricResult) => void
  currentSegmentStartTime?: number
}

/**
 * 歌词同步的结果
 * @param currentLyricIndex 当前歌词索引
 * @param currentTime 当前音频时间
 * @param audioRef 音频元素的引用
 * @param handleLyricClick 歌词点击事件
 * @param refreshSync 刷新同步
 */
export interface UseAudioSyncResult {
  currentLyricIndex: number
  currentTime: number
  audioRef: React.RefObject<HTMLAudioElement>
  containerRef: React.RefObject<HTMLDivElement>
  handleLyricClick: (index: number) => void
  refreshSync: () => void
}

export const useAudioSync = (
  options: UseAudioSyncOptions
): UseAudioSyncResult => {
  const {
    lyricList,
    singleLineHeight,
    align = 'center',
    onLyricChange,
    currentSegmentStartTime = 0,
  } = options
  const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const containerHeightRef = useRef<number>(0)
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * 初始化容器的高度
   */
  const updateContainerHeight = useCallback(() => {
    if (containerRef.current) {
      containerHeightRef.current = containerRef.current.clientHeight
    }
  }, [])

  /**
   * 同步歌词逻辑
   */
  const syncLyric = useCallback(() => {
    if (!audioRef.current || !lyricList.length) {
      return
    }
    // 确保容器高度已更新
    updateContainerHeight()
    // 获取音频的相对时间
    const relativeTime = audioRef.current.currentTime
    // 计算绝对时间：分段开始时间 + 音频相对时间
    const absoluteTime = currentSegmentStartTime + relativeTime
    // 更新当前时间状态，确保组件重新渲染
    setCurrentTime(absoluteTime)
    // 获取音频播放速度
    const playbackRate = audioRef.current.playbackRate || 1
    // 使用绝对时间匹配歌词
    const matchResult = matchLyric(absoluteTime, lyricList)
    if (matchResult.index !== currentLyricIndex) {
      setCurrentLyricIndex(matchResult.index)
      onLyricChange?.(matchResult)
    }
    // 无论歌词是否变化，都更新滚动位置，确保高亮歌词始终居中
    const scrollOptions: ScrollOptions = {
      align,
      singleLineHeight,
      containerHeight: containerHeightRef.current,
    }
    const newScrollTop = calculateScrollTop(matchResult.index, scrollOptions)
    if (
      containerRef.current &&
      containerRef.current.scrollTop !== newScrollTop
    ) {
      containerRef.current.scrollTop = newScrollTop
    }
  }, [
    lyricList,
    singleLineHeight,
    align,
    onLyricChange,
    updateContainerHeight,
    currentSegmentStartTime,
  ])

  const handleLyricClick = useCallback(
    (index: number) => {
      if (!audioRef.current || index < 0 || index >= lyricList.length) {
        return
      }
      // 获取歌词的绝对时间
      const lyricTime = lyricList[index].time
      // 计算音频分段内的相对时间
      const relativeTime = lyricTime - currentSegmentStartTime
      // 设置音频的当前时间为相对时间
      audioRef.current.currentTime = relativeTime
      syncLyric()
    },
    [syncLyric, lyricList, currentSegmentStartTime]
  )

  /**
   * 刷新同步
   * @description 当容器高度改变时，需要刷新同步
   */
  const refreshSync = useCallback(() => {
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current)
    }
    syncTimerRef.current = setInterval(syncLyric, 50) // 减少间隔到50ms，提高实时性
  }, [syncLyric])

  /**
   * 监听窗口resize事件，更新容器高度
   */
  useEffect(() => {
    updateContainerHeight()
    window.addEventListener('resize', updateContainerHeight)
    return () => {
      window.removeEventListener('resize', updateContainerHeight)
    }
  }, [updateContainerHeight])

  useEffect(() => {
    refreshSync()
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current)
        syncTimerRef.current = null
      }
    }
  }, [refreshSync, lyricList])

  return {
    currentLyricIndex,
    currentTime,
    audioRef,
    containerRef,
    handleLyricClick,
    refreshSync,
  }
}
