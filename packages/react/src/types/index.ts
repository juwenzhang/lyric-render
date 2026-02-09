import type {
  BaseLyricItem,
  LyricSource,
  ParseOptions,
  MultiAudioSource,
} from '@lyric-render/core'
import { LyricTheme } from '../styles/types'

/**
 * 歌词播放器属性
 * @description 用于配置歌词播放器的属性
 * @param audioSrc 音频源（本地/在线，支持audio标签所有src类型）
 * @param lyricSource 歌词源（JSON/LRC）
 * @param parseOptions 解析配置
 * @param singleLineHeight 单行歌词高度（默认48px，和主题行高匹配）
 * @param align 高亮对齐方式（QQ音乐居中/抖音音乐顶部）
 * @param theme 自定义主题（覆盖默认/字节主题）
 * @param baseTime 歌词偏移时间（解决音频和歌词不同步，单位秒）
 * @param onLyricChange 歌词变化回调
 * @param onAudioPlay 音频播放状态回调
 * @param height 容器高度（默认50vh，支持数字/字符串）
 * @param showAudioControl 是否显示音频控制栏（默认true）
 */
export interface LyricPlayerProps {
  audioSrc: MultiAudioSource
  lyricSource: LyricSource
  parseOptions?: ParseOptions
  singleLineHeight?: number
  align?: 'center' | 'top'
  theme?: Partial<LyricTheme>
  baseTime?: number
  onLyricChange?: (index: number, item: BaseLyricItem | null) => void
  onAudioPlay?: (isPlaying: boolean) => void
  height?: number | string
  showAudioControl?: boolean
}
