import React, { useMemo, useState, useCallback } from 'react'
import { Copy, Eye, EyeOff, Trash2, Upload } from 'lucide-react'
import { useTextEditor } from './hooks/useTextEditor'
import { TextArea } from './components/TextArea'
import { getLineCount } from '@utils/textOperations'
import { useStore } from '@store/useStore'
import { usePerformance } from '../../providers/PerformanceProvider'
import { VirtualizedList } from './components/VirtualizedList'
import { EditLineModal } from '../../components/EditLineModal'
import { useFileDrop } from '../../hooks/useFileDrop'
import { useToastContext } from '@providers/ToastProvider'
import { MAX_FILE_SIZE } from '@utils/constants'

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
  const [editingLine, setEditingLine] = useState<{ index: number; value: string } | null>(null)
  const { error: showError, success: showSuccess } = useToastContext()
  const { setRawText, setProcessedText, setOperationMetrics, resetHistory, setIsProcessing } = useStore()

  const handleLineEdit = (index: number, line: string) => {
    setEditingLine({ index, value: line })
  }

  const handleSaveLine = (newValue: string) => {
    if (editingLine === null) return
    const updatedLines = [...lines]
    updatedLines[editingLine.index] = newValue
    handleTextChange(updatedLines.join('\n'))
    setEditingLine(null)
  }

  const processFile = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        showError(
          `File is too large. Maximum size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`,
          5000,
        )
        return
      }

      if (!file.name.toLowerCase().endsWith('.txt')) {
        showError('Only .txt files are supported', 4000)
        return
      }

      setIsProcessing(true)
      const reader = new FileReader()

      reader.onerror = () => {
        showError('Error reading file', 4000)
        setIsProcessing(false)
      }

      reader.onload = (e) => {
        try {
          const content = (e.target?.result as string) || ''

          const MAX_TEXT_SIZE = 10 * 1024 * 1024 // 10MB
          if (content.length > MAX_TEXT_SIZE) {
            showError(
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
          showSuccess(`File "${file.name}" loaded successfully`, 3000)
        } catch (err) {
          showError('Error processing file', 4000)
        } finally {
          setIsProcessing(false)
        }
      }

      reader.readAsText(file, 'UTF-8')
    },
    [showError, showSuccess, setIsProcessing, setRawText, setProcessedText, setOperationMetrics, resetHistory],
  )

  const { isDragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop } = useFileDrop({
    onFileDrop: processFile,
    onError: showError,
  })

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-3 transition-all ${
        isDragging ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
            {isResultVisible ? 'Processed output' : 'Input text'}
          </h2>
          <button
            onClick={toggleResultView}
            aria-label={isResultVisible ? 'Show input text' : 'Show processed output'}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            title={isResultVisible ? 'Show input text' : 'Show processed output'}
          >
            {isResultVisible ? (
              <>
                <EyeOff size={12} />
                <span>Input</span>
              </>
            ) : (
              <>
                <Eye size={12} />
                <span>Output</span>
              </>
            )}
          </button>
        </div>

        <div className="flex space-x-1.5">
          <button
            onClick={handleClear}
            aria-label="Clear text"
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>

          <button
            onClick={handleCopy}
            aria-label="Copy to clipboard (Ctrl+C)"
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <Copy size={14} />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border-2 border-dashed border-blue-500 z-10">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Drop file to upload
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Only .txt files are supported
            </p>
          </div>
        </div>
      )}

      {shouldVirtualize ? (
        <div className="space-y-4 relative">
          <VirtualizedList
            lines={lines}
            onLineEdit={handleLineEdit}
            onLineCopy={(_, line) => {
              navigator.clipboard.writeText(line)
            }}
            readOnly={isResultVisible}
            maxHeight={400}
          />

          <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded flex items-center justify-between">
            <span>Virtualized mode ({lines.length.toLocaleString()} rows)</span>
            <button
              onClick={() => setUseVirtualization(false)}
              className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
            >
              Normal mode
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 rounded border-2 border-dashed border-blue-500 z-10">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Drop file
                </p>
              </div>
            </div>
          )}
          <TextArea
            value={displayText}
            onChange={handleTextChange}
            placeholder={displayPlaceholder}
            disabled={isResultVisible}
            autoFocus={!isResultVisible}
          />

          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
            {getLineCount(displayText)} rows
          </div>

          {!useVirtualization && needsVirtualization(lines.length) && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>Need better performance?</span>
              <button
                onClick={() => setUseVirtualization(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                Enable virtualization
              </button>
            </div>
          )}
        </div>
      )}

      {isResultVisible && (
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs text-yellow-800 dark:text-yellow-200">
          <p className="font-medium">Result preview mode</p>
          <p className="text-xs opacity-75 mt-0.5">
            Text is read-only. Switch back to "Input text" to edit.
          </p>
        </div>
      )}

      {editingLine && (
        <EditLineModal
          isOpen={true}
          initialValue={editingLine.value}
          onSave={handleSaveLine}
          onClose={() => setEditingLine(null)}
          title={`Edit line ${editingLine.index + 1}`}
        />
      )}
    </div>
  )
}

export default TextEditor
