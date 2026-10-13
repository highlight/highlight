import React from 'react'
import { Button } from '@highlight-run/ui/Button'
import { Input } from '@highlight-run/ui/Input'
import { Select } from '@highlight-run/ui/Select'
import { useSearchContext } from '@/contexts/SearchContext'
import { X } from 'lucide-react'

export const FilterBar: React.FC = () => {
  const { filters, removeFilter, clearFilters } = useSearchContext()

  if (filters.length === 0) return null

  return (
    <div className="filter-bar bg-gray-50 border-b border-gray-200 p-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Active Filters:</span>
        {filters.map((filter, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded px-3 py-1"
          >
            <span className="text-sm">
              <span className="font-medium">{filter.key}</span>
              <span className="text-gray-500 mx-1">{filter.operator}</span>
              <span className="text-gray-700">{filter.value}</span>
            </span>
            <button
              onClick={() => removeFilter(index)}
              className="text-gray-400 hover:text-gray-600"
              title="Remove filter"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {filters.length > 0 && (
          <Button
            size="small"
            variant="secondary"
            onClick={clearFilters}
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  )
}
