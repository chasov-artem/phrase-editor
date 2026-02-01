export const APP_NAME = 'Phrase Editor'
export const SUPPORTED_OPERATIONS = [
  'Count characters',
  'Remove spaces',
  'Sort alphabetically',
  'Make unique',
] as const

// File upload constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = ['.txt', 'text/plain']
export const MAX_TEXT_SIZE = 10 * 1024 * 1024 // 10MB
