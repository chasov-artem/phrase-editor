import React from 'react'
import type { OperationConfig } from '../../../types/operations'
import { OperationButton } from './OperationButton'

interface OperationGroupProps {
  title: string
  operations: OperationConfig[]
  onOperationClick: (id: OperationConfig['id']) => void
  isProcessing?: boolean
}

export const OperationGroup: React.FC<OperationGroupProps> = ({
  title,
  operations,
  onOperationClick,
  isProcessing = false,
}) => {
  const getGroupColor = (groupTitle: string) => {
    switch (groupTitle) {
      case 'Case':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
      case 'Symbols/Wrapping':
        return 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10'
      case 'Cleanup':
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
      case 'Sorting & Uniqueness':
        return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
      default:
        return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/10'
    }
  }

  const getTitleColor = (groupTitle: string) => {
    switch (groupTitle) {
      case 'Case':
        return 'text-blue-700 dark:text-blue-300'
      case 'Symbols/Wrapping':
        return 'text-purple-700 dark:text-purple-300'
      case 'Cleanup':
        return 'text-green-700 dark:text-green-300'
      case 'Sorting & Uniqueness':
        return 'text-orange-700 dark:text-orange-300'
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className={`rounded-xl border-2 ${getGroupColor(title)} p-5`}>
      <h3 className={`text-lg font-semibold mb-4 ${getTitleColor(title)}`}>
        {title}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {operations.map((operation) => (
          <OperationButton
            key={operation.id}
            id={operation.id}
            title={operation.title}
            description={operation.description}
            group={title}
            onClick={onOperationClick}
            isProcessing={isProcessing}
          />
        ))}
      </div>
    </div>
  )
}
