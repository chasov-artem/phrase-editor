/**
 * Виконує функцію з throttle
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): T {
  let inThrottle = false
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  } as T
}

/**
 * Виконує функцію з debounce
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): T {
  let timeout: ReturnType<typeof setTimeout>
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  } as T
}

/**
 * Батчить виклики для великих масивів
 */
export function batchProcess<T, R>(
  items: T[],
  processFn: (batch: T[]) => R[],
  batchSize: number = 1000,
): R[] {
  const results: R[] = []
  const batches = Math.ceil(items.length / batchSize)

  for (let i = 0; i < batches; i += 1) {
    const start = i * batchSize
    const end = Math.min(start + batchSize, items.length)
    const batch = items.slice(start, end)
    results.push(...processFn(batch))
  }

  return results
}

/**
 * Міряє час виконання та FPS
 */
export function measurePerformance(name: string, fn: () => void): number {
  const startTime = performance.now()
  fn()
  const endTime = performance.now()

  const executionTime = endTime - startTime
  console.log(`[Performance] ${name}: ${executionTime.toFixed(2)}ms`)

  return executionTime
}

/**
 * Перевіряє, чи потрібна віртуалізація
 */
export function needsVirtualization(itemCount: number): boolean {
  return itemCount > 500
}

/**
 * Обмежує кількість рядків для миттєвого відображення
 */
export function limitForRender(lines: string[], limit: number = 1000): string[] {
  if (lines.length <= limit) return lines

  return [
    ...lines.slice(0, limit),
    `\n... і ще ${lines.length - limit} рядків (показано ${limit})`,
  ]
}
