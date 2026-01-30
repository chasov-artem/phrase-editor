import React from 'react'
import { useStore } from '@store/useStore'
import { formatExecutionTime, formatNumber } from '@utils/textAnalysis'
import type { TextOperationType } from '@types/operations'
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
      label: 'Усього рядків',
      value: formatNumber(textMetrics.totalLines),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: <Hash className="w-5 h-5" />,
      label: 'Не порожніх',
      value: formatNumber(textMetrics.nonEmptyLines),
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Порожніх',
      value: formatNumber(textMetrics.emptyLines),
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    },
    {
      icon: <Type className="w-5 h-5" />,
      label: 'Слів',
      value: formatNumber(textMetrics.wordCount),
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Символів',
      value: formatNumber(textMetrics.totalCharacters),
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Час операції',
      value: operationMetrics
        ? formatExecutionTime(operationMetrics.executionTime)
        : '—',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
  ]

  const getOperationName = (operation: TextOperationType | null) => {
    if (!operation) {
      return '—'
    }

    const names: Record<TextOperationType, string> = {
      uppercase: 'Усі великі літери',
      lowercase: 'Усі малі літери',
      title_case: 'Кожне слово з великої',
      sentence_case: 'Перше слово з великої',
      add_plus_prefix: 'Додати + перед словами',
      remove_plus_prefix: 'Видалити +',
      add_quotes: 'Додати лапки',
      add_brackets: 'Додати дужки',
      add_dash_prefix: 'Додати - на початок',
      trim_spaces: 'Обрізати пробіли',
      remove_tabs: 'Видалити табуляцію',
      replace_spaces_with_underscore: 'Пробіли → _',
      remove_special_chars: 'Видалити спецсимволи',
      replace_special_chars_with_spaces: 'Спецсимволи → пробіли',
      sort_asc: 'Сортувати А-Я',
      sort_desc: 'Сортувати Я-А',
      remove_duplicates: 'Видалити дублікати',
      remove_empty_lines: 'Видалити порожні рядки',
    }

    return names[operation]
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Метрики тексту
        </h3>

        {isProcessing && (
          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="w-3 h-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Обробка...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 mb-6">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`${card.bgColor} p-4 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <div className={card.color}>{card.icon}</div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {operationMetrics && (
        <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6 mt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Остання операція
          </h4>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span>Тип операції:</span>
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {getOperationName(operationMetrics.operation)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Оброблено рядків:</span>
            <span className="font-mono text-sm">
              {formatNumber(operationMetrics.linesProcessed)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Результатних рядків:</span>
            <span className="font-mono text-sm">
              {formatNumber(operationMetrics.linesChanged)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Час виконання:</span>
            <span className="font-mono text-sm">
              {formatExecutionTime(operationMetrics.executionTime)}
            </span>
          </div>
        </div>
      )}

      {textMetrics.totalLines === 0 && (
        <div className="mt-6 rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Введіть текст або вставте фрази для аналізу
        </div>
      )}
    </div>
  )
}

export default Metrics
