const STORAGE_KEY = 'phrase-editor-state'
const MAX_STORAGE_SIZE = 5 * 1024 * 1024 // 5MB

export interface SavedState {
  rawText: string
  processedText: string
  history: string[]
  historyIndex: number
  timestamp: number
  version: string
}

const CURRENT_VERSION = '1.0.0'

/**
 * Перевіряє, чи доступний LocalStorage
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__phrase_editor_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Оцінює розмір даних
 */
function estimateSize(data: any): number {
  return new Blob([JSON.stringify(data)]).size
}

/**
 * Зберігає стан в LocalStorage
 */
export function saveState(state: Partial<SavedState>): boolean {
  if (!isLocalStorageAvailable()) return false

  try {
    const existing = loadState()
    const newState: SavedState = {
      rawText: state.rawText ?? existing?.rawText ?? '',
      processedText: state.processedText ?? existing?.processedText ?? '',
      history: state.history ?? existing?.history ?? [''],
      historyIndex: state.historyIndex ?? existing?.historyIndex ?? 0,
      timestamp: Date.now(),
      version: CURRENT_VERSION,
    }

    const size = estimateSize(newState)
    if (size > MAX_STORAGE_SIZE) {
      console.warn('State too large for LocalStorage:', size, 'bytes')

      const minimalState: SavedState = {
        rawText: newState.rawText.substring(0, 100000),
        processedText: '',
        history: [''],
        historyIndex: 0,
        timestamp: newState.timestamp,
        version: CURRENT_VERSION,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalState))
      return true
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    return true
  } catch (error) {
    console.error('Failed to save state:', error)
    return false
  }
}

/**
 * Завантажує стан з LocalStorage
 */
export function loadState(): SavedState | null {
  if (!isLocalStorageAvailable()) return null

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return null

    const state = JSON.parse(data) as SavedState

    if (state.version !== CURRENT_VERSION) {
      state.version = CURRENT_VERSION
    }

    return state
  } catch (error) {
    console.error('Failed to load state:', error)
    return null
  }
}

/**
 * Очищає збережений стан
 */
export function clearState(): void {
  if (!isLocalStorageAvailable()) return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear state:', error)
  }
}

/**
 * Отримує інформацію про збережений стан
 */
export function getStorageInfo(): {
  hasData: boolean
  timestamp: number | null
  size: number
} {
  if (!isLocalStorageAvailable()) {
    return { hasData: false, timestamp: null, size: 0 }
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return { hasData: false, timestamp: null, size: 0 }
    }

    const state = JSON.parse(data) as SavedState
    return {
      hasData: true,
      timestamp: state.timestamp,
      size: data.length,
    }
  } catch {
    return { hasData: false, timestamp: null, size: 0 }
  }
}
