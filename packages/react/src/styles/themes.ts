import type { LyricTheme } from './types'

export const defaultTheme: LyricTheme = {
  container: {
    bg: '#ffffff',
    border: '1px solid #e5e7eb',
    padding: '0 16px',
  },
  normal: {
    color: '#6b7280',
    fontSize: '16px',
    lineHeight: '48px',
    fontWeight: 400,
  },
  highlight: {
    color: '#165DFF',
    fontSize: '18px',
    lineHeight: '48px',
    fontWeight: 600,
  },
  wordHighlight: {
    color: '#165DFF',
  },
  state: {
    color: '#9ca3af',
    fontSize: '16px',
  },
  animation: {
    fadeIn: 'fadeIn 0.5s ease-in-out',
    scale: 'scale 0.3s ease-in-out',
    gradient: 'gradient 1s ease-in-out infinite',
  },
}

export const otherTheme: LyricTheme = {
  ...defaultTheme,
  highlight: {
    ...defaultTheme.highlight,
    color: '#FF2442',
    bg: 'rgba(255, 36, 66, 0.05)',
  },
  wordHighlight: {
    color: '#FF2442',
  },
  container: {
    ...defaultTheme.container,
    border: '1px solid #f0f0f0',
  },
}
