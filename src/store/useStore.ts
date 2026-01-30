import { create } from 'zustand'
import type {
  TextOperationType,
  OperationMetrics,
  TextMetrics,
} from '@types/operations'
import { analyzeText } from '@utils/textAnalysis'
import { applyTextOperation, measureOperation } from '@utils/textOperations'

export interface PhraseStore {
  rawText: string
  processedText: string
  isProcessing: boolean

  textMetrics: TextMetrics
  operationMetrics: OperationMetrics | null

  history: string[]
  historyIndex: number

  setRawText: (text: string) => void
  setProcessedText: (text: string) => void
  setIsProcessing: (isProcessing: boolean) => void
  clearAll: () => void
  copyToClipboard: () => Promise<void>
  applyOperation: (operation: TextOperationType) => void
  updateTextMetrics: () => void
  addToHistory: (text: string) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
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

  setRawText: (text) => {
    set({
      rawText: text,
      textMetrics: analyzeText(text),
    })
  },

  setProcessedText: (text) => set({ processedText: text }),

  setIsProcessing: (isProcessing) => set({ isProcessing }),

  clearAll: () =>
    set({
      rawText: '',
      processedText: '',
      isProcessing: false,
      textMetrics: initialTextMetrics,
      operationMetrics: null,
      history: [''],
      historyIndex: 0,
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

    set({ isProcessing: true })

    const { result, executionTime } = measureOperation(() =>
      applyTextOperation(textToProcess, operation),
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
  },

  addToHistory: (text) => {
    const { history, historyIndex } = get()
    const newHistory = [...history.slice(0, historyIndex + 1), text]
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

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
}))

export { useStore }
export default useStore
