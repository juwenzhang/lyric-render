import { LyricPlayer, otherTheme } from '@lyric-render/react'
import lyricLrc from './lyric.lrc?raw'
import musicMp3 from './music.mp3'

const App = () => {
  const customTheme = {
    ...otherTheme,
    highlight: {
      color: '#FFD700',
      fontWeight: 700,
      lineHeight: '50px',
      fontSize: '16px',
    },
  }

  // 歌词变化回调
  const handleLyricChange = (index: number, item: any) => {
    console.log('当前歌词索引:', index, '歌词内容:', item?.text)
  }

  return (
    <div style={{ padding: '20px' }}>
      <LyricPlayer
        audioSrc={musicMp3}
        lyricSource={lyricLrc}
        parseOptions={{ isWordSplit: true }}
        align="center"
        theme={customTheme}
        baseTime={0.5}
        height="60vh"
        showAudioControl={true}
        onLyricChange={handleLyricChange}
        onAudioPlay={(isPlaying: boolean) =>
          console.log('音频播放状态:', isPlaying)
        }
      />
    </div>
  )
}

export default App
