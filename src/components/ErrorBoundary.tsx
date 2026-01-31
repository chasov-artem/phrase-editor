import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    console.error('Error caught by boundary:', error, errorInfo)

    try {
      const stateToSave = {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
      }
      localStorage.setItem('editor-error-state', JSON.stringify(stateToSave))
    } catch (e) {
      // Ignore storage errors
    }
  }

  private handleReload = () => {
    try {
      const savedState = localStorage.getItem('editor-state')
      if (savedState) {
        localStorage.setItem('editor-state-backup', savedState)
      }
    } catch (e) {
      // Ignore errors
    }

    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleClearData = () => {
    if (window.confirm('Ця дія очистить всі збережені дані. Продовжити?')) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Щось пішло не так
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Сталася неочікувана помилка в додатку
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3">
                Деталі помилки:
              </h2>
              <div className="font-mono text-sm bg-white dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-48">
                <div className="text-red-600 dark:text-red-400">{this.state.error?.toString()}</div>
                {this.state.errorInfo && (
                  <div className="mt-4 text-gray-600 dark:text-gray-400 text-xs">
                    <div className="font-semibold mb-1">Stack trace:</div>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Перезавантажити додаток</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-medium transition-colors"
              >
                <Home className="w-5 h-5" />
                <span>На головну сторінку</span>
              </button>

              <div className="text-center">
                <button
                  onClick={this.handleClearData}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                >
                  Очистити всі дані та перезавантажити
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Якщо проблема повторюється, повідомте про неї на GitHub або збережіть деталі помилки.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function useSafeCallback<T extends (...args: any[]) => any>(
  callback: T,
  onError?: (error: Error) => void,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>) => {
    try {
      return callback(...args)
    } catch (error) {
      console.error('Error in safe callback:', error)
      onError?.(error as Error)
      return undefined
    }
  }
}
