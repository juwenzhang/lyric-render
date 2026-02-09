import React, { useEffect, useMemo, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { defaultTheme, otherTheme } from '../../styles/themes'
import {
  LyricContainer,
  LyricItemWrapper,
  NormalLyricText,
  HighlightLyricText,
  WordLyricWrapper,
  WordText,
  StateContainer,
} from '../../styles/global'
import { useLyric } from '../../hooks/useLyric'
import { useAudioSync } from '../../hooks/useAudioSync'
import { LyricPlayerProps } from '../../types'
import { BaseLyricItem, AudioSegment } from '@lyric-render/core'

const IS_OTHER_THEME =
  (import.meta as any).env.REACT_APP_USE_OTHER_THEME === 'true'

const LyricPlayer: React.FC<LyricPlayerProps> = ({
  audioSrc,
  lyricSource,
  parseOptions,
  singleLineHeight,
  align,
  theme,
  baseTime,
  onLyricChange,
  onAudioPlay,
  height,
  showAudioControl,
}) => {
  const mergeTheme = useMemo(() => {
    const baseTheme = IS_OTHER_THEME ? otherTheme : defaultTheme
    return {
      ...baseTheme,
      ...theme,
    }
  }, [theme])

  const [currentSegment, setCurrentSegment] = useState<AudioSegment | null>(
    null
  )
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0)

  const { lyricList, lyricState, parseLyric, setBaseTime } = useLyric()

  const {
    currentLyricIndex,
    currentTime,
    audioRef,
    containerRef,
    handleLyricClick,
  } = useAudioSync({
    lyricList,
    singleLineHeight: singleLineHeight || 50,
    align: align || 'center',
    onLyricChange: (res) => onLyricChange?.(res.index, res.item),
    currentSegmentStartTime: currentSegment?.startTime || 0,
  })

  // 处理多段音频
  const audioSegments = useMemo(() => {
    if (typeof audioSrc === 'string') {
      return [{ src: audioSrc, startTime: 0, endTime: Infinity }]
    }
    return audioSrc
  }, [audioSrc])

  // 检查并切换音频分段
  const checkAndSwitchSegment = useMemo(() => {
    return (currentTime: number) => {
      const segment = audioSegments.find((seg: AudioSegment, index: number) => {
        return currentTime >= seg.startTime && currentTime <= seg.endTime
      })
      if (segment && segment !== currentSegment) {
        setCurrentSegment(segment)
        const index = audioSegments.indexOf(segment)
        setCurrentSegmentIndex(index)
        if (audioRef.current) {
          audioRef.current.src = segment.src
          // 设置音频的当前时间为分段内的相对时间
          audioRef.current.currentTime = currentTime - segment.startTime
          audioRef.current.play()
        }
      }
    }
  }, [audioSegments, currentSegment, audioRef])

  useEffect(() => {
    setBaseTime(baseTime || 0)
    parseLyric(lyricSource, parseOptions)
  }, [lyricSource, parseOptions, baseTime, parseLyric, setBaseTime])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }
    const handlePlay = () => onAudioPlay?.(true)
    const handlePause = () => onAudioPlay?.(false)
    const handleTimeUpdate = () => {
      // 获取当前音频分段的绝对开始时间
      const currentSegmentStartTime = currentSegment?.startTime || 0
      // 计算绝对时间：分段开始时间 + 音频相对时间
      const absoluteTime = currentSegmentStartTime + audio.currentTime
      // 使用绝对时间检查并切换分段
      checkAndSwitchSegment(absoluteTime)
    }
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [onAudioPlay, checkAndSwitchSegment, currentSegment])

  // 初始化音频分段
  useEffect(() => {
    if (audioSegments.length > 0 && !currentSegment) {
      setCurrentSegment(audioSegments[0])
      setCurrentSegmentIndex(0)
    }
  }, [audioSegments, currentSegment])

  const renderLyricItem = (item: BaseLyricItem, index: number) => {
    const isHighlight = index === currentLyricIndex
    const renderMainText = () => {
      if (item.words && isHighlight) {
        return (
          <WordLyricWrapper>
            {item.words.map(
              (
                word: { time: number; text: string; duration?: number },
                i: number
              ) => {
                const isWordHighlight = currentTime >= word.time
                return (
                  <WordText
                    key={i + word.text}
                    $isHighlight={isWordHighlight}
                    $animate
                  >
                    {word.text}
                  </WordText>
                )
              }
            )}
          </WordLyricWrapper>
        )
      }
      return isHighlight ? (
        <HighlightLyricText $animate>{item.text}</HighlightLyricText>
      ) : (
        <NormalLyricText>{item.text}</NormalLyricText>
      )
    }

    const renderTranslate = () => {
      if (!item.translate) return null
      return (
        <NormalLyricText
          style={{
            fontSize: '0.8em',
            opacity: 0.7,
            marginTop: '4px',
            display: 'block',
          }}
        >
          {item.translate}
        </NormalLyricText>
      )
    }

    return (
      <LyricItemWrapper
        key={`lyric-${index}`}
        onClick={() => handleLyricClick(index)}
        data-highlight={isHighlight}
      >
        <div>
          {renderMainText()}
          {renderTranslate()}
        </div>
      </LyricItemWrapper>
    )
  }

  const renderState = () => {
    switch (lyricState) {
      case 'loading':
        return <StateContainer>歌词加载中...</StateContainer>
      case 'error':
        return <StateContainer>歌词解析失败</StateContainer>
      case 'idle':
        return <StateContainer>暂无歌词</StateContainer>
      default:
        return null
    }
  }

  return (
    <ThemeProvider theme={mergeTheme}>
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {showAudioControl && (
          <audio
            ref={audioRef}
            src={currentSegment?.src || audioSegments[0]?.src}
            controls
            style={{
              width: '100%',
              marginBottom: '16px',
            }}
            preload="metadata"
          />
        )}
        <LyricContainer
          ref={containerRef}
          style={{ height }}
          data-lyric-state={lyricState}
        >
          {lyricState === 'loaded'
            ? lyricList.map((item, index) => renderLyricItem(item, index))
            : renderState()}
        </LyricContainer>
      </div>
    </ThemeProvider>
  )
}

export default React.memo(LyricPlayer)
