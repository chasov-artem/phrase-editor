import type { TextOperationType } from '../types/operations'

const perLineOperations: TextOperationType[] = [
  'uppercase',
  'lowercase',
  'title_case',
  'sentence_case',
  'add_plus_prefix',
  'remove_plus_prefix',
  'add_quotes',
  'add_brackets',
  'add_dash_prefix',
  'add_dash_brackets_prefix',
  'add_dash_quotes_prefix',
  'trim_spaces',
  'remove_tabs',
  'remove_after_dash',
  'replace_spaces_with_underscore',
  'remove_special_chars',
  'replace_special_chars_with_spaces',
]

export function applyAllTextOperations(): {
  [key in TextOperationType]: (text: string) => string
} {
  return {
    uppercase: (text) => text.toUpperCase(),
    lowercase: (text) => text.toLowerCase(),
    title_case: (text) =>
      text
        .toLowerCase()
        .split(' ')
        .map((word) =>
          word ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : '',
        )
        .join(' '),
    sentence_case: (text) =>
      text ? `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}` : '',
    add_plus_prefix: (text) =>
      text
        .split(' ')
        .map((word) => word.trim())
        .filter((word) => word.length > 0)
        .map((word) => `+${word}`)
        .join(' '),
    remove_plus_prefix: (text) => text.replace(/^\+\s*|\s*\+/g, ''),
    add_quotes: (text) => `"${text}"`,
    add_brackets: (text) => `[${text}]`,
    add_dash_prefix: (text) => `-${text}`,
    add_dash_brackets_prefix: (text) => `-[${text}]`,
    add_dash_quotes_prefix: (text) => `-"${text}"`,
    trim_spaces: (text) => text.trim().replace(/\s+/g, ' '),
    remove_tabs: (text) => text.replace(/\t/g, ' '),
    remove_after_dash: (text) => {
      const dashIndex = text.indexOf(' -')
      return dashIndex !== -1 ? text.substring(0, dashIndex) : text
    },
    replace_spaces_with_underscore: (text) => text.replace(/\s+/g, '_'),
    remove_special_chars: (text) =>
      text.replace(/[()\\~!@#$%^&*_=+\[\]{}|;':",./<>?`-]/g, ''),
    replace_special_chars_with_spaces: (text) =>
      text.replace(/[()\\~!@#$%^&*_=+\[\]{}|;':",./<>?`-]/g, ' '),
    sort_asc: (text) => {
      const lines = text.split('\n')
      const sorted = [...lines].sort((a, b) =>
        a.localeCompare(b, 'uk-UA', { sensitivity: 'base' }),
      )
      return sorted.join('\n')
    },
    sort_desc: (text) => {
      const lines = text.split('\n')
      const sorted = [...lines].sort((a, b) =>
        b.localeCompare(a, 'uk-UA', { sensitivity: 'base' }),
      )
      return sorted.join('\n')
    },
    remove_duplicates: (text) => {
      const lines = text.split('\n')
      const uniqueLines = Array.from(new Set(lines))
      return uniqueLines.join('\n')
    },
    remove_empty_lines: (text) =>
      text
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .join('\n'),
  }
}

export function applyOperationToText(
  text: string,
  operation: TextOperationType,
): string {
  const operations = applyAllTextOperations()
  const operationFn = operations[operation]

  if (!operationFn) {
    console.warn(`Operation ${operation} not found`)
    return text
  }

  if (perLineOperations.includes(operation)) {
    const lines = text.split('\n')
    const processedLines = lines.map((line) => operationFn(line))
    return processedLines.join('\n')
  }

  return operationFn(text)
}

export function searchAndReplace(
  text: string,
  search: string,
  replace: string,
  useRegex = false,
  caseSensitive = false,
): string {
  if (!search) {
    return text
  }

  const escapeValue = (value: string) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const lines = text.split('\n')
  const processedLines = lines.map((line) => {
    if (useRegex) {
      try {
        const flags = caseSensitive ? 'g' : 'gi'
        const regex = new RegExp(search, flags)
        return line.replace(regex, replace)
      } catch (error) {
        console.error('Invalid regex pattern:', error)
        return line
      }
    }

    if (caseSensitive) {
      return line.split(search).join(replace)
    }

    const regex = new RegExp(escapeValue(search), 'gi')
    return line.replace(regex, replace)
  })

  return processedLines.join('\n')
}

export function measureOperationExecution(
  operation: () => string,
): { result: string; executionTime: number } {
  const startTime = performance.now()
  const result = operation()
  const executionTime = performance.now() - startTime

  return { result, executionTime }
}
