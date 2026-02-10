<template>
  <div style="padding: 20px">
    <LyricPlayer
      :audioSrc="musicMp3"
      :lyricSource="lyricLrc"
      :parseOptions="{ isWordSplit: true }"
      :align="'center'"
      :theme="customTheme"
      :baseTime="0.5"
      :height="'60vh'"
      :showAudioControl="true"
      @lyric-change="handleLyricChange"
      @audio-play="handleAudioPlay"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { LyricPlayer } from '@lyric-render/vue'
import lyricLrc from './lyric.lrc?raw'
import musicMp3 from './music.mp3'

// 自定义主题
const customTheme = reactive({
  container: { bg: '#1a1a1a', border: '1px solid #333', padding: '0 16px' },
  normal: { color: '#999', fontSize: '14px' },
  highlight: { color: '#FFD700', fontSize: '16px' },
  state: { color: '#666', fontSize: '14px' },
})

// 歌词变化回调
const handleLyricChange = (index: number, item: any) => {
  console.log('当前歌词索引:', index, '歌词内容:', item?.text)
}

// 音频播放状态回调
const handleAudioPlay = (isPlaying: boolean) => {
  console.log('音频播放状态:', isPlaying)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}
</style>
