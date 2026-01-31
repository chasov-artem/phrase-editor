import React, { useState } from 'react'
import { useStore } from '@store/useStore'
import { searchAndReplace } from '@utils/textOperationsExtended'
import type { OperationIdentifier } from '../../../types/operations'
import {
  Search,
  Replace,
  Regex,
  CaseSensitive,
} from 'lucide-react'

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
  const isProcessing = useStore((state) => state.isProcessing)

  const handleReplace = () => {
    if (!searchTerm.trim()) return

    const textToProcess = processedText || rawText
    if (!textToProcess) return

    const startTime = performance.now()

    const result = searchAndReplace(
      textToProcess,
      searchTerm,
      replaceTerm,
      useRegex,
      caseSensitive,
    )

    const executionTime = performance.now() - startTime

    const operationTimestamp = Date.now()
    setProcessedText(result)
    setOperationMetrics({
      operation: 'search_replace' as OperationIdentifier,
      executionTime,
      linesProcessed: textToProcess.split('\n').length,
      linesChanged: result.split('\n').length,
    })
    addToHistory(result)
    setLastOperationTimestamp(operationTimestamp)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleReplace()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Search & Replace
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Search className="w-4 h-4" />
              <span>Find:</span>
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter text to find..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Replace className="w-4 h-4" />
              <span>Replace with:</span>
            </label>
            <input
              type="text"
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter replacement text..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
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
                  w-10 h-6 rounded-full transition-colors
                  ${useRegex ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${useRegex ? 'left-5' : 'left-1'}
                  `}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Regex className="w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Regular expressions
              </span>
            </div>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
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
                  w-10 h-6 rounded-full transition-colors
                  ${caseSensitive ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
              >
                <div
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${caseSensitive ? 'left-5' : 'left-1'}
                  `}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CaseSensitive className="w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Case sensitive
              </span>
            </div>
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={handleReplace}
            disabled={!searchTerm.trim() || isProcessing}
            className={`
              w-full py-3 px-4 rounded-lg font-medium
              flex items-center justify-center space-x-2
              transition-all duration-200
              ${!searchTerm.trim() || isProcessing
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md hover:shadow-lg'}
            `}
          >
              <Replace className="w-5 h-5" />
            <span>Apply replace</span>
          </button>

          {useRegex && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Regex mode enabled</p>
              <p className="text-xs mt-1">
                Use special tokens: . * + ? ^ $ { } [ ] ( ) | \\ /
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
