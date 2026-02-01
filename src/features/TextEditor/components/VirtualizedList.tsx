import React, { useCallback } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { CheckCircle, XCircle, Edit2, Copy } from 'lucide-react'

interface VirtualizedListProps {
  lines: string[]
  onLineClick?: (index: number, line: string) => void
  onLineEdit?: (index: number, line: string) => void
  onLineCopy?: (index: number, line: string) => void
  readOnly?: boolean
  className?: string
  maxHeight?: number
}

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  lines,
  onLineClick,
  onLineEdit,
  onLineCopy,
  readOnly = false,
  className = '',
  maxHeight = 500,
}) => {
  const renderLine = useCallback(
    (index: number) => {
      const line = lines[index] ?? ''
      const isEmpty = !line.trim()

      const handleClick = () => {
        if (onLineClick) {
          onLineClick(index, line)
        }
      }

      const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onLineEdit) {
          onLineEdit(index, line)
        }
      }

      const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onLineCopy) {
          onLineCopy(index, line)
        }
      }

      return (
        <div
          onClick={handleClick}
          className={`
            group flex items-center justify-between p-3
            border-b border-gray-100 dark:border-gray-800
            hover:bg-gray-50 dark:hover:bg-gray-800/50
            transition-colors cursor-pointer
            ${isEmpty ? 'opacity-50' : ''}
          `}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {isEmpty ? (
                <XCircle className="w-4 h-4 text-gray-400" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-mono text-sm truncate">
                {isEmpty ? (
                  <span className="text-gray-400 italic">[empty line]</span>
                ) : (
                  line
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Row #{index + 1} • {line.length} characters
              </div>
            </div>
          </div>

          {!readOnly && !isEmpty && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleEdit}
                className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                title="Edit line"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleCopy}
                className="p-1 text-gray-500 hover:text-green-600 dark:hover:text-green-400"
                title="Copy line"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div>
      )
    },
    [lines, onLineClick, onLineEdit, onLineCopy, readOnly],
  )

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}
    >
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {lines.length.toLocaleString()} rows
          </div>
          <div className="text-xs text-gray-500">
            Virtualized list • High performance
          </div>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No rows to display
        </div>
      ) : (
        <Virtuoso
          style={{ height: `${maxHeight}px` }}
          totalCount={lines.length}
          itemContent={renderLine}
          overscan={200}
          components={{
            Header: () => (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
                Start of list ({lines.length.toLocaleString()} rows)
              </div>
            ),
            Footer: () => (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                End of list • Loaded {lines.length.toLocaleString()} rows
              </div>
            ),
            EmptyPlaceholder: () => (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No data to display
              </div>
            ),
          }}
        />
      )}
    </div>
  )
}
