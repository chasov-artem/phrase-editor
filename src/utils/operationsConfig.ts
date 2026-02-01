import type { OperationConfig } from '../types/operations'

export const operationsConfig: OperationConfig[] = [
  // Case
  {
    id: 'uppercase',
    title: 'All uppercase',
    description: 'Convert all characters to uppercase: сок ЦІНА → СОК ЦІНА',
    group: 'Case',
  },
  {
    id: 'lowercase',
    title: 'All lowercase',
    description: 'Convert all characters to lowercase: сок ЦІНА → сок ціна',
    group: 'Case',
  },
  {
    id: 'title_case',
    title: 'Title case',
    description: 'Capitalize the first letter of every word: сок ціна → Сок Ціна',
    group: 'Case',
  },
  {
    id: 'sentence_case',
    title: 'Sentence case',
    description: 'Capitalize only the first word: сок ЦІНА → Сок ціна',
    group: 'Case',
  },

  // Symbols/Wrapping
  {
    id: 'add_plus_prefix',
    title: 'Add + prefix',
    description: 'Add a + before each word: сок ЦІНА → +сок +ЦІНА',
    group: 'Symbols/Wrapping',
  },
  {
    id: 'remove_plus_prefix',
    title: 'Remove + prefix',
    description: 'Strip leading + signs from words: +сок +ЦІНА → сок ЦІНА',
    group: 'Symbols/Wrapping',
  },
  {
    id: 'add_quotes',
    title: 'Wrap with quotes',
    description: 'Wrap each line in quotes: сок ЦІНА → "сок ЦІНА"',
    group: 'Symbols/Wrapping',
  },
  {
    id: 'add_brackets',
    title: 'Wrap with brackets',
    description: 'Wrap each line in square brackets: сок ЦІНА → [сок ЦІНА]',
    group: 'Symbols/Wrapping',
  },
  {
    id: 'add_dash_prefix',
    title: 'Add dash prefix',
    description: 'Prefix lines with a dash: сок ЦІНА → -сок ЦІНА',
    group: 'Symbols/Wrapping',
  },
  {
    id: 'add_dash_brackets_prefix',
    title: 'Add -[...] wrapper',
    description: 'Wrap lines like -[text]: сок ЦІНА → -[сок ЦІНА]',
    group: 'Symbols/Wrapping',
  },
  {
    id: 'add_dash_quotes_prefix',
    title: 'Add -"..." wrapper',
    description: 'Wrap lines like -"text": сок ЦІНА → -"сок ЦІНА"',
    group: 'Symbols/Wrapping',
  },

  // Cleanup
  {
    id: 'trim_spaces',
    title: 'Trim spaces',
    description: 'Remove extra spaces at the start, end, and between words',
    group: 'Cleanup',
  },
  {
    id: 'remove_tabs',
    title: 'Remove tabs',
    description: 'Replace all tabs (\\t) with spaces',
    group: 'Cleanup',
  },
  {
    id: 'remove_after_dash',
    title: 'Remove text after "-"',
    description: 'Remove everything after " -": сок ціна - cherry → сок ціна',
    group: 'Cleanup',
  },
  {
    id: 'replace_spaces_with_underscore',
    title: 'Spaces → underscore',
    description: 'Change every space into an underscore',
    group: 'Cleanup',
  },
  {
    id: 'remove_special_chars',
    title: 'Remove special chars',
    description:
      'Strip special symbols: ()\\~!@#$%^&*_=+[]{}|;\'":,./<>?`',
    group: 'Cleanup',
  },
  {
    id: 'replace_special_chars_with_spaces',
    title: 'Special chars → spaces',
    description: 'Replace special symbols with spaces',
    group: 'Cleanup',
  },

  // Sorting & Uniqueness
  {
    id: 'sort_asc',
    title: 'Sort A → Z',
    description: 'Sort lines alphabetically (ascending) - Latin alphabet',
    group: 'Sorting & Uniqueness',
  },
  {
    id: 'sort_desc',
    title: 'Sort Z → A',
    description: 'Sort lines alphabetically (descending) - Latin alphabet',
    group: 'Sorting & Uniqueness',
  },
  {
    id: 'sort_asc_cyrillic',
    title: 'Sort А → Я',
    description: 'Sort lines alphabetically (ascending) - Cyrillic alphabet',
    group: 'Sorting & Uniqueness',
  },
  {
    id: 'sort_desc_cyrillic',
    title: 'Sort Я → А',
    description: 'Sort lines alphabetically (descending) - Cyrillic alphabet',
    group: 'Sorting & Uniqueness',
  },
  {
    id: 'remove_duplicates',
    title: 'Remove duplicates',
    description: 'Keep only unique lines',
    group: 'Sorting & Uniqueness',
  },
  {
    id: 'remove_empty_lines',
    title: 'Remove empty lines',
    description: 'Remove blank lines',
    group: 'Sorting & Uniqueness',
  },
]
