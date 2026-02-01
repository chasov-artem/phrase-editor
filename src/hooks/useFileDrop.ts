import { useState, useCallback, DragEvent } from 'react'
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '../utils/constants'

interface UseFileDropOptions {
  onFileDrop: (file: File) => void
  onError?: (error: string) => void
}

export const useFileDrop = ({ onFileDrop, onError }: UseFileDropOptions) => {
  const [isDragging, setIsDragging] = useState(false)

  const validateFile = useCallback(
    (file: File): boolean => {
      // Валідація типу файлу
      const isValidType =
        ALLOWED_FILE_TYPES.some(
          (type) => file.type === type || file.name.toLowerCase().endsWith(type),
        ) || file.type === '' // Деякі браузери не визначають тип для .txt

      if (!isValidType && !file.name.toLowerCase().endsWith('.txt')) {
        onError?.('Only .txt files are supported')
        return false
      }

      // Валідація розміру файлу
      if (file.size > MAX_FILE_SIZE) {
        onError?.(
          `File is too large. Maximum size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`,
        )
        return false
      }

      return true
    },
    [onError],
  )

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onFileDrop(file)
        }
      }
    },
    [validateFile, onFileDrop],
  )

  return {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }
}
