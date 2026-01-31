import React, { useMemo } from 'react'
import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useTextEditor } from './hooks/useTextEditor'
import { TextArea } from './components/TextArea'
import { getLineCount } from '@utils/textOperations'
import { useStore } from '@store/useStore'
import { usePerformance } from '../../providers/PerformanceProvider'
import { VirtualizedList } from './components/VirtualizedList'

export const TextEditor: React.FC = () => {
  const {
    rawText,
    processedText,
    isResultVisible,
    handleTextChange,
    handleClear,
    handleCopy,
    toggleResultView,
  } = useTextEditor()

  const displayText =
    isResultVisible && processedText ? processedText : rawText

  const displayPlaceholder = isResultVisible
    ? 'Results appear here after applying operations...'
    : 'Paste phrases, one per line...\nFor example:\norange juice\nSamsung Galaxy\nprogramming book'

  const { needsVirtualization } = usePerformance()
  const useVirtualization = useStore((state) => state.useVirtualization)
  const setUseVirtualization = useStore((state) => state.setUseVirtualization)

  const lines = useMemo(
    () => displayText.split(/\r?\n/),
    [displayText],
  )

  const shouldVirtualize = useVirtualization && needsVirtualization(lines.length)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isResultVisible ? 'Processed output' : 'Input text'}
          </h2>
          <button
            onClick={toggleResultView}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title={isResultVisible ? 'Show input text' : 'Show processed output'}
          >
            {isResultVisible ? (
              <>
                <EyeOff size={16} />
                <span>Input text</span>
              </>
            ) : (
              <>
                <Eye size={16} />
                <span>Processed output</span>
              </>
            )}
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleClear}
            className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            <span>Clear</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
          >
            <Copy size={18} />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {shouldVirtualize ? (
        <div className="space-y-4">
          <VirtualizedList
            lines={lines}
            onLineEdit={(index, line) => {
              const updatedLines = [...lines]
              const input = prompt('Редагувати рядок:', line)
              updatedLines[index] = input ?? line
              handleTextChange(updatedLines.join('\n'))
            }}
            onLineCopy={(_, line) => {
              navigator.clipboard.writeText(line)
            }}
            readOnly={isResultVisible}
            maxHeight={400}
          />

          <div className="text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded flex items-center justify-between">
            <span>Віртуалізований режим ({lines.length.toLocaleString()} рядків)</span>
            <button
              onClick={() => setUseVirtualization(false)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Перейти до звичайного режиму
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <TextArea
            value={displayText}
            onChange={handleTextChange}
            placeholder={displayPlaceholder}
            disabled={isResultVisible}
            autoFocus={!isResultVisible}
          />

          <div className="absolute bottom-3 right-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
            {getLineCount(displayText)} rows
          </div>

          {!useVirtualization && needsVirtualization(lines.length) && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>Потрібна більша продуктивність?</span>
              <button
                onClick={() => setUseVirtualization(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Увімкнути віртуалізацію
              </button>
            </div>
          )}
        </div>
      )}

      {isResultVisible && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
          <p className="font-medium">Result preview mode</p>
          <p className="text-xs opacity-75 mt-1">
            Text is read-only. Switch back to "Input text" to edit.
          </p>
        </div>
      )}
    </div>
  )
}

export default TextEditor
