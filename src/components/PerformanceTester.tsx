import { useState } from 'react'
import type { FC } from 'react'
import { operationCache } from '@utils/cache'
import { indexedDBService } from '@utils/indexedDB'
import { applyOperationToText } from '@utils/textOperationsExtended'
import { Zap, Timer, Database, AlertTriangle, CheckCircle } from 'lucide-react'

interface TestResult {
  operation: string
  lines: number
  timeMs: number
  memoryMB?: number
  success: boolean
}

export const PerformanceTester: FC = () => {
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const generateTestData = (lines: number): string => {
    const words = [
      'сок',
      'ціна',
      'телефон',
      'книга',
      'програмування',
      'український',
      'текст',
      'обробка',
      'великий',
      'набір',
      'даних',
      'продуктивність',
      'тестування',
      'оптимізація',
    ]

    const linesArray: string[] = []
    for (let i = 0; i < lines; i += 1) {
      const wordCount = Math.floor(Math.random() * 5) + 1
      const lineWords: string[] = []

      for (let j = 0; j < wordCount; j += 1) {
        const word = words[Math.floor(Math.random() * words.length)]
        const randomCase = Math.random() > 0.5 ? word.toUpperCase() : word.toLowerCase()
        lineWords.push(randomCase)
      }

      linesArray.push(lineWords.join(' '))
    }

    return linesArray.join('\n')
  }

  const runPerformanceTest = async () => {
    setIsTesting(true)
    const results: TestResult[] = []

    const testCases = [
      { lines: 100, operation: 'uppercase' as const },
      { lines: 1000, operation: 'lowercase' as const },
      { lines: 5000, operation: 'sort_asc' as const },
      { lines: 10000, operation: 'remove_duplicates' as const },
      { lines: 20000, operation: 'remove_empty_lines' as const },
      { lines: 50000, operation: 'trim_spaces' as const },
    ]

    operationCache.clear()

    for (const testCase of testCases) {
      try {
        const testText = generateTestData(testCase.lines)
        const startTime = performance.now()
        const startMemory = (performance as any).memory?.usedJSHeapSize || 0

        applyOperationToText(testText, testCase.operation)

        const endTime = performance.now()
        const endMemory = (performance as any).memory?.usedJSHeapSize || 0

        const memoryUsedMB =
          startMemory && endMemory ? (endMemory - startMemory) / 1024 / 1024 : undefined

        results.push({
          operation: testCase.operation,
          lines: testCase.lines,
          timeMs: Math.round(endTime - startTime),
          memoryMB: memoryUsedMB ? Math.round(memoryUsedMB * 100) / 100 : undefined,
          success: true,
        })

        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Test failed for ${testCase.lines} lines:`, error)
        results.push({
          operation: testCase.operation,
          lines: testCase.lines,
          timeMs: 0,
          success: false,
        })
      }
    }

    try {
      const testText = generateTestData(5000)
      const startTime = performance.now()

      const id = await indexedDBService.saveText(testText, 'performance-test')
      const loaded = await indexedDBService.loadText(id)
      await indexedDBService.deleteText(id)

      const endTime = performance.now()

      results.push({
        operation: 'indexeddb_rw',
        lines: 5000,
        timeMs: Math.round(endTime - startTime),
        success: !!loaded,
      })
    } catch (error) {
      console.error('IndexedDB test failed:', error)
    }

    try {
      const testText = generateTestData(1000)
      const startTime = performance.now()

      operationCache.set(testText, 'test_operation', testText.toUpperCase())
      const cached = operationCache.get(testText, 'test_operation')

      const endTime = performance.now()

      results.push({
        operation: 'cache_rw',
        lines: 1000,
        timeMs: Math.round(endTime - startTime),
        success: !!cached,
      })
    } catch (error) {
      console.error('Cache test failed:', error)
    }

    setTestResults(results)
    setIsTesting(false)
  }

  const getAveragePerformance = () => {
    const successfulTests = testResults.filter((r) => r.success)
    if (successfulTests.length === 0) return null

    const avgTime =
      successfulTests.reduce((sum, r) => sum + r.timeMs, 0) / successfulTests.length
    const avgLinesPerMs =
      successfulTests.reduce((sum, r) => sum + (r.lines / Math.max(r.timeMs, 1)), 0) /
      successfulTests.length

    return {
      avgTime: Math.round(avgTime),
      avgLinesPerMs: Math.round(avgLinesPerMs * 100) / 100,
    }
  }

  const avg = getAveragePerformance()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Тест продуктивності
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Перевірка операцій з довгими текстами
            </p>
          </div>
        </div>
        <button
          onClick={runPerformanceTest}
          disabled={isTesting}
          className={`px-5 py-2 rounded-lg font-medium flex items-center space-x-2 transition ${
            isTesting
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {isTesting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Тест...</span>
            </>
          ) : (
            <>
              <Timer className="w-5 h-5" />
              <span>Запустити</span>
            </>
          )}
        </button>
      </div>

      {isTesting ? (
        <div className="space-y-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 animate-pulse w-full" />
          </div>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Вимірюється час та пам’ять при обробці великих наборів даних...
          </p>
        </div>
      ) : testResults.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">Тестів</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{testResults.length}</div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">Успішно</div>
                <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {testResults.filter((r) => r.success).length}
                </div>
              </div>
            </div>
            {avg && (
              <>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">Середній час</div>
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {avg.avgTime} мс
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">Швидкість</div>
                    <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {avg.avgLinesPerMs} ряд/мс
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3">Операція</th>
                  <th className="text-left py-2 px-3">Рядків</th>
                  <th className="text-left py-2 px-3">Час (мс)</th>
                  <th className="text-left py-2 px-3">Пам'ять</th>
                  <th className="text-left py-2 px-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, index) => (
                  <tr
                    key={`${result.operation}-${index}`}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <td className="py-2 px-3 font-mono">
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <span>{result.operation}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-mono">{result.lines.toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(result.timeMs / 100, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono">{result.timeMs}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-mono">
                      {result.memoryMB ? `${result.memoryMB} МБ` : '—'}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          result.success
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {result.success ? 'Успішно' : 'Помилка'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Рекомендації
            </h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-200">
              {(() => {
                const recommendations: string[] = []
                const slowTests = testResults.filter((r) => r.timeMs > 1000 && r.success)
                if (slowTests.length > 0) {
                  recommendations.push(
                    'Деякі операції >1 сек. Розгляньте запуск через Web Worker/відкладені виклики.',
                  )
                }

                const memoryTests = testResults.filter((r) => r.memoryMB && r.memoryMB > 50)
                if (memoryTests.length > 0) {
                  recommendations.push(
                    'Деякі операції використовують багато пам’яті. Увімкніть віртуалізацію для великих текстів.',
                  )
                }

                if (avg && avg.avgLinesPerMs < 10) {
                  recommendations.push(
                    'Швидкість обробки низька. Перевірте налаштування оптимізації/worker.',
                  )
                }

                if (recommendations.length === 0) {
                  recommendations.push(
                    'Продуктивність виглядає стабільною з обраними параметрами.',
                  )
                }

                return recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2" />
                    <span>{rec}</span>
                  </li>
                ))
              })()}
            </ul>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Database className="w-12 h-12 mx-auto mb-3" />
          <p>Натисніть “Запустити тест”, щоб перевірити роботу з великими даними.</p>
          <p className="text-xs mt-1">Тест охоплює від 100 до 50 000 рядків.</p>
        </div>
      )}

      {(performance as any)?.memory && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <div className="text-xs">Використано пам’яті</div>
              <div className="font-mono">
                {Math.round(((performance as any).memory.usedJSHeapSize || 0) / 1024 / 1024)} МБ
              </div>
            </div>
            <div>
              <div className="text-xs">Ліміт пам’яті</div>
              <div className="font-mono">
                {Math.round(((performance as any).memory.jsHeapSizeLimit || 0) / 1024 / 1024)} МБ
              </div>
            </div>
            <div>
              <div className="text-xs">Ядер CPU</div>
              <div className="font-mono">{navigator.hardwareConcurrency || '—'}</div>
            </div>
            <div>
              <div className="text-xs">IndexedDB</div>
              <div className="font-mono">{'indexedDB' in window ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceTester
