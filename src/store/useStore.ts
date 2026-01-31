import { create } from 'zustand'
import type {
  TextOperationType,
  OperationMetrics,
  TextMetrics,
} from '../types/operations'
import { analyzeText } from '@utils/textAnalysis'
import {
  applyOperationToText,
  measureOperationExecution,
} from '@utils/textOperationsExtended'
import { saveState, loadState } from '@utils/localStorage'
import { throttle } from '@utils/performance'

export interface PhraseStore {
  rawText: string
  processedText: string
  isProcessing: boolean

  textMetrics: TextMetrics
  operationMetrics: OperationMetrics | null

  history: string[]
  historyIndex: number
  lastOperationTimestamp: number
  useVirtualization: boolean
  autoSave: boolean
  lastSaveTime: number | null

  setRawText: (text: string) => void
  setProcessedText: (text: string) => void
  setIsProcessing: (isProcessing: boolean) => void
  setOperationMetrics: (metrics: OperationMetrics | null) => void
  setLastOperationTimestamp: (timestamp: number) => void
  setUseVirtualization: (use: boolean) => void
  setAutoSave: (autoSave: boolean) => void
  clearAll: () => void
  copyToClipboard: () => Promise<void>
  applyOperation: (operation: TextOperationType) => void
  updateTextMetrics: () => void
  addToHistory: (text: string) => void
  resetHistory: (text: string) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  saveToStorage: () => void
  loadFromStorage: () => void
}

const initialTextMetrics: TextMetrics = {
  totalLines: 0,
  nonEmptyLines: 0,
  emptyLines: 0,
  totalCharacters: 0,
  wordCount: 0,
}

const useStore = create<PhraseStore>((set, get) => ({
  rawText: '',
  processedText: '',
  isProcessing: false,
  textMetrics: initialTextMetrics,
  operationMetrics: null,
  history: [''],
  historyIndex: 0,
  lastOperationTimestamp: 0,
  useVirtualization: true,
  autoSave: true,
  lastSaveTime: null,

  setRawText: throttle((text: string) => {
    set({
      rawText: text,
      textMetrics: analyzeText(text),
    })
    if (get().autoSave) {
      get().saveToStorage()
    }
  }, 500),

  setProcessedText: throttle((text: string) => {
    set({
      processedText: text,
      lastOperationTimestamp: Date.now(),
    })
    if (get().autoSave) {
      get().saveToStorage()
    }
  }, 500),

  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setOperationMetrics: (metrics) => set({ operationMetrics: metrics }),
  setLastOperationTimestamp: (timestamp) =>
    set({ lastOperationTimestamp: timestamp }),

  clearAll: () =>
    set({
      rawText: '',
      processedText: '',
      isProcessing: false,
      textMetrics: initialTextMetrics,
      operationMetrics: null,
      history: [''],
      historyIndex: 0,
      lastOperationTimestamp: 0,
    }),

  copyToClipboard: async () => {
    const textToCopy = get().processedText || get().rawText
    if (!textToCopy) {
      return
    }

    try {
      await navigator.clipboard.writeText(textToCopy)
    } catch (err) {
      console.error('Помилка копіювання:', err)
    }
  },

  updateTextMetrics: () => {
    const { rawText } = get()
    set({ textMetrics: analyzeText(rawText) })
  },

  applyOperation: (operation) => {
    const { rawText, processedText } = get()
    const textToProcess = processedText || rawText

    if (!textToProcess.trim()) {
      return
    }

    set({ isProcessing: true })

    const { result, executionTime } = measureOperationExecution(() =>
      applyOperationToText(textToProcess, operation),
    )

    const linesProcessed = textToProcess.split(/\r?\n/).length
    const linesChanged = result.split(/\r?\n/).length

    set({
      processedText: result,
      isProcessing: false,
      operationMetrics: {
        operation,
        executionTime,
        linesProcessed,
        linesChanged,
      },
    })

    get().addToHistory(result)
    get().setLastOperationTimestamp(Date.now())
  },

  addToHistory: (text) => {
    const { history, historyIndex } = get()
    const newHistory = [...history.slice(0, historyIndex + 1), text]
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  resetHistory: (text) =>
    set({
      history: [text],
      historyIndex: 0,
      lastOperationTimestamp: 0,
    }),

  undo: () => {
    const { history, historyIndex } = get()
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      set({
        processedText: history[newIndex],
        historyIndex: newIndex,
      })
    }
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      set({
        processedText: history[newIndex],
        historyIndex: newIndex,
      })
    }
  },

  canUndo: () => get().historyIndex > 0,

  canRedo: () => {
    const { history, historyIndex } = get()
    return historyIndex < history.length - 1
  },
  setUseVirtualization: (useVirtualization) => set({ useVirtualization }),
  setAutoSave: (autoSave) => set({ autoSave }),
  saveToStorage: () => {
    const state = {
      rawText: get().rawText,
      processedText: get().processedText,
      history: get().history,
      historyIndex: get().historyIndex,
    }

    if (saveState(state)) {
      set({ lastSaveTime: Date.now() })
    }
  },
  loadFromStorage: () => {
    const saved = loadState()
    if (!saved) {
      return
    }

    const history = saved.history && saved.history.length > 0 ? saved.history : ['']
    const historyIndex = Math.max(
      0,
      Math.min(saved.historyIndex ?? 0, history.length - 1),
    )

    set({
      rawText: saved.rawText || '',
      processedText: saved.processedText || '',
      history,
      historyIndex,
      lastSaveTime: saved.timestamp || null,
    })
  },
}))

export { useStore }
export default useStore
