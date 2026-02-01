import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@store/useStore'
import { normalizeText } from '@utils/textOperations'
import { useToastContext } from '@providers/ToastProvider'

export const useTextEditor = () => {
  const {
    rawText,
    processedText,
    setRawText,
    setProcessedText,
    clearAll,
    copyToClipboard,
  } = useStore()
  const lastOperationTimestamp = useStore(
    (state) => state.lastOperationTimestamp,
  )

  const [isResultVisible, setIsResultVisible] = useState(false)

  const handleTextChange = useCallback(
    (text: string) => {
      setRawText(text)
      setProcessedText(normalizeText(text))
    },
    [setRawText, setProcessedText],
  )

  const handleClear = useCallback(() => {
    clearAll()
    setIsResultVisible(false)
  }, [clearAll, setIsResultVisible])

  const { success, error } = useToastContext()

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard()
      success('Text copied to clipboard', 2000)
    } catch (err) {
      error('Error copying text', 3000)
    }
  }, [copyToClipboard, success, error])

  const toggleResultView = useCallback(() => {
    setIsResultVisible((prev) => !prev)
  }, [setIsResultVisible])

  useEffect(() => {
    if (lastOperationTimestamp > 0) {
      setIsResultVisible(true)
    }
  }, [lastOperationTimestamp])

  return {
    rawText,
    processedText,
    isResultVisible,
    handleTextChange,
    handleClear,
    handleCopy,
    toggleResultView,
  }
}
