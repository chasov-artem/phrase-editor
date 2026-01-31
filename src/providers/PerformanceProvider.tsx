import React, { createContext, useContext, useMemo, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useTextWorker } from '../hooks/useTextWorker'
import { needsVirtualization, measurePerformance } from '../utils/performance'
import { saveState, loadState, getStorageInfo } from '../utils/localStorage'
import { useStore } from '@store/useStore'

interface PerformanceContextType {
  worker: ReturnType<typeof useTextWorker>
  needsVirtualization: (itemCount: number) => boolean
  measurePerformance: (name: string, fn: () => void) => number
  saveState: (state: any) => boolean
  loadState: () => any
  storageInfo: ReturnType<typeof getStorageInfo>
}

const PerformanceContext = createContext<PerformanceContextType | null>(null)

interface PerformanceProviderProps {
  children: ReactNode
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const worker = useTextWorker()
  const storageInfo =
    typeof window === 'undefined'
      ? { hasData: false, timestamp: null, size: 0 }
      : getStorageInfo()

  useEffect(() => {
    if (typeof window === 'undefined') return
    useStore.getState().loadFromStorage()
  }, [])

  const value = useMemo(
    () => ({
      worker,
      needsVirtualization,
      measurePerformance,
      saveState,
      loadState,
      storageInfo,
    }),
    [worker, storageInfo],
  )

  return <PerformanceContext.Provider value={value}>{children}</PerformanceContext.Provider>
}

export const usePerformance = () => {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error('usePerformance must be used within PerformanceProvider')
  }
  return context
}
