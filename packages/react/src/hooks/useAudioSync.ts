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
 */
export interface UseAudioSyncOptions {
  lyricList: BaseLyricItem[]
  singleLineHeight: number
  align: 'center' | 'top'
  onLyricChange?: (lyric: MatchLyricResult) => void
}

/**
 * 歌词同步的结果
 * @param currentLyricIndex 当前歌词索引
 * @param audioRef 音频元素的引用
 * @param handleLyricClick 歌词点击事件
 * @param refreshSync 刷新同步
 */
export interface UseAudioSyncResult {
  currentLyricIndex: number
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
  } = options
  const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(0)
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
    const currentTime = audioRef.current.currentTime
    // 获取音频播放速度
    const playbackRate = audioRef.current.playbackRate || 1
    // 计算调整后的时间（倍速播放时使用实际时间）
    // 注意：matchLyric 函数使用的是音频的实际时间，不需要调整
    const matchResult = matchLyric(currentTime, lyricList)
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
  }, [lyricList, singleLineHeight, align, onLyricChange, updateContainerHeight])

  const handleLyricClick = useCallback(
    (index: number) => {
      if (!audioRef.current || index < 0 || index >= lyricList.length) {
        return
      }
      audioRef.current.currentTime = lyricList[index].time
      syncLyric()
    },
    [syncLyric, lyricList]
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
    audioRef,
    containerRef,
    handleLyricClick,
    refreshSync,
  }
}
