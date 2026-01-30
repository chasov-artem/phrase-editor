import React, { useEffect, useRef } from 'react'

interface TextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder = 'Вставте фрази, кожна з нового рядка...',
  disabled = false,
  className = '',
  autoFocus = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      className={`
        w-full min-h-[300px] p-4
        bg-white dark:bg-gray-800
        border border-gray-300 dark:border-gray-600
        rounded-lg
        font-mono text-sm
        resize-none
        focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      rows={10}
    />
  )
}
