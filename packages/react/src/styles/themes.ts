import type { LyricTheme } from './types'

export const defaultTheme: LyricTheme = {
  container: {
    bg: '#ffffff',
    border: 'none',
    padding: '0 20px',
  },
  normal: {
    color: '#666666',
    fontSize: '16px',
    lineHeight: '52px',
    fontWeight: 400,
  },
  highlight: {
    color: '#165DFF',
    fontSize: '18px',
    lineHeight: '52px',
    fontWeight: 600,
  },
  wordHighlight: {
    color: '#165DFF',
  },
  state: {
    color: '#999999',
    fontSize: '16px',
  },
  animation: {
    fadeIn: 'fadeIn 0.5s ease-in-out',
    scale: 'scale 0.3s ease-in-out',
    gradient: 'gradient 1s ease-in-out infinite',
  },
}

export const otherTheme: LyricTheme = {
  container: {
    bg: '#ffffff',
    border: 'none',
    padding: '0 20px',
  },
  normal: {
    color: '#666666',
    fontSize: '16px',
    lineHeight: '50px',
    fontWeight: 400,
  },
  highlight: {
    color: '#FF2442',
    fontSize: '18px',
    lineHeight: '50px',
    fontWeight: 600,
    bg: 'rgba(255, 36, 66, 0.08)',
  },
  wordHighlight: {
    color: '#FF2442',
  },
  state: {
    color: '#999999',
    fontSize: '16px',
  },
  animation: {
    fadeIn: 'fadeIn 0.5s ease-in-out',
    scale: 'scale 0.3s ease-in-out',
    gradient: 'gradient 1s ease-in-out infinite',
  },
}
