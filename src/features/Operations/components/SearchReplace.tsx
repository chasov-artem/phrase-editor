import React, { useState } from 'react'
import { useStore } from '@store/useStore'
import type { OperationIdentifier } from '../../../types/operations'
import {
  Search,
  Replace,
  Regex,
  CaseSensitive,
} from 'lucide-react'
import { usePerformance } from '../../../providers/PerformanceProvider'

export const SearchReplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [useRegex, setUseRegex] = useState(false)
  const [caseSensitive, setCaseSensitive] = useState(false)

  const rawText = useStore((state) => state.rawText)
  const processedText = useStore((state) => state.processedText)
  const setProcessedText = useStore((state) => state.setProcessedText)
  const setOperationMetrics = useStore((state) => state.setOperationMetrics)
  const addToHistory = useStore((state) => state.addToHistory)
  const setLastOperationTimestamp = useStore(
    (state) => state.setLastOperationTimestamp,
  )
  const setIsProcessing = useStore((state) => state.setIsProcessing)
  const isProcessing = useStore((state) => state.isProcessing)
  const { worker } = usePerformance()

  const handleReplace = async () => {
    if (isProcessing || worker.isBusy) return
    if (!searchTerm.trim()) return

    const textToProcess = processedText || rawText
    if (!textToProcess) return

    setIsProcessing(true)
    try {
      const startTime = performance.now()

      const result = await worker.execute<string>(
        'SEARCH_REPLACE',
        {
          text: textToProcess,
          search: searchTerm,
          replace: replaceTerm,
          useRegex,
          caseSensitive,
        },
        (progress, processed) => {
          console.log(`Search & replace progress: ${progress}% (${processed} rows)`)
        },
      )

      const executionTime = performance.now() - startTime
      setProcessedText(result)
      setOperationMetrics({
        operation: 'search_replace' as OperationIdentifier,
        executionTime,
        linesProcessed: textToProcess.split('\n').length,
        linesChanged: result.split('\n').length,
      })
      addToHistory(result)
      setLastOperationTimestamp(Date.now())
    } catch (error) {
      console.error('Search & Replace failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleReplace()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-2">
      <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Search & Replace
      </h3>

      <div className="space-y-2">
        <div>
          <label className="flex items-center space-x-1 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Search className="w-3 h-3" />
            <span>Find:</span>
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter text to find..."
            className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isProcessing}
          />
        </div>

        <div>
          <label className="flex items-center space-x-1 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Replace className="w-3 h-3" />
            <span>Replace:</span>
          </label>
          <input
            type="text"
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter replacement..."
            className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isProcessing}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex items-center space-x-1.5 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={useRegex}
                onChange={(e) => setUseRegex(e.target.checked)}
                className="sr-only"
                disabled={isProcessing}
              />
              <div
                className={`
                  w-8 h-4 rounded-full transition-colors
                  ${useRegex ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform
                    ${useRegex ? 'left-4' : 'left-0.5'}
                  `}
                />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Regex className="w-3 h-3" />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Regex
              </span>
            </div>
          </label>

          <label className="flex items-center space-x-1.5 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="sr-only"
                disabled={isProcessing}
              />
              <div
                className={`
                  w-8 h-4 rounded-full transition-colors
                  ${caseSensitive ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform
                    ${caseSensitive ? 'left-4' : 'left-0.5'}
                  `}
                />
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <CaseSensitive className="w-3 h-3" />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                Case
              </span>
            </div>
          </label>
        </div>

        <div>
          <button
            onClick={() => {
              void handleReplace()
            }}
            disabled={!searchTerm.trim() || isProcessing}
            className={`
              w-full py-1.5 px-2 rounded font-medium text-xs
              flex items-center justify-center space-x-1.5
              transition-all duration-200
              ${!searchTerm.trim() || isProcessing
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'}
            `}
          >
              <Replace className="w-3 h-3" />
            <span>Replace</span>
          </button>

          {useRegex && (
            <div className="mt-1.5 p-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Regex enabled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
