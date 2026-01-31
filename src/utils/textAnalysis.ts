import type { TextMetrics } from '../types/operations'

export function analyzeText(text: string): TextMetrics {
  const lines = text.split('\n')
  const totalLines = lines.length
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0)
  const emptyLines = totalLines - nonEmptyLines.length

  const totalCharacters = text.length

  const wordCount = nonEmptyLines.reduce((count, line) => {
    return (
      count +
      line
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    )
  }, 0)

  return {
    totalLines,
    nonEmptyLines: nonEmptyLines.length,
    emptyLines,
    totalCharacters,
    wordCount,
  }
}

export function formatExecutionTime(ms: number | null): string {
  if (ms === null || Number.isNaN(ms)) return '—'
  if (ms <= 0) return '0мс'
  if (ms < 1000) return `${ms.toFixed(0)}мс`
  return `${(ms / 1000).toFixed(2)}с`
}

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function calculateTextDifference(
  original: string[],
  processed: string[],
): {
  added: number
  removed: number
  changed: number
} {
  const originalSet = new Set(original)
  const processedSet = new Set(processed)

  const added = processed.filter((line) => !originalSet.has(line)).length
  const removed = original.filter((line) => !processedSet.has(line)).length
  const changed = Math.max(added, removed)

  return { added, removed, changed }
}
