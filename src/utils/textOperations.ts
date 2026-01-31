import type { TextOperationType } from '../types/operations'

export interface LineStats {
  total: number
  nonEmpty: number
  empty: number
}

const splitIntoLines = (text: string) => text.split(/\r?\n/)

export const normalizeText = (text: string) =>
  splitIntoLines(text)
    .map((line) => line.replace(/\t/g, '  ').replace(/[ \t]+$/, ''))
    .join('\n')
    .trimEnd()

export const getLineCount = (text: string) => {
  if (!text) {
    return 0
  }

  return splitIntoLines(text).length
}

export const getLineStats = (text: string): LineStats => {
  const lines = splitIntoLines(text)

  const nonEmpty = lines.filter((line) => line.trim().length > 0).length

  return {
    total: lines.length,
    nonEmpty,
    empty: lines.length - nonEmpty,
  }
}

export function applyTextOperation(
  text: string,
  operation: TextOperationType,
): string {
  const lines = splitIntoLines(text)

  switch (operation) {
    case 'sort_asc':
      return [...lines].sort((a, b) => a.localeCompare(b)).join('\n')
    case 'sort_desc':
      return [...lines].sort((a, b) => b.localeCompare(a)).join('\n')
    case 'remove_duplicates': {
      const seen = new Set<string>()
      return lines
        .filter((line) => {
          const trimmed = line.trim()
          if (seen.has(trimmed)) {
            return false
          }
          seen.add(trimmed)
          return true
        })
        .join('\n')
    }
    case 'remove_empty_lines':
      return lines.filter((line) => line.trim().length > 0).join('\n')
    default: {
      const processedLines = lines.map((line) => {
        switch (operation) {
          case 'uppercase':
            return line.toUpperCase()
          case 'lowercase':
            return line.toLowerCase()
          case 'title_case':
            return line
              .toLowerCase()
              .split(' ')
              .map((word) =>
                word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : '',
              )
              .join(' ')
          case 'sentence_case': {
            const trimmed = line.trim()
            if (!trimmed) return ''
            return `${trimmed.charAt(0).toUpperCase()}${trimmed
              .slice(1)
              .toLowerCase()}`
          }
          case 'add_plus_prefix':
            return line
              .split(' ')
              .map((word) => word.trim())
              .filter((word) => word.length > 0)
              .map((word) => `+${word}`)
              .join(' ')
          case 'remove_plus_prefix':
            return line.replace(/^\+/, '').trim()
          case 'add_quotes':
            return `"${line}"`
          case 'add_brackets':
            return `[${line}]`
          case 'add_dash_prefix':
            return `-${line}`
          case 'trim_spaces':
            return line.trim().replace(/\s+/g, ' ')
          case 'remove_tabs':
            return line.replace(/\t/g, '')
          case 'replace_spaces_with_underscore':
            return line.replace(/\s+/g, '_')
          case 'remove_special_chars':
            // eslint-disable-next-line no-useless-escape
            return line.replace(/[()\\~!@#$%^&*_=+\[\]{}|;':",.<>?`-]/g, '')
          case 'replace_special_chars_with_spaces':
            // eslint-disable-next-line no-useless-escape
            return line.replace(/[()\\~!@#$%^&*_=+\[\]{}|;':",.<>?`-]/g, ' ')
          default:
            return line
        }
      })

      return processedLines.join('\n')
    }
  }
}

export function measureOperation(operation: () => string) {
  const startTime = performance.now()
  const result = operation()
  const executionTime = performance.now() - startTime

  return { result, executionTime }
}
