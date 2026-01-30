import type { SUPPORTED_OPERATIONS } from '@utils/constants'

export type ThemeMode = 'light' | 'dark'
export type OperationName = (typeof SUPPORTED_OPERATIONS)[number]
