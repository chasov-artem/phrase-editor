import React, { useState } from 'react'
import { useStore } from '@store/useStore'
import { operationCache } from '@utils/cache'
import { indexedDBService } from '@utils/indexedDB'
import { Settings, Cpu, Database } from 'lucide-react'

export const SettingsPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [dbStats, setDbStats] = useState<{ totalEntries: number; totalSize: number; maxSize: number } | null>(null)
  const [cacheStats, setCacheStats] = useState<ReturnType<typeof operationCache.getStats> | null>(null)

  const {
    useVirtualization,
    autoSave,
    setUseVirtualization,
    setAutoSave,
  } = useStore()

  const loadStats = async () => {
    const stats = await indexedDBService.getStats()
    setDbStats(stats)

    const cacheSnapshot = operationCache.getStats()
    setCacheStats(cacheSnapshot)
  }

  const clearCache = () => {
    if (
      window.confirm(
        'Clear operation cache? This will speed up next operations but will remove saved results.',
      )
    ) {
      operationCache.clear()
      setCacheStats(operationCache.getStats())
    }
  }

  const clearDatabase = () => {
    if (window.confirm('Clear entire database? This action is irreversible.')) {
      indexedDB.deleteDatabase('phrase-editor-db')
      setDbStats(null)
      alert('Database cleared')
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true)
          loadStats()
        }}
        className="fixed bottom-4 right-4 p-3 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-full shadow-lg z-50"
        title="Settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Settings</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Performance and data storage management
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <section>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                    <Cpu className="w-5 h-5" />
                    <span>Performance</span>
                  </h4>

                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">Virtualization</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Enable for texts over 500 rows
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={useVirtualization}
                          onChange={(e) => setUseVirtualization(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${
                            useVirtualization ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              useVirtualization ? 'left-7' : 'left-1'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">Auto-save</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Automatically save changes
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={autoSave}
                          onChange={(e) => setAutoSave(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${
                            autoSave ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              autoSave ? 'left-7' : 'left-1'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </label>
                  </div>
                </section>

                <section>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center space-x-2">
                    <Database className="w-5 h-5" />
                    <span>Дані та пам’ять</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Operation Cache</div>
                        <button
                          onClick={clearCache}
                          className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Clear
                        </button>
                      </div>
                      {cacheStats ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Entries:</span>
                            <span className="font-mono">{cacheStats.entries}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Size:</span>
                            <span className="font-mono">{Math.round(cacheStats.size / 1024)} KB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Hit Rate:</span>
                            <span className="font-mono">{cacheStats.hitRate}%</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 text-sm">Statistics not loaded</p>
                      )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</div>
                        <button
                          onClick={clearDatabase}
                          className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          Clear
                        </button>
                      </div>
                      {dbStats ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Entries:</span>
                            <span className="font-mono">{dbStats.totalEntries}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Size:</span>
                            <span className="font-mono">{Math.round(dbStats.totalSize / 1024 / 1024)} MB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Limit:</span>
                            <span className="font-mono">{Math.round(dbStats.maxSize / 1024 / 1024)} MB</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 text-sm">Statistics not loaded</p>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Application Information</h4>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Version:</span>
                        <span className="font-mono">{import.meta.env.VITE_APP_VERSION || '1.0.0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Build:</span>
                        <span className="font-mono">{import.meta.env.VITE_APP_BUILD_TIME || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">IndexedDB:</span>
                        <span className="font-mono">{'indexedDB' in window ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Web Workers:</span>
                        <span className="font-mono">{typeof Worker !== 'undefined' ? '✅' : '❌'}</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Save and close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SettingsPanel
