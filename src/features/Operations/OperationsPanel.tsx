import React from 'react'
import type { ChangeEvent } from 'react'
import { useStore } from '@store/useStore'
import { operationsConfig } from '@utils/operationsConfig'
import type { OperationConfig } from '../../types/operations'
import { OperationGroup } from './components/OperationGroup'
import { SearchReplace } from './components/SearchReplace'
import { Zap, Download, Upload } from 'lucide-react'
import { usePerformance } from '../../providers/PerformanceProvider'

export const OperationsPanel: React.FC = () => {
  const {
    rawText,
    processedText,
    isProcessing,
    setProcessedText,
    setOperationMetrics,
    setIsProcessing,
    addToHistory,
    resetHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    setRawText,
    setLastOperationTimestamp,
  } = useStore()
  const { worker } = usePerformance()

  const groupedOperations = operationsConfig.reduce(
    (acc, operation) => {
      if (!acc[operation.group]) {
        acc[operation.group] = []
      }
      acc[operation.group].push(operation)
      return acc
    },
    {} as Record<string, OperationConfig[]>,
  )

  const logProgress = (progress: number, processed: number) => {
    console.log(`Progress: ${progress}%, rows processed: ${processed}`)
  }

  const executeOperation = async (operationId: OperationConfig['id']) => {
    if (isProcessing || worker.isBusy) return

    const textToProcess = processedText || rawText
    if (!textToProcess.trim()) return

    setIsProcessing(true)
    try {
      const startTime = performance.now()
      let result = ''

      switch (operationId) {
        case 'sort_asc':
          result = await worker.execute<string>(
            'SORT',
            { text: textToProcess, ascending: true, locale: 'en-US' },
            logProgress,
          )
          break
        case 'sort_desc':
          result = await worker.execute<string>(
            'SORT',
            { text: textToProcess, ascending: false, locale: 'en-US' },
            logProgress,
          )
          break
        case 'sort_asc_cyrillic':
          result = await worker.execute<string>(
            'SORT',
            { text: textToProcess, ascending: true, locale: 'uk-UA' },
            logProgress,
          )
          break
        case 'sort_desc_cyrillic':
          result = await worker.execute<string>(
            'SORT',
            { text: textToProcess, ascending: false, locale: 'uk-UA' },
            logProgress,
          )
          break
        case 'remove_duplicates':
          result = await worker.execute<string>(
            'REMOVE_DUPLICATES',
            { text: textToProcess },
            logProgress,
          )
          break
        default:
          result = await worker.execute<string>(
            'APPLY_OPERATION',
            { text: textToProcess, operation: operationId },
            logProgress,
          )
          break
      }

      const executionTime = performance.now() - startTime
      const linesProcessed = textToProcess.split(/\r?\n/).length
      const linesChanged = result.split(/\r?\n/).length

      setProcessedText(result)
      setOperationMetrics({
        operation: operationId,
        executionTime,
        linesProcessed,
        linesChanged,
      })
      addToHistory(result)
      setLastOperationTimestamp(Date.now())
    } catch (error) {
      console.error('Operation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOperationClick = (operationId: OperationConfig['id']) => {
    executeOperation(operationId)
  }

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = (e.target?.result as string) || ''
      setRawText(content)
      setProcessedText('')
      setOperationMetrics(null)
      resetHistory(content)
    }
    reader.readAsText(file)
  }

  const handleExport = () => {
    const textToExport = processedText || rawText
    if (!textToExport) return

    const blob = new Blob([textToExport], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'phrases.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              Operations
            </h3>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={undo}
              disabled={!canUndo() || isProcessing}
              className={`
                px-2 py-1 text-xs rounded font-medium transition-colors
                ${!canUndo() || isProcessing
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
              `}
            >
              ←
            </button>
            <button
              onClick={redo}
              disabled={!canRedo() || isProcessing}
              className={`
                px-2 py-1 text-xs rounded font-medium transition-colors
                ${!canRedo() || isProcessing
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
              `}
            >
              →
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          {Object.entries(groupedOperations).map(([groupTitle, operations]) => (
            <OperationGroup
              key={groupTitle}
              title={groupTitle}
              operations={operations}
              onOperationClick={handleOperationClick}
              isProcessing={isProcessing || worker.isBusy}
            />
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <SearchReplace />

          <div className="space-y-2">
            <label
              className="flex items-center justify-center space-x-1.5
                px-2 py-1.5 bg-gray-50 dark:bg-gray-900
                border border-dashed border-gray-300 dark:border-gray-600
                rounded cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-xs"
            >
              <Upload className="w-3 h-3" />
              <span className="font-medium">Upload .txt</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
            </label>

            <button
              onClick={handleExport}
              disabled={!rawText || isProcessing}
              className={`
                w-full flex items-center justify-center space-x-1.5
                px-2 py-1.5 rounded font-medium transition-colors text-xs
                ${!rawText || isProcessing
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white'}
              `}
            >
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {worker.isBusy && (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <div>
              <div className="text-sm font-medium">Обробка...</div>
              <div className="text-xs opacity-75">
                {worker.progress || 0}% • {worker.processedItems.toLocaleString()} рядків
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperationsPanel
