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
  /**
   * IndexedDB数据库名称
   */
  dbName?: string
  /**
   * IndexedDB存储对象名称
   */
  storeName?: string
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
  private dbName: string
  private storeName: string
  private db: IDBDatabase | null = null
  private dbReady: Promise<void> | null = null

  constructor(options: LyricCacheOptions = {}) {
    this.prefix = options.prefix || 'lyric_cache_'
    this.expiration = options.expiration || 7 * 24 * 60 * 60 * 1000 // 默认7天
    this.dbName = options.dbName || 'lyric_cache_db'
    this.storeName = options.storeName || 'lyrics'
    this.initDB()
  }

  /**
   * 初始化IndexedDB
   */
  private initDB(): void {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB is not supported in this environment')
      return
    }

    this.dbReady = new Promise<void>((resolve) => {
      const request = window.indexedDB.open(this.dbName, 1)

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error)
        resolve() // 即使失败也继续，回退到localStorage
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  /**
   * 确保DB已初始化
   */
  private ensureDBInitialized(): void {
    if (!this.dbReady) {
      this.initDB()
    }
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
   * 检查localStorage是否有足够空间
   * @param data 要存储的数据
   * @returns 是否有足够空间
   */
  private hasLocalStorageSpace(data: string): boolean {
    if (typeof window === 'undefined' || !('localStorage' in window)) {
      return false
    }

    try {
      const testKey = `${this.prefix}test`
      window.localStorage.setItem(testKey, data)
      window.localStorage.removeItem(testKey)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 使用IndexedDB存储数据
   * @param key 缓存键
   * @param data 缓存数据
   */
  private async setToIndexedDB(key: string, data: CacheData): Promise<boolean> {
    this.ensureDBInitialized()
    if (!this.dbReady) return false

    await this.dbReady
    if (!this.db) return false

    const db = this.db
    return new Promise<boolean>((resolve) => {
      const transaction = db.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put({ key, ...data })

      request.onsuccess = () => resolve(true)
      request.onerror = () => {
        console.error('Error storing data in IndexedDB:', request.error)
        resolve(false)
      }
    })
  }

  /**
   * 从IndexedDB获取数据
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  private async getFromIndexedDB(key: string): Promise<BaseLyricItem[] | null> {
    this.ensureDBInitialized()
    if (!this.dbReady) return null

    await this.dbReady
    if (!this.db) return null

    const db = this.db
    return new Promise<BaseLyricItem[] | null>((resolve) => {
      const transaction = db.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        const data = request.result
        if (!data) {
          resolve(null)
          return
        }

        if (this.isExpired(data)) {
          this.removeFromIndexedDB(key)
          resolve(null)
          return
        }

        resolve(data.data)
      }

      request.onerror = () => {
        console.error('Error getting data from IndexedDB:', request.error)
        resolve(null)
      }
    })
  }

  /**
   * 从IndexedDB移除数据
   * @param key 缓存键
   */
  private async removeFromIndexedDB(key: string): Promise<void> {
    this.ensureDBInitialized()
    if (!this.dbReady) return

    await this.dbReady
    if (!this.db) return

    const db = this.db
    const transaction = db.transaction(this.storeName, 'readwrite')
    const store = transaction.objectStore(this.storeName)
    store.delete(key)
  }

  /**
   * 清除IndexedDB中的所有数据
   */
  private async clearIndexedDB(): Promise<void> {
    this.ensureDBInitialized()
    if (!this.dbReady) return

    await this.dbReady
    if (!this.db) return

    const db = this.db
    const transaction = db.transaction(this.storeName, 'readwrite')
    const store = transaction.objectStore(this.storeName)
    store.clear()
  }

  /**
   * 缓存歌词
   * @param key 缓存键
   * @param data 歌词数据
   */
  async set(key: string, data: BaseLyricItem[]): Promise<void> {
    try {
      const cacheKey = this.generateKey(key)
      const cacheData: CacheData = {
        data,
        timestamp: Date.now(),
        expiration: this.expiration,
      }

      const jsonData = JSON.stringify(cacheData)

      // 尝试使用localStorage
      if (this.hasLocalStorageSpace(jsonData)) {
        window.localStorage.setItem(cacheKey, jsonData)
        return
      }

      // localStorage空间不足，尝试使用IndexedDB
      const storedInIndexedDB = await this.setToIndexedDB(cacheKey, cacheData)
      if (storedInIndexedDB) {
        return
      }

      console.warn('Failed to cache lyric in both localStorage and IndexedDB')
    } catch (error) {
      console.error('Error caching lyric:', error)
    }
  }

  /**
   * 获取缓存的歌词
   * @param key 缓存键
   * @returns 缓存的歌词数据，或null如果不存在或已过期
   */
  async get(key: string): Promise<BaseLyricItem[] | null> {
    try {
      const cacheKey = this.generateKey(key)

      // 尝试从localStorage获取
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const cachedData = window.localStorage.getItem(cacheKey)
        if (cachedData) {
          const parsedData: CacheData = JSON.parse(cachedData)
          if (!this.isExpired(parsedData)) {
            return parsedData.data
          }
          this.remove(key)
        }
      }

      // 从localStorage获取失败，尝试从IndexedDB获取
      const indexedDBData = await this.getFromIndexedDB(cacheKey)
      if (indexedDBData) {
        return indexedDBData
      }

      return null
    } catch (error) {
      console.error('Error getting cached lyric:', error)
      return null
    }
  }

  /**
   * 移除缓存的歌词
   * @param key 缓存键
   */
  async remove(key: string): Promise<void> {
    try {
      const cacheKey = this.generateKey(key)
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.removeItem(cacheKey)
      }
      await this.removeFromIndexedDB(cacheKey)
    } catch (error) {
      console.error('Error removing cached lyric:', error)
    }
  }

  /**
   * 清除所有缓存的歌词
   */
  async clear(): Promise<void> {
    try {
      // 清除localStorage中的缓存
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        const keys = Object.keys(window.localStorage)
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            window.localStorage.removeItem(key)
          }
        })
      }

      // 清除IndexedDB中的缓存
      await this.clearIndexedDB()
    } catch (error) {
      console.error('Error clearing cached lyrics:', error)
    }
  }

  /**
   * 检查是否存在缓存
   * @param key 缓存键
   * @returns 是否存在有效缓存
   */
  async has(key: string): Promise<boolean> {
    const data = await this.get(key)
    return data !== null
  }
}

/**
 * 默认的歌词缓存实例
 */
export const defaultLyricCache = new LyricCache()
