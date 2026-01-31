import React from 'react'
import type { TextOperationType } from '../../../types/operations'
import {
  Type,
  Hash,
  Trash2,
  Filter,
  ArrowUpDown,
  Zap,
  Check,
  X,
  Quote,
  Brackets,
  Minus,
} from 'lucide-react'

interface OperationButtonProps {
  id: TextOperationType
  title: string
  description: string
  group: string
  onClick: (id: TextOperationType) => void
  isProcessing?: boolean
}

const getIconForOperation = (id: TextOperationType) => {
  const iconMap: Record<TextOperationType, React.ReactNode> = {
    uppercase: <Type className="w-4 h-4" />,
    lowercase: <Type className="w-4 h-4" />,
    title_case: <Type className="w-4 h-4" />,
    sentence_case: <Type className="w-4 h-4" />,
    add_plus_prefix: <Hash className="w-4 h-4" />,
    remove_plus_prefix: <Hash className="w-4 h-4" />,
    add_quotes: <Quote className="w-4 h-4" />,
    add_brackets: <Brackets className="w-4 h-4" />,
    add_dash_prefix: <Minus className="w-4 h-4" />,
    add_dash_brackets_prefix: <Minus className="w-4 h-4" />,
    add_dash_quotes_prefix: <Minus className="w-4 h-4" />,
    trim_spaces: <Filter className="w-4 h-4" />,
    remove_tabs: <Filter className="w-4 h-4" />,
    remove_after_dash: <Trash2 className="w-4 h-4" />,
    replace_spaces_with_underscore: <Filter className="w-4 h-4" />,
    remove_special_chars: <Filter className="w-4 h-4" />,
    replace_special_chars_with_spaces: <Filter className="w-4 h-4" />,
    sort_asc: <ArrowUpDown className="w-4 h-4" />,
    sort_desc: <ArrowUpDown className="w-4 h-4" />,
    remove_duplicates: <Check className="w-4 h-4" />,
    remove_empty_lines: <X className="w-4 h-4" />,
  }

  return iconMap[id] || <Zap className="w-4 h-4" />
}

export const OperationButton: React.FC<OperationButtonProps> = ({
  id,
  title,
  description,
  onClick,
  isProcessing = false,
}) => {
  return (
    <button
      onClick={() => onClick(id)}
      disabled={isProcessing}
      className={`
        w-full p-4 rounded-lg border text-left
        transition-all duration-200
        flex flex-col space-y-2
        group
        ${isProcessing
          ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 cursor-not-allowed'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md'}
      `}
      title={description}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`
              p-2 rounded-lg
              ${isProcessing
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}
            `}
          >
            {getIconForOperation(id)}
          </div>
          <span
            className={`
              font-medium
              ${isProcessing
                ? 'text-gray-500 dark:text-gray-400'
                : 'text-gray-800 dark:text-gray-200'}
            `}
          >
            {title}
          </span>
        </div>

        {isProcessing && (
          <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
        {description}
      </p>
    </button>
  )
}
