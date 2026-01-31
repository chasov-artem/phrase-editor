import { useState, useEffect, useCallback, useRef } from 'react'

interface WorkerMessage {
  id: string
  type: 'SUCCESS' | 'ERROR' | 'PROGRESS'
  payload: any
}

interface UseTextWorkerResult {
  execute: <T = any>(
    type: string,
    payload: Record<string, any>,
    onProgress?: (progress: number, processed: number) => void,
  ) => Promise<T>
  isBusy: boolean
  progress: number
  processedItems: number
  operationType?: string
}

export const useTextWorker = (): UseTextWorkerResult => {
  const [isBusy, setIsBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processedItems, setProcessedItems] = useState(0)
  const [operationType, setOperationType] = useState<string | undefined>()

  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/text.worker.ts', import.meta.url),
      { type: 'module' },
    )

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  const execute = useCallback(
    <T = any>(
      type: string,
      payload: Record<string, any>,
      onProgress?: (progress: number, processed: number) => void,
    ): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'))
          return
        }

        setIsBusy(true)
        setProgress(0)
        setProcessedItems(0)
        setOperationType(type)

        const messageId = Math.random().toString(36).substring(7)

        const handleMessage = (event: MessageEvent<WorkerMessage>) => {
          const { id, type: msgType, payload: msgPayload } = event.data

          if (id !== messageId) return

          switch (msgType) {
            case 'SUCCESS':
              workerRef.current?.removeEventListener('message', handleMessage)
              setIsBusy(false)
              setProgress(100)
              setProcessedItems(msgPayload.processed ?? 0)
              resolve(msgPayload.result)
              break

            case 'ERROR':
              workerRef.current?.removeEventListener('message', handleMessage)
              setIsBusy(false)
              reject(new Error(msgPayload.error))
              break

            case 'PROGRESS':
              setProgress(msgPayload.progress)
              setProcessedItems(msgPayload.processed ?? 0)
              if (onProgress) {
                onProgress(msgPayload.progress, msgPayload.processed)
              }
              break
          }
        }

        workerRef.current.addEventListener('message', handleMessage)
        workerRef.current.postMessage({
          id: messageId,
          type,
          payload,
        })
      })
    },
    [],
  )

  return {
    execute,
    isBusy,
    progress,
    processedItems,
    operationType,
  }
}
