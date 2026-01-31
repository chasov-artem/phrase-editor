import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@store/useStore'
import { normalizeText } from '@utils/textOperations'

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

  const handleCopy = useCallback(async () => {
    await copyToClipboard()
  }, [copyToClipboard])

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
