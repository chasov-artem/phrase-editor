import React from 'react'
import { useStore } from '@store/useStore'
import { formatExecutionTime, formatNumber } from '@utils/textAnalysis'
import type { OperationIdentifier } from '../../types/operations'
import {
  AlertCircle,
  BarChart3,
  Clock,
  FileText,
  Hash,
  TrendingUp,
  Type,
} from 'lucide-react'

export const Metrics: React.FC = () => {
  const { textMetrics, operationMetrics, isProcessing } = useStore()

  const metricCards = [
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Total lines',
      value: formatNumber(textMetrics.totalLines),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: <Hash className="w-5 h-5" />,
      label: 'Non-empty',
      value: formatNumber(textMetrics.nonEmptyLines),
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Empty',
      value: formatNumber(textMetrics.emptyLines),
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    },
    {
      icon: <Type className="w-5 h-5" />,
      label: 'Words',
      value: formatNumber(textMetrics.wordCount),
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Characters',
      value: formatNumber(textMetrics.totalCharacters),
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Operation time',
      value: operationMetrics
        ? formatExecutionTime(operationMetrics.executionTime)
        : '—',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ]

  const getOperationName = (operation: OperationIdentifier | null) => {
    if (!operation) {
      return '—'
    }

    const names: Record<OperationIdentifier, string> = {
      uppercase: 'All uppercase',
      lowercase: 'All lowercase',
      title_case: 'Title case',
      sentence_case: 'Sentence case',
      add_plus_prefix: 'Add + prefix',
      remove_plus_prefix: 'Remove + prefix',
      add_quotes: 'Wrap with quotes',
      add_brackets: 'Wrap with brackets',
      add_dash_prefix: 'Add dash prefix',
      add_dash_brackets_prefix: 'Add -[...] wrapper',
      add_dash_quotes_prefix: 'Add -"..." wrapper',
      trim_spaces: 'Trim spaces',
      remove_tabs: 'Remove tabs',
      replace_spaces_with_underscore: 'Spaces → underscore',
      remove_special_chars: 'Remove special chars',
      replace_special_chars_with_spaces: 'Special chars → spaces',
      remove_after_dash: 'Remove text after "-"',
      sort_asc: 'Sort A → Z',
      sort_desc: 'Sort Z → A',
      remove_duplicates: 'Remove duplicates',
      remove_empty_lines: 'Remove empty lines',
      search_replace: 'Search & replace',
    }

    return names[operation]
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
          Text metrics
        </h3>

        {isProcessing && (
          <div className="flex items-center space-x-1.5 text-xs text-blue-600 dark:text-blue-400">
            <div className="w-2.5 h-2.5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bgColor} p-2.5 rounded border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition overflow-hidden`}
          >
            <div className="flex items-center space-x-2 min-w-0">
              <div className={`p-1.5 rounded flex-shrink-0 ${card.bgColor}`}>
                <div className={`${card.color} flex items-center`}>
                  {React.cloneElement(card.icon as React.ReactElement, { className: 'w-3.5 h-3.5' })}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {card.label}
                </p>
                <p className={`text-sm font-bold ${card.color} truncate`} title={String(card.value)}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {operationMetrics && (
        <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last operation
          </h4>

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2">
            <span className="flex items-center space-x-1.5 flex-shrink-0">
              <AlertCircle className="w-3 h-3 text-gray-400" />
              <span>Type:</span>
            </span>
            <span className="font-medium text-gray-900 dark:text-white text-right truncate ml-2" title={getOperationName(operationMetrics.operation)}>
              {getOperationName(operationMetrics.operation)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2">
            <span className="flex-shrink-0">Processed:</span>
            <span className="font-mono text-xs text-right">
              {formatNumber(operationMetrics.linesProcessed)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2">
            <span className="flex-shrink-0">Result:</span>
            <span className="font-mono text-xs text-right">
              {formatNumber(operationMetrics.linesChanged)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2">
            <span className="flex-shrink-0">Time:</span>
            <span className="font-mono text-xs text-right truncate" title={formatExecutionTime(operationMetrics.executionTime)}>
              {formatExecutionTime(operationMetrics.executionTime)}
            </span>
          </div>
        </div>
      )}

      {textMetrics.totalLines === 0 && (
        <div className="mt-4 rounded bg-gray-50 dark:bg-gray-900/50 p-3 text-center text-xs text-gray-600 dark:text-gray-400">
          Paste or type phrases to analyze
        </div>
      )}
    </div>
  )
}

export default Metrics
