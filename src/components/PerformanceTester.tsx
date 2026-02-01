import { useState } from 'react'
import type { FC } from 'react'
import { operationCache } from '@utils/cache'
import { indexedDBService } from '@utils/indexedDB'
import { applyOperationToText } from '@utils/textOperationsExtended'
import { Zap, Timer, Database, AlertTriangle, CheckCircle } from 'lucide-react'
import { useToastContext } from '@providers/ToastProvider'

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
  const { success, error } = useToastContext()

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
    const successfulCount = results.filter((r) => r.success).length
    if (successfulCount === results.length) {
      success(`All tests passed successfully (${results.length})`, 4000)
    } else {
      error(
        `Tests completed: ${successfulCount}/${results.length} successful`,
        5000,
      )
    }
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-2 min-w-0 flex-1">
          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded flex-shrink-0">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              Performance Test
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Testing operations with long texts
            </p>
          </div>
        </div>
        <button
          onClick={runPerformanceTest}
          disabled={isTesting}
          className={`px-3 py-1.5 rounded font-medium flex items-center space-x-1.5 text-xs transition flex-shrink-0 ${
            isTesting
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white'
          }`}
        >
          {isTesting ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Testing...</span>
            </>
          ) : (
            <>
              <Timer className="w-3.5 h-3.5" />
              <span>Run</span>
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
            Measuring time and memory when processing large datasets...
          </p>
        </div>
      ) : testResults.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-gray-500 truncate">Tests</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">{testResults.length}</div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-gray-500 truncate">Successful</div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400 flex-shrink-0">
                  {testResults.filter((r) => r.success).length}
                </div>
              </div>
            </div>
            {avg && (
              <>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-500 truncate">Avg time</div>
                    <div className="text-sm font-semibold text-orange-600 dark:text-orange-400 flex-shrink-0 truncate" title={`${avg.avgTime} ms`}>
                      {avg.avgTime} ms
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-500 truncate">Speed</div>
                    <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex-shrink-0 truncate" title={`${avg.avgLinesPerMs} rows/ms`}>
                      {avg.avgLinesPerMs} rows/ms
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-1.5 px-2">Operation</th>
                  <th className="text-left py-1.5 px-2">Rows</th>
                  <th className="text-left py-1.5 px-2">Time</th>
                  <th className="text-left py-1.5 px-2">Memory</th>
                  <th className="text-left py-1.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {testResults.map((result, index) => (
                  <tr
                    key={`${result.operation}-${index}`}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <td className="py-1.5 px-2 font-mono">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {result.success ? (
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                        )}
                        <span className="truncate" title={result.operation}>{result.operation}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 font-mono text-right">{result.lines.toLocaleString()}</td>
                    <td className="py-1.5 px-2">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden flex-shrink-0">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(result.timeMs / 100, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs flex-shrink-0">{result.timeMs}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 font-mono text-xs">
                      {result.memoryMB ? `${result.memoryMB} MB` : '—'}
                    </td>
                    <td className="py-1.5 px-2">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                          result.success
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {result.success ? 'Success' : 'Error'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
            <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1.5">
              Recommendations
            </h4>
            <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-200">
              {(() => {
                const recommendations: string[] = []
                const slowTests = testResults.filter((r) => r.timeMs > 1000 && r.success)
                if (slowTests.length > 0) {
                  recommendations.push(
                    'Some operations >1 sec. Consider running via Web Worker/deferred calls.',
                  )
                }

                const memoryTests = testResults.filter((r) => r.memoryMB && r.memoryMB > 50)
                if (memoryTests.length > 0) {
                  recommendations.push(
                    'Some operations use a lot of memory. Enable virtualization for large texts.',
                  )
                }

                if (avg && avg.avgLinesPerMs < 10) {
                  recommendations.push(
                    'Processing speed is low. Check optimization/worker settings.',
                  )
                }

                if (recommendations.length === 0) {
                  recommendations.push(
                    'Performance looks stable with selected parameters.',
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
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          <Database className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>Click "Run test" to check work with large data.</p>
          <p className="text-xs mt-1">The test covers from 100 to 50,000 rows.</p>
        </div>
      )}

      {(performance as any)?.memory && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs">Memory used</div>
              <div className="font-mono">
                {Math.round(((performance as any).memory.usedJSHeapSize || 0) / 1024 / 1024)} MB
              </div>
            </div>
            <div>
              <div className="text-xs">Memory limit</div>
              <div className="font-mono">
                {Math.round(((performance as any).memory.jsHeapSizeLimit || 0) / 1024 / 1024)} MB
              </div>
            </div>
            <div>
              <div className="text-xs">CPU cores</div>
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
