import type { BaseLyricItem } from '../types'

/**
 * 歌词缓存选项
 */
export interface LyricCacheOptions {
  /**
   * 缓存键前缀
   */
  prefix?: string
  /**
   * 缓存过期时间（毫秒）
   */
  expiration?: number
}

/**
 * 缓存数据结构
 */
interface CacheData {
  data: BaseLyricItem[]
  timestamp: number
  expiration?: number
}

/**
 * 歌词缓存工具
 */
export class LyricCache {
  private prefix: string
  private expiration: number

  constructor(options: LyricCacheOptions = {}) {
    this.prefix = options.prefix || 'lyric_cache_'
    this.expiration = options.expiration || 7 * 24 * 60 * 60 * 1000 // 默认7天
  }

  /**
   * 生成缓存键
   * @param key 原始键
   * @returns 带前缀的缓存键
   */
  private generateKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * 检查缓存是否过期
   * @param data 缓存数据
   * @returns 是否已过期
   */
  private isExpired(data: CacheData): boolean {
    const now = Date.now()
    const expirationTime = data.expiration || this.expiration
    return now - data.timestamp > expirationTime
  }

  /**
   * 缓存歌词
   * @param key 缓存键
   * @param data 歌词数据
   */
  set(key: string, data: BaseLyricItem[]): void {
    try {
      const cacheKey = this.generateKey(key)
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        expiration: this.expiration,
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error caching lyric:', error)
    }
  }

  /**
   * 获取缓存的歌词
   * @param key 缓存键
   * @returns 缓存的歌词数据，或null如果不存在或已过期
   */
  get(key: string): BaseLyricItem[] | null {
    try {
      const cacheKey = this.generateKey(key)
      const cachedData = localStorage.getItem(cacheKey)
      if (!cachedData) {
        return null
      }
      const parsedData: CacheData = JSON.parse(cachedData)
      if (this.isExpired(parsedData)) {
        this.remove(key)
        return null
      }
      return parsedData.data
    } catch (error) {
      console.error('Error getting cached lyric:', error)
      return null
    }
  }

  /**
   * 移除缓存的歌词
   * @param key 缓存键
   */
  remove(key: string): void {
    try {
      const cacheKey = this.generateKey(key)
      localStorage.removeItem(cacheKey)
    } catch (error) {
      console.error('Error removing cached lyric:', error)
    }
  }

  /**
   * 清除所有缓存的歌词
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing cached lyrics:', error)
    }
  }

  /**
   * 检查是否存在缓存
   * @param key 缓存键
   * @returns 是否存在有效缓存
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }
}

/**
 * 默认的歌词缓存实例
 */
export const defaultLyricCache = new LyricCache()
