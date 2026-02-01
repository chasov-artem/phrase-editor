export type TextOperationType =
  | 'uppercase'
  | 'lowercase'
  | 'title_case'
  | 'sentence_case'
  | 'add_plus_prefix'
  | 'remove_plus_prefix'
  | 'add_quotes'
  | 'add_brackets'
  | 'add_dash_prefix'
  | 'add_dash_brackets_prefix'
  | 'add_dash_quotes_prefix'
  | 'trim_spaces'
  | 'remove_tabs'
  | 'remove_after_dash'
  | 'replace_spaces_with_underscore'
  | 'remove_special_chars'
  | 'replace_special_chars_with_spaces'
  | 'sort_asc'
  | 'sort_desc'
  | 'sort_asc_cyrillic'
  | 'sort_desc_cyrillic'
  | 'remove_duplicates'
  | 'remove_empty_lines'
  | 'number_lines'
  | 'number_lines_padded'
  | 'join_lines'
  | 'split_lines'

export type OperationIdentifier = TextOperationType | 'search_replace'

export interface OperationMetrics {
  operation: OperationIdentifier
  executionTime: number
  linesProcessed: number
  linesChanged: number
}

export interface TextMetrics {
  totalLines: number
  nonEmptyLines: number
  emptyLines: number
  totalCharacters: number
  wordCount: number
}

export interface OperationConfig {
  id: TextOperationType
  title: string
  description: string
  group:
    | 'Case'
    | 'Symbols/Wrapping'
    | 'Cleanup'
    | 'Sorting & Uniqueness'
  icon?: string
  hotkey?: string
}
