const DB_NAME = 'phrase-editor-db'
const DB_VERSION = 1
const STORE_NAME = 'text-storage'
const MAX_DB_SIZE = 100 * 1024 * 1024 // 100MB

interface StoredText {
  id: string
  text: string
  timestamp: number
  size: number
  name?: string
  metadata?: Record<string, any>
}

class IndexedDBService {
  private db: IDBDatabase | null = null
  private isInitialized = false

  async init(): Promise<boolean> {
    if (this.isInitialized && this.db) return true

    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB is not supported')
        resolve(false)
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        console.error('Failed to open IndexedDB')
        resolve(false)
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        this.isInitialized = true
        resolve(true)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('size', 'size', { unique: false })
          store.createIndex('name', 'name', { unique: false })
        }
      }
    })
  }

  async saveText(
    text: string,
    name?: string,
    metadata?: Record<string, any>,
  ): Promise<string> {
    const initialized = await this.init()
    if (!initialized || !this.db) throw new Error('IndexedDB not available')

    return new Promise((resolve, reject) => {
      const id = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const timestamp = Date.now()
      const size = new Blob([text]).size

      const storedText: StoredText = {
        id,
        text,
        timestamp,
        size,
        name,
        metadata,
      }

      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(storedText)

      request.onsuccess = () => {
        this.cleanupOldEntries().catch((error) => {
          console.warn('Cleanup failed after save:', error)
        })
        resolve(id)
      }

      request.onerror = () => {
        reject(new Error('Failed to save text to IndexedDB'))
      }
    })
  }

  async loadText(id: string): Promise<StoredText | null> {
    const initialized = await this.init()
    if (!initialized || !this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => {
        resolve((request.result as StoredText) || null)
      }

      request.onerror = () => {
        reject(new Error('Failed to load text from IndexedDB'))
      }
    })
  }

  async listTexts(options?: {
    limit?: number
    offset?: number
    sortBy?: 'timestamp' | 'size' | 'name'
    order?: 'asc' | 'desc'
  }): Promise<StoredText[]> {
    const initialized = await this.init()
    if (!initialized || !this.db) return []

    const {
      limit = 50,
      offset = 0,
      sortBy = 'timestamp',
      order = 'desc',
    } = options || {}

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index(sortBy)

      const request = index.openCursor(
        null,
        order === 'desc' ? 'prev' : 'next',
      )

      const results: StoredText[] = []
      let skipped = 0
      let processed = 0

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result

        if (cursor) {
          if (skipped < offset) {
            skipped++
            cursor.continue()
            return
          }

          if (processed < limit) {
            results.push(cursor.value as StoredText)
            processed++
            cursor.continue()
          } else {
            resolve(results)
          }
        } else {
          resolve(results)
        }
      }

      request.onerror = () => {
        reject(new Error('Failed to list texts from IndexedDB'))
      }
    })
  }

  async deleteText(id: string): Promise<boolean> {
    const initialized = await this.init()
    if (!initialized || !this.db) return false

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve(true)
      }

      request.onerror = () => {
        reject(new Error('Failed to delete text from IndexedDB'))
      }
    })
  }

  private async cleanupOldEntries(): Promise<void> {
    const initialized = await this.init()
    if (!initialized || !this.db) return

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const sizeIndex = store.index('size')

      const request = sizeIndex.openCursor()
      let totalSize = 0
      const entries: Array<{ id: string; size: number }> = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          totalSize += cursor.value.size
          entries.push({ id: cursor.value.id, size: cursor.value.size })
          cursor.continue()
        } else {
          if (totalSize > MAX_DB_SIZE) {
            entries.sort((a, b) => b.size - a.size)
            let sizeToRemove = 0

            for (const entry of entries) {
              if (sizeToRemove > MAX_DB_SIZE * 0.5) break
              store.delete(entry.id)
              sizeToRemove += entry.size
            }
          }
          resolve()
        }
      }

      request.onerror = () => {
        console.warn('Failed to cleanup IndexedDB entries')
        resolve()
      }
    })
  }

  async getStats(): Promise<{
    totalEntries: number
    totalSize: number
    maxSize: number
  }> {
    const initialized = await this.init()
    if (!initialized || !this.db) {
      return {
        totalEntries: 0,
        totalSize: 0,
        maxSize: MAX_DB_SIZE,
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.openCursor()

      let totalEntries = 0
      let totalSize = 0

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          totalEntries++
          totalSize += cursor.value.size
          cursor.continue()
        } else {
          resolve({
            totalEntries,
            totalSize,
            maxSize: MAX_DB_SIZE,
          })
        }
      }

      request.onerror = () => {
        reject(new Error('Failed to get stats from IndexedDB'))
      }
    })
  }
}

export const indexedDBService = new IndexedDBService()
