import React from 'react'
import { useParams } from 'react-router-dom'
import { TraceFlameGraph } from './TraceFlameGraph'
import { FilterBar } from '@/components/FilterBar'
import { useSearchContext } from '@/contexts/SearchContext'
import { useTraceData } from '@/hooks/useTraceData'

export const TraceDetail: React.FC = () => {
  const { traceId, projectId } = useParams<{
    traceId: string
    projectId: string
  }>()
  const { filters } = useSearchContext()
  const { spans, loading, error } = useTraceData(traceId, projectId)

  if (loading) return <div>Loading trace...</div>
  if (error) return <div>Error loading trace: {error}</div>

  const filteredSpans = spans.filter((span) => {
    return filters.every((filter) => {
      const spanAttrValue = span.attributes?.[filter.key]
      if (spanAttrValue === undefined) return false

      const value = String(spanAttrValue)
      switch (filter.operator) {
        case 'equals':
          return value === filter.value
        case 'contains':
          return value.includes(filter.value)
        case 'not_equals':
          return value !== filter.value
        case 'not_contains':
          return !value.includes(filter.value)
        default:
          return true
      }
    })
  })

  return (
    <div className="trace-detail">
      <FilterBar />
      <TraceFlameGraph spans={filteredSpans} />
    </div>
  )
}
