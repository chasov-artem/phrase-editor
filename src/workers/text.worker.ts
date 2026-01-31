import { applyAllTextOperations, perLineOperations, searchAndReplace } from '../utils/textOperationsExtended'
import type { TextOperationType } from '../types/operations'

const operations = applyAllTextOperations()

type WorkerRequestType =
  | 'APPLY_OPERATION'
  | 'SEARCH_REPLACE'
  | 'SORT'
  | 'REMOVE_DUPLICATES'
  | 'ANALYZE_TEXT'

interface WorkerRequest {
  id: string
  type: WorkerRequestType
  payload: Record<string, any>
}

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data

  try {
    let result: string
    let processedCount = 0

    switch (type) {
      case 'APPLY_OPERATION': {
        const { text, operation } = payload as {
          text: string
          operation: TextOperationType
        }

        const operationFn = operations[operation]

        if (!operationFn) {
          throw new Error(`Операція ${operation} не знайдена`)
        }

        const isPerLine = perLineOperations.includes(operation)

        if (isPerLine) {
          const lines = text.split('\n')
          const batchSize = 1000
          const batches = Math.ceil(lines.length / batchSize)
          const processedLines: string[] = []

          for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
            const start = batchIndex * batchSize
            const end = Math.min(start + batchSize, lines.length)
            const batch = lines.slice(start, end)

            const processedBatch = batch.map((line) => operationFn(line))
            processedLines.push(...processedBatch)

            if (batches > 1) {
              self.postMessage({
                id,
                type: 'PROGRESS',
                payload: {
                  progress: Math.round(((batchIndex + 1) / batches) * 100),
                  processed: end,
                },
              })
            }
          }

          result = processedLines.join('\n')
        } else {
          result = operationFn(text)
        }

        processedCount = text.split('\n').length
        break
      }

      case 'SEARCH_REPLACE': {
        const {
          text: srText,
          search,
          replace,
          useRegex,
          caseSensitive,
        } = payload

        result = searchAndReplace(srText, search, replace, useRegex, caseSensitive)
        processedCount = srText.split('\n').length
        break
      }

      case 'SORT': {
        const { text: sortText, ascending, locale } = payload
        const linesToSort = sortText
          .split('\n')
          .filter((line: string) => line.trim().length > 0)

        linesToSort.sort((a: string, b: string) =>
          ascending
            ? a.localeCompare(b, locale || 'uk-UA', { sensitivity: 'base' })
            : b.localeCompare(a, locale || 'uk-UA', { sensitivity: 'base' }),
        )

        result = linesToSort.join('\n')
        processedCount = sortText.split('\n').length
        break
      }

      case 'REMOVE_DUPLICATES': {
        const { text: dupText } = payload
        const linesForDedup = dupText.split('\n')
        const seen = new Set<string>()
        const uniqueLines: string[] = []

        for (const line of linesForDedup) {
          if (!seen.has(line)) {
            seen.add(line)
            uniqueLines.push(line)
          }
        }

        result = uniqueLines.join('\n')
        processedCount = linesForDedup.length
        break
      }

      case 'ANALYZE_TEXT': {
        const { text: analyzeText } = payload
        const allLines = analyzeText.split('\n')
        const nonEmptyLines = allLines.filter(
          (line: string) => line.trim().length > 0,
        )

        result = JSON.stringify({
          totalLines: allLines.length,
          nonEmptyLines: nonEmptyLines.length,
          emptyLines: allLines.length - nonEmptyLines.length,
          totalCharacters: analyzeText.length,
          wordCount: nonEmptyLines.reduce((count: number, line: string) => {
            const words = line
              .trim()
              .split(/\s+/)
              .filter((word: string) => word.length > 0)

            return count + words.length
          }, 0),
        })
        processedCount = allLines.length
        break
      }

      default:
        throw new Error(`Невідома операція: ${type}`)
    }

    self.postMessage({
      id,
      type: 'SUCCESS',
      payload: {
        result,
        processed: processedCount,
      },
    })
  } catch (error) {
    self.postMessage({
      id,
      type: 'ERROR',
      payload: { error: (error as Error).message },
    })
  }
}

export {}
