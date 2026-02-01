import { useEffect } from 'react'
import { useStore } from '@store/useStore'
import { useToastContext } from '@providers/ToastProvider'

export const useKeyboardShortcuts = () => {
  const undo = useStore((state) => state.undo)
  const redo = useStore((state) => state.redo)
  const canUndo = useStore((state) => state.canUndo)
  const canRedo = useStore((state) => state.canRedo)
  const copyToClipboard = useStore((state) => state.copyToClipboard)
  const isProcessing = useStore((state) => state.isProcessing)
  const { success, error } = useToastContext()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ігноруємо якщо користувач вводить текст в input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Дозволяємо Ctrl+C/V/A/X в полях вводу
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'a', 'x'].includes(e.key.toLowerCase())) {
          return
        }
        // Дозволяємо Ctrl+Z/Y тільки якщо не в полі вводу (для undo/redo операцій)
        if ((e.ctrlKey || e.metaKey) && ['z', 'y'].includes(e.key.toLowerCase())) {
          // Якщо не Shift+Z (redo), то дозволяємо
          if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && !e.shiftKey)) {
            // Продовжуємо обробку
          } else {
            return
          }
        } else {
          return
        }
      }

      // Undo: Ctrl+Z або Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo() && !isProcessing) {
          undo()
        }
        return
      }

      // Redo: Ctrl+Y або Cmd+Y або Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')
      ) {
        e.preventDefault()
        if (canRedo() && !isProcessing) {
          redo()
        }
        return
      }

      // Copy: Ctrl+C або Cmd+C (тільки якщо текст виділено або є текст для копіювання)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey) {
        const selection = window.getSelection()?.toString()
        // Якщо є виділений текст, дозволяємо стандартне копіювання
        if (selection && selection.length > 0) {
          return
        }
        // Інакше копіюємо весь текст з редактора (якщо немає виділення)
        e.preventDefault()
        const state = useStore.getState()
        const textToCopy = state.processedText || state.rawText
        if (textToCopy) {
          copyToClipboard()
            .then(() => {
              success('Text copied to clipboard', 2000)
            })
            .catch(() => {
              error('Error copying text', 3000)
            })
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [undo, redo, canUndo, canRedo, copyToClipboard, isProcessing, success, error])
}
