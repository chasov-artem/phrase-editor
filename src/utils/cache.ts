interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
  size: number
}

class LRUCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>()
  private maxSize: number
  private maxAge: number
  private currentSize = 0

  constructor(maxSize: number = 50 * 1024 * 1024, maxAge: number = 24 * 60 * 60 * 1000) {
    this.maxSize = maxSize
    this.maxAge = maxAge
  }

  set(key: K, value: V, size?: number): void {
    const entrySize = size ?? this.estimateSize(value)

    this.cleanup()

    if (entrySize > this.maxSize * 0.1) {
      console.warn('Cache entry too large, skipping')
      return
    }

    while (this.currentSize + entrySize > this.maxSize && this.cache.size > 0) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey === undefined) {
        break
      }
      this.delete(oldestKey)
    }

    const entry: CacheEntry<V> = {
      data: value,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.maxAge,
      size: entrySize,
    }

    if (this.cache.has(key)) {
      this.delete(key)
    }

    this.cache.set(key, entry)
    this.currentSize += entrySize
  }

  get(key: K): V | null {
    const entry = this.cache.get(key)

    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      return null
    }

    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.data
  }

  delete(key: K): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.currentSize -= entry.size
      return this.cache.delete(key)
    }

    return false
  }

  clear(): void {
    this.cache.clear()
    this.currentSize = 0
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  getStats(): {
    size: number
    entries: number
    maxSize: number
  } {
    return {
      size: this.currentSize,
      entries: this.cache.size,
      maxSize: this.maxSize,
    }
  }

  private estimateSize(value: any): number {
    try {
      return new Blob([JSON.stringify(value)]).size
    } catch {
      return 1024
    }
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.delete(key)
      }
    }
  }
}

class OperationCache {
  private cache = new LRUCache<string, unknown>()
  private stats = {
    hits: 0,
    misses: 0,
    saves: 0,
  }

  private generateKey(text: string, operation: string, options?: any): string {
    const hash = this.hashString(text + operation + JSON.stringify(options ?? {}))
    return `op_${hash}`
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  get(text: string, operation: string, options?: any): unknown | null {
    const key = this.generateKey(text, operation, options)
    const result = this.cache.get(key)

    if (result) {
      this.stats.hits++
      return result
    }

    this.stats.misses++
    return null
  }

  set(text: string, operation: string, result: unknown, options?: any): void {
    const key = this.generateKey(text, operation, options)
    this.cache.set(key, result)
    this.stats.saves++
  }

  clear(): void {
    this.cache.clear()
    this.stats.hits = 0
    this.stats.misses = 0
    this.stats.saves = 0
  }

  getStats() {
    const cacheStats = this.cache.getStats()
    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0

    return {
      ...cacheStats,
      hits: this.stats.hits,
      misses: this.stats.misses,
      saves: this.stats.saves,
      hitRate: Math.round(hitRate * 100) / 100,
    }
  }
}

export const operationCache = new OperationCache()
