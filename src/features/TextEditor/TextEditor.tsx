import React from 'react'
import { Copy, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useTextEditor } from './hooks/useTextEditor'
import { TextArea } from './components/TextArea'
import { getLineCount } from '@utils/textOperations'

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
    ? 'Результат буде відображено тут після виконання операцій...'
    : 'Вставте фрази, кожна з нового рядка...\nНаприклад:\nсок ЦІНА\nтелефон Samsung\nкнига програмування'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {isResultVisible ? 'Результат обробки' : 'Вхідний текст'}
            </h2>
            <button
              onClick={toggleResultView}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title={isResultVisible ? 'Показати вхідний текст' : 'Показати результат'}
            >
              {isResultVisible ? (
                <>
                  <EyeOff size={16} />
                  <span>Вхідний текст</span>
                </>
              ) : (
                <>
                  <Eye size={16} />
                  <span>Результат</span>
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
              <span>Очистити</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
            >
              <Copy size={18} />
              <span>Копіювати</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <TextArea
            value={displayText}
            onChange={handleTextChange}
            placeholder={displayPlaceholder}
            disabled={isResultVisible}
            autoFocus={!isResultVisible}
          />

          <div className="absolute bottom-3 right-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
            {getLineCount(displayText)} рядків
          </div>
        </div>

        {isResultVisible && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium">Режим перегляду результату</p>
            <p className="text-xs opacity-75 mt-1">
              Текст доступний тільки для читання. Для редагування перейдіть у режим "Вхідний текст"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TextEditor
