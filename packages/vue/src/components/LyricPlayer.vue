<template>
  <div style="width: 100%; max-width: 800px; margin: 0 auto">
    <!-- 音频控制 -->
    <audio
      v-if="showAudioControl"
      ref="audioRef"
      :src="audioSrc"
      controls
      style="width: 100%; margin-bottom: 16px"
      preload="metadata"
      @play="handleAudioPlay(true)"
      @pause="handleAudioPlay(false)"
    />
    <!-- 歌词容器 -->
    <div
      ref="containerRef"
      :style="{
        height,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: theme.container.bg,
        border: theme.container.border,
        paddingLeft: theme.container.padding,
        paddingTop: theme.container.padding,
        paddingBottom: theme.container.padding,
      }"
      class="lyric-container"
    >
      <div v-if="lyricState === 'loaded'" class="lyric-list">
        <div
          v-for="(item, index) in lyricList"
          :key="`lyric-${index}`"
          class="lyric-item"
          :style="{
            height: singleLineHeight + 'px',
            lineHeight: singleLineHeight + 'px',
            color:
              index === currentLyricIndex
                ? theme.highlight.color
                : theme.normal.color,
            fontSize:
              index === currentLyricIndex
                ? theme.highlight.fontSize
                : theme.normal.fontSize,
          }"
          @click="handleLyricClick(index)"
        >
          {{ item.text }}
        </div>
      </div>
      <div
        v-else
        class="state-container"
        :style="{ color: theme.state.color, fontSize: theme.state.fontSize }"
      >
        {{
          lyricState === 'loading'
            ? '歌词加载中...'
            : lyricState === 'error'
              ? '歌词解析失败'
              : '暂无歌词'
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, computed } from 'vue'
import {
  BaseLyricItem,
  LyricSource,
  ParseOptions,
  parseLyric,
  matchLyric,
  calculateScrollTop,
  debounce,
} from '@lyric-render/core'

const props = defineProps<{
  audioSrc: string
  lyricSource: LyricSource
  parseOptions?: ParseOptions
  singleLineHeight?: number
  align?: 'center' | 'top'
  theme?: any
  baseTime?: number
  height?: number | string
  showAudioControl?: boolean
}>()

const emit = defineEmits<{
  (e: 'lyric-change', index: number, item: BaseLyricItem | null): void
  (e: 'audio-play', isPlaying: boolean): void
}>()

const lyricList = ref<BaseLyricItem[]>([])
const lyricState = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')
const currentLyricIndex = ref(-1)

const containerHeight = ref(0)
const singleLineHeight = ref(48)
const baseTime = ref(0)

const audioRef = ref<HTMLAudioElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)
const syncTimerRef = ref<NodeJS.Timeout | null>(null)

const defaultTheme = reactive({
  container: { bg: '#fff', border: '1px solid #e5e7eb', padding: '0 16px' },
  normal: { color: '#6b7280', fontSize: '16px' },
  highlight: { color: '#165DFF', fontSize: '18px' },
  state: { color: '#9ca3af', fontSize: '16px' },
})
const theme = computed(() => ({ ...defaultTheme, ...(props.theme || {}) }))

const parseLyricHandler = (source: LyricSource, options: ParseOptions = {}) => {
  lyricState.value = 'loading'
  try {
    const list = parseLyric(source, { ...options, baseTime: baseTime.value })
    lyricList.value = list
    lyricState.value = list.length > 0 ? 'loaded' : 'error'
  } catch (e) {
    lyricState.value = 'error'
  }
}

const syncLyric = () => {
  if (!audioRef.value || lyricList.value.length === 0) return
  const currentTime = audioRef.value.currentTime
  const matchResult = matchLyric(currentTime, lyricList.value)
  if (matchResult.index !== currentLyricIndex.value) {
    currentLyricIndex.value = matchResult.index
    emit('lyric-change', matchResult.index, matchResult.item)
    // 计算滚动距离
    const st = calculateScrollTop(matchResult.index, {
      containerHeight: containerHeight.value,
      singleLineHeight: singleLineHeight.value,
      align: props.align || 'center',
    })
    if (containerRef.value) {
      containerRef.value.scrollTop = st
    }
  }
}

const handleLyricClick = (index: number) => {
  if (!audioRef.value || index < 0 || index >= lyricList.value.length) return
  audioRef.value.currentTime = lyricList.value[index].time
  syncLyric()
}

const handleAudioPlay = (isPlaying: boolean) => {
  emit('audio-play', isPlaying)
}

const updateContainerHeight = debounce(() => {
  if (containerRef.value) {
    containerHeight.value = containerRef.value.clientHeight
  }
})

// 检测滚动条宽度并设置 CSS 变量
const updateScrollbarWidth = () => {
  // 创建一个临时元素来检测滚动条宽度
  const scrollDiv = document.createElement('div')
  scrollDiv.style.width = '100px'
  scrollDiv.style.height = '100px'
  scrollDiv.style.overflow = 'scroll'
  scrollDiv.style.position = 'absolute'
  scrollDiv.style.top = '-9999px'
  document.body.appendChild(scrollDiv)

  // 计算滚动条宽度
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)

  // 设置 CSS 变量
  document.documentElement.style.setProperty(
    '--scrollbar-width',
    scrollbarWidth + 'px'
  )
}

const refreshSync = () => {
  if (syncTimerRef.value) clearInterval(syncTimerRef.value)
  syncTimerRef.value = setInterval(syncLyric, 100)
}

onMounted(() => {
  singleLineHeight.value = props.singleLineHeight || 48
  baseTime.value = props.baseTime || 0
  parseLyricHandler(props.lyricSource, props.parseOptions)
  updateContainerHeight()
  updateScrollbarWidth()
  window.addEventListener('resize', updateContainerHeight)
  window.addEventListener('resize', updateScrollbarWidth)
  refreshSync()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerHeight)
  window.removeEventListener('resize', updateScrollbarWidth)
  if (syncTimerRef.value) clearInterval(syncTimerRef.value)
})

watch([() => props.lyricSource, () => props.baseTime], () => {
  baseTime.value = props.baseTime || 0
  parseLyricHandler(props.lyricSource, props.parseOptions)
})

watch([() => props.singleLineHeight, () => props.align], () => {
  singleLineHeight.value = props.singleLineHeight || 48
  refreshSync()
})
</script>

<style scoped>
.lyric-container {
  user-select: none;
  scroll-behavior: smooth;
}

.lyric-item {
  width: 100%;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.state-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* WebKit 浏览器滚动条样式 */
.lyric-container::-webkit-scrollbar {
  width: 6px;
}

.lyric-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.lyric-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.lyric-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Firefox 浏览器滚动条样式 */
.lyric-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
}

/* 防止滚动条出现时内容偏移 */
.lyric-container {
  padding-right: calc(var(--scrollbar-width, 0px) + 16px);
}
</style>
