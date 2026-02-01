import React, { useCallback } from 'react'
import type { ChangeEvent } from 'react'
import { useStore } from '@store/useStore'
import { operationsConfig } from '@utils/operationsConfig'
import type { OperationConfig } from '../../types/operations'
import { OperationGroup } from './components/OperationGroup'
import { SearchReplace } from './components/SearchReplace'
import { Zap, Download, Upload } from 'lucide-react'
import { usePerformance } from '../../providers/PerformanceProvider'
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, MAX_TEXT_SIZE } from '@utils/constants'
import { useToastContext } from '@providers/ToastProvider'

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
  const { success, error } = useToastContext()

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
      success(
        `Operation completed successfully. Processed ${linesProcessed.toLocaleString()} rows`,
        3000,
      )
    } catch (err) {
      console.error('Operation failed:', err)
      error(
        `Operation error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        5000,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOperationClick = (operationId: OperationConfig['id']) => {
    executeOperation(operationId)
  }

  const processFile = useCallback(
    (file: File) => {
      // Валідація типу файлу
      const isValidType =
        ALLOWED_FILE_TYPES.some(
          (type) => file.type === type || file.name.toLowerCase().endsWith(type),
        ) || file.type === '' // Деякі браузери не визначають тип для .txt

      if (!isValidType && !file.name.toLowerCase().endsWith('.txt')) {
        error('Only .txt files are supported', 4000)
        return
      }

      // Валідація розміру файлу
      if (file.size > MAX_FILE_SIZE) {
        error(
          `File is too large. Maximum size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`,
          5000,
        )
        return
      }

      setIsProcessing(true)
      const reader = new FileReader()

      reader.onerror = () => {
        error('Error reading file', 4000)
        setIsProcessing(false)
      }

      reader.onload = (e) => {
        try {
          const content = (e.target?.result as string) || ''

          // Перевірка розміру тексту після завантаження
          if (content.length > MAX_TEXT_SIZE) {
            error(
              `Text is too large. Maximum size: ${(MAX_TEXT_SIZE / 1024 / 1024).toFixed(0)}MB`,
              5000,
            )
            setIsProcessing(false)
            return
          }

          setRawText(content)
          setProcessedText('')
          setOperationMetrics(null)
          resetHistory(content)
          success(`File "${file.name}" loaded successfully`, 3000)
        } catch (err) {
          error('Error processing file', 4000)
        } finally {
          setIsProcessing(false)
        }
      }

      reader.readAsText(file, 'UTF-8')
    },
    [error, success, setIsProcessing, setRawText, setProcessedText, setOperationMetrics, resetHistory],
  )

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    processFile(file)
    event.target.value = '' // Очистити input для можливості повторного завантаження того ж файлу
  }

  const handleExport = (format: 'txt' | 'csv' | 'json' = 'txt') => {
    const textToExport = processedText || rawText
    if (!textToExport) {
      error('No text to export', 3000)
      return
    }

    try {
      let content: string
      let mimeType: string
      let filename: string

      switch (format) {
        case 'csv':
          const lines = textToExport.split('\n')
          content = lines.map((line) => `"${line.replace(/"/g, '""')}"`).join('\n')
          mimeType = 'text/csv'
          filename = 'phrases.csv'
          break
        case 'json':
          const jsonLines = textToExport.split('\n').filter((line) => line.trim())
          content = JSON.stringify(jsonLines, null, 2)
          mimeType = 'application/json'
          filename = 'phrases.json'
          break
        default:
          content = textToExport
          mimeType = 'text/plain'
          filename = 'phrases.txt'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      success(`File ${filename} downloaded successfully`, 3000)
    } catch (err) {
      error('Error exporting file', 4000)
    }
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
              aria-label="Undo (Ctrl+Z)"
              aria-disabled={!canUndo() || isProcessing}
              className={`
                px-2 py-1 text-xs rounded font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
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
              aria-label="Redo (Ctrl+Y)"
              aria-disabled={!canRedo() || isProcessing}
              className={`
                px-2 py-1 text-xs rounded font-medium transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
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
                rounded cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-xs
                focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1"
              aria-label="Upload .txt file"
            >
              <Upload className="w-3 h-3" />
              <span className="font-medium">Upload .txt</span>
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
                aria-label="Select .txt file to upload"
              />
            </label>

            <div className="space-y-1.5">
              <button
                onClick={() => handleExport('txt')}
                disabled={!rawText || isProcessing}
                aria-label="Export as .txt file"
                aria-disabled={!rawText || isProcessing}
                className={`
                  w-full flex items-center justify-center space-x-1.5
                  px-2 py-1.5 rounded font-medium transition-colors text-xs
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1
                  ${!rawText || isProcessing
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white'}
                `}
              >
                <Download className="w-3 h-3" />
                <span>Export .txt</span>
              </button>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleExport('csv')}
                  disabled={!rawText || isProcessing}
                  aria-label="Export as .csv file"
                  className={`
                    px-2 py-1 rounded text-xs font-medium transition-colors
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                    ${!rawText || isProcessing
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'}
                  `}
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={!rawText || isProcessing}
                  aria-label="Export as .json file"
                  className={`
                    px-2 py-1 rounded text-xs font-medium transition-colors
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1
                    ${!rawText || isProcessing
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white'}
                  `}
                >
                  JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {worker.isBusy && (
        <div className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-blue-500">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <div>
              <div className="text-sm font-medium">Processing...</div>
              <div className="text-xs opacity-75">
                {worker.progress || 0}% • {worker.processedItems.toLocaleString()} rows
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperationsPanel
