import { DefaultTheme } from 'styled-components'

export interface LyricTheme {
  /**
   * 容器样式体系
   * @description 容器样式体系是所有组件的基础样式体系，包含了组件的基本样式
   * @interface ContainerStyle
   * @property {string} bg - 蹌景颜色
   * @property {string} border - 边框样式
   * @property {string} padding - 内边距
   */
  container: {
    bg: string
    border: string
    padding: string
    [key: string | symbol]: unknown
  }
  /**
   * 普通样式体系
   * @description 普通样式体系是所有组件的普通样式体系，包含了组件的普通样式
   * @interface NormalStyle
   * @property {string} color - 文字颜色
   * @property {string} fontSize - 字体大小
   * @property {string} lineHeight - 行高
   * @property {string} fontWeight - 字体粗细
   */
  normal: {
    color: string
    fontSize: string
    lineHeight: string
    fontWeight: number
  }
  /**
   * 高亮样式体系
   * @description 高亮样式体系是所有组件的高亮样式体系，包含了组件的高亮样式
   * @interface HighlightStyle
   * @property {string} color - 文字颜色
   * @property {string} fontSize - 字体大小
   * @property {string} lineHeight - 行高
   * @property {string} fontWeight - 字体粗细
   * @property {string} bg - 背景颜色（可选）
   */
  highlight: {
    color: string
    fontSize: string
    lineHeight: string
    fontWeight: number
    bg?: string
  }
  /**
   * 单词高亮样式体系
   * @description 单词高亮样式体系是所有组件的单词高亮样式体系，包含了组件的单词高亮样式
   * @interface WordHighlightStyle
   * @property {string} color - 文字颜色
   */
  wordHighlight: {
    color: string
  }
  /**
   * 状态样式体系
   * @description 状态样式体系是所有组件的状态样式体系，包含了组件的状态样式
   * @interface StateStyle
   * @property {string} color - 文字颜色
   * @property {string} fontSize - 字体大小
   */
  state: {
    color: string
    fontSize: string
  }
  /**
   * 动画样式体系
   * @description 动画样式体系是所有组件的动画样式体系，包含了组件的动画样式
   * @interface AnimationStyle
   * @property {string} fadeIn - 淡入动画
   * @property {string} scale - 缩放动画
   * @property {string} gradient - 渐变动画
   */
  animation: {
    fadeIn: string
    scale: string
    gradient: string
  }
}

declare module 'styled-components' {
  export interface DefaultTheme extends LyricTheme {}
}
