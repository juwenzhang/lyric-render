import styled, { keyframes, css } from 'styled-components'
import type { LyricTheme } from './types'
import type { ReactNode } from 'react'
import { space, layout, flexbox } from 'styled-system'

// 淡入动画
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

// 缩放动画
const scale = keyframes`
  from {
    transform: scale(0.9);
  }
  to {
    transform: scale(1);
  }
`

// 渐变动画
const gradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

/**
 * 歌词容器的styled的全局样式
 */
export const LyricContainer = styled.div<{
  theme: LyricTheme
  children?: ReactNode
}>`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
  ${space}
  ${layout}
  ${flexbox}
  background: ${(props) => props.theme.container.bg};
  border: ${(props) => props.theme.container.border};
  padding: ${(props) => props.theme.container.padding};

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 2px;
  }
`

/**
 * 歌词项的styled的全局样式
 */
export const LyricItemWrapper = styled.div<{
  theme: LyricTheme
  children?: ReactNode
}>`
  width: 100%;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  height: ${(props) => props.theme.normal.lineHeight};
  line-height: ${(props) => props.theme.normal.lineHeight};
`

/**
 * 普通正常歌词的styled的全局样式
 */
export const NormalLyricText = styled.span<{
  theme: LyricTheme
  children?: ReactNode
}>`
  color: ${(props) => props.theme.normal.color};
  font-size: ${(props) => props.theme.normal.fontSize};
  font-weight: ${(props) => props.theme.normal.fontWeight};
  transition: all 0.2s ease;
`

/**
 * 高亮歌词的styled的全局样式
 */
export const HighlightLyricText = styled.span<{
  theme: LyricTheme
  children?: ReactNode
  $animate?: boolean
}>`
  color: ${(props) => props.theme.highlight.color};
  font-size: ${(props) => props.theme.highlight.fontSize};
  font-weight: ${(props) => props.theme.highlight.fontWeight};
  background: ${(props) => props.theme.highlight.bg || 'transparent'};
  transition: all 0.2s ease;
  ${(props) =>
    props.$animate &&
    css`
      animation:
        ${fadeIn} 0.5s ease-in-out,
        ${scale} 0.5s ease-in-out;
      background-size: 200% 200%;
    `}
`

/**
 * 单词高亮的styled的全局样式
 */
export const WordLyricWrapper = styled.span<{
  theme: LyricTheme
  children?: ReactNode
}>`
  display: inline-flex;
`

/**
 * 单词的styled的全局样式
 */
export const WordText = styled.span<{
  theme: LyricTheme
  $isHighlight: boolean
  $animate?: boolean
}>`
  color: ${(props) =>
    props.$isHighlight
      ? props.theme.wordHighlight.color
      : props.theme.normal.color};
  transition: all 0.1s ease;
  ${(props) =>
    props.$animate &&
    props.$isHighlight &&
    css`
      animation:
        ${fadeIn} 0.3s ease-in-out,
        ${scale} 0.3s ease-in-out;
    `}
`

/**
 * 状态容器的styled的全局样式
 */
export const StateContainer = styled.div<{
  theme: LyricTheme
  children?: ReactNode
}>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.state.color};
  font-size: ${(props) => props.theme.state.fontSize};
`
