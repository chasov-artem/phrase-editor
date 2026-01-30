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
  | 'trim_spaces'
  | 'remove_tabs'
  | 'replace_spaces_with_underscore'
  | 'remove_special_chars'
  | 'replace_special_chars_with_spaces'
  | 'sort_asc'
  | 'sort_desc'
  | 'remove_duplicates'
  | 'remove_empty_lines'

export interface OperationMetrics {
  operation: TextOperationType
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
