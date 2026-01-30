import { create } from 'zustand'

export interface PhraseStore {
  phrases: string[]
  processedPhrases: string[]
  currentOperation: string | null
  history: string[][]
  historyIndex: number

  setPhrases: (phrases: string[]) => void
  setProcessedPhrases: (processed: string[]) => void
  addOperation: (operation: string) => void
  resetHistory: () => void
}

const useStore = create<PhraseStore>((set) => ({
  phrases: [],
  processedPhrases: [],
  currentOperation: null,
  history: [[]],
  historyIndex: 0,

  setPhrases: (phrases) => set({ phrases }),
  setProcessedPhrases: (processed) => set({ processedPhrases: processed }),
  addOperation: (operation) =>
    set((state) => ({
      currentOperation: operation,
      history: [...state.history.slice(0, state.historyIndex + 1), [operation]],
      historyIndex: state.historyIndex + 1,
    })),
  resetHistory: () =>
    set({
      history: [[]],
      historyIndex: 0,
      currentOperation: null,
    }),
}))

export default useStore
