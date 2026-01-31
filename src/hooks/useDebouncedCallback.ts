import { useCallback, useEffect, useRef } from 'react'
import { operationCache } from '@utils/cache'

interface UseDebouncedCallbackOptions {
  delay: number
  cacheKey?: string
  cacheTimeout?: number
  immediate?: boolean
}

type Timeout = ReturnType<typeof setTimeout>

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  options: UseDebouncedCallbackOptions = { delay: 300 },
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) & { clearCache: () => void } {
  const {
    delay,
    cacheKey,
    cacheTimeout = 5 * 60 * 1000,
    immediate = false,
  } = options

  const timeoutRef = useRef<Timeout | null>(null)
  const lastCallRef = useRef(0)
  const cacheKeyRef = useRef<string | undefined>(cacheKey)

  useEffect(() => {
    cacheKeyRef.current = cacheKey
  }, [cacheKey])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      const cacheArgs = JSON.stringify(args)
      const shouldUseCache = cacheKeyRef.current && cacheTimeout > 0
      if (shouldUseCache && cacheKeyRef.current) {
        const fullCacheKey = `${cacheKeyRef.current}_${cacheArgs}`
        const cached = operationCache.get(cacheArgs, fullCacheKey)
        if (cached !== null) {
          return cached as ReturnType<T>
        }
      }

      const result = await callback(...args)

      if (shouldUseCache && cacheKeyRef.current) {
        const fullCacheKey = `${cacheKeyRef.current}_${cacheArgs}`
        operationCache.set(cacheArgs, fullCacheKey, result)
      }

      return result
    },
    [callback],
  )

  const debouncedCallback = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      if (immediate && Date.now() - lastCallRef.current > delay) {
        lastCallRef.current = Date.now()
        return execute(...args)
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      return new Promise((resolve) => {
        timeoutRef.current = setTimeout(async () => {
          lastCallRef.current = Date.now()
          const result = await execute(...args)
          resolve(result)
        }, delay)
      })
    },
    [delay, execute, immediate],
  )

  const clearCache = useCallback(() => {
    operationCache.clear()
  }, [])

  return Object.assign(debouncedCallback, { clearCache })
}
