import React, { createContext, useContext, useState, useCallback } from 'react'

export interface FilterCondition {
  key: string
  value: string
  operator: 'equals' | 'contains' | 'not_equals' | 'not_contains'
}

interface SearchContextType {
  filters: FilterCondition[]
  addFilter: (filter: FilterCondition) => void
  removeFilter: (index: number) => void
  clearFilters: () => void
  updateFilter: (index: number, filter: FilterCondition) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filters, setFilters] = useState<FilterCondition[]>([])

  const addFilter = useCallback((filter: FilterCondition) => {
    setFilters((prev) => [...prev, filter])
  }, [])

  const removeFilter = useCallback((index: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters([])
  }, [])

  const updateFilter = useCallback((index: number, filter: FilterCondition) => {
    setFilters((prev) =>
      prev.map((f, i) => (i === index ? filter : f))
    )
  }, [])

  return (
    <SearchContext.Provider
      value={{
        filters,
        addFilter,
        removeFilter,
        clearFilters,
        updateFilter,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export const useSearchContext = () => {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearchContext must be used within SearchProvider')
  }
  return context
}
