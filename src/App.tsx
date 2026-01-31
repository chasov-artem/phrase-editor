import Header from './components/Layout/Header'
import TextEditor from './features/TextEditor/TextEditor'
import Metrics from './features/Metrics/Metrics'
import OperationsPanel from './features/Operations/OperationsPanel'
import { useStore } from '@store/useStore'
import { PerformanceProvider } from './providers/PerformanceProvider'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { PerformanceTester } from '@components/PerformanceTester'
import { SettingsPanel } from '@components/SettingsPanel'

export default function App() {
  const {
    history,
    historyIndex,
    undo,
    redo,
    canUndo,
    canRedo,
    isProcessing,
  } = useStore()

  const undoSteps = historyIndex
  const redoSteps = history.length - historyIndex - 1

  return (
    <ErrorBoundary>
      <PerformanceProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Header />

          <main className="container mx-auto px-4 py-8 max-w-7xl space-y-10">
            <section className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Phrase List Editor
              </h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Process up to 10,000 rows with full Unicode and Latin support
              </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <TextEditor />
                <OperationsPanel />
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceTester />

                <div className="space-y-8">
                  <Metrics />

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Action History</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Undo steps:</span>
                        <span className="font-mono">{undoSteps}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Redo steps:</span>
                        <span className="font-mono">{redoSteps}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={undo}
                          disabled={!canUndo() || isProcessing}
                          className={`
                            px-4 py-2 rounded-lg font-medium transition-colors
                            ${!canUndo() || isProcessing
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                          `}
                        >
                          ← Undo
                        </button>
                        <button
                          onClick={redo}
                          disabled={!canRedo() || isProcessing}
                          className={`
                            px-4 py-2 rounded-lg font-medium transition-colors
                            ${!canRedo() || isProcessing
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                          `}
                        >
                          Redo →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">About</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Web tool for editing phrase lists with multilingual support
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Features</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Up to 10,000 lines • Unicode • Text transformations • Undo/Redo
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Tech stack</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    React • TypeScript • Tailwind CSS • Zustand
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>© 2026 Phrase Editor • Multilingual ready</p>
              </div>
            </div>
          </footer>

          <SettingsPanel />
        </div>
      </PerformanceProvider>
    </ErrorBoundary>
  )
}
