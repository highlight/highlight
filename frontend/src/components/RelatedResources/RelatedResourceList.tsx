import { Box } from '@highlight-run/ui/components'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
	RelatedResource,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'
import { Panel } from '@/components/RelatedResources/Panel'
import { ResourceTable } from '@/components/RelatedResources/ResourceTable'
import { SearchContext } from '@/components/Search/SearchContext'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import { parseSearch } from '@/components/Search/utils'
import { ProductType } from '@/graph/generated/schemas'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { DEFAULT_ERROR_OBJECT_COLUMNS } from '@/pages/ErrorsV2/CustomColumns/columns'
import { ErrorObjectColumnRenderers } from '@/pages/ErrorsV2/CustomColumns/renderers'
import { DEFAULT_SESSION_COLUMNS } from '@/pages/Sessions/CustomColumns/columns'
import { SessionColumnRenderers } from '@/pages/Sessions/CustomColumns/renderers'
import { useGetErrorObjectsPaginated } from '@/pages/Sessions/useGetErrorObjectsPaginated'
import { useGetSessionsPaginated } from '@/pages/Sessions/useGetSessionsPaginated'
import { DEFAULT_TRACE_COLUMNS } from '@/pages/Traces/CustomColumns/columns'
import { TraceColumnRenderers } from '@/pages/Traces/CustomColumns/renderers'
import { useGetTraces } from '@/pages/Traces/useGetTraces'

export const RelatedResourceList: React.FC<{
	resource: RelatedResource & {
		type: 'traces' | 'sessions' | 'errors'
	}
}> = ({ resource }) => {
	const { set } = useRelatedResource()
	const [query, setQuery] = useState(resource.query ?? '')
	const { queryParts } = parseSearch(query)
	const handleSubmit = (query: string) => set({ ...resource, query })
	const { projectId } = useNumericProjectId()

	/* eslint-disable react-hooks/exhaustive-deps */
	const startDate = useMemo(() => new Date(resource.startDate), [])
	const endDate = useMemo(() => new Date(resource.endDate), [])
	/* eslint-enable react-hooks/exhaustive-deps */

	const {
		traceEdges,
		loading: tracesLoading,
		error: tracesError,
		loadingAfter: tracesLoadingAfter,
		fetchMoreForward: moreTraces,
	} = useGetTraces({
		query,
		projectId: projectId,
		traceCursor: undefined,
		startDate,
		endDate,
		skipPolling: true,
		skip: resource.type !== 'traces',
	})

	const {
		sessions,
		loading: sessionsLoading,
		error: sessionsError,
		loadingAfter: sessionsLoadingAfter,
		fetchMoreForward: moreSessions,
	} = useGetSessionsPaginated({
		query,
		projectId: projectId!,
		startDate,
		endDate,
		skip: resource.type !== 'sessions',
	})

	const {
		errorObjects,
		loading: errorObjectsLoading,
		error: errorObjectsError,
		loadingAfter: errorObjectsLoadingAfter,
		fetchMoreForward: moreErrorObjects,
	} = useGetErrorObjectsPaginated({
		query,
		projectId: projectId!,
		startDate,
		endDate,
		skip: resource.type !== 'errors',
	})

	const fetchMoreWhenScrolled = useCallback(
		(containerRefElement?: HTMLDivElement | null) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } =
					containerRefElement

				if (scrollHeight - scrollTop - clientHeight < 100) {
					switch (resource.type) {
						case 'errors':
							moreErrorObjects()
							break
						case 'sessions':
							moreSessions()
							break
						case 'traces':
							moreTraces()
							break
					}
				}
			}
		},
		[moreErrorObjects, moreSessions, moreTraces, resource.type],
	)

	let innerTable: JSX.Element
	let productType: ProductType
	switch (resource.type) {
		case 'errors':
			productType = ProductType.Errors
			innerTable = (
				<ResourceTable
					resourceType={resource.type}
					query={query}
					queryParts={queryParts}
					loading={errorObjectsLoading}
					error={errorObjectsError}
					loadingAfter={errorObjectsLoadingAfter}
					fetchMoreWhenScrolled={fetchMoreWhenScrolled}
					bodyHeight="calc(100% - 56px)"
					resources={errorObjects}
					selectedColumns={DEFAULT_ERROR_OBJECT_COLUMNS}
					columnRenderers={ErrorObjectColumnRenderers}
				/>
			)
			break
		case 'sessions':
			productType = ProductType.Sessions
			innerTable = (
				<ResourceTable
					resourceType={resource.type}
					selectedColumns={DEFAULT_SESSION_COLUMNS}
					query={query}
					queryParts={queryParts}
					loading={sessionsLoading}
					error={sessionsError}
					loadingAfter={sessionsLoadingAfter}
					fetchMoreWhenScrolled={fetchMoreWhenScrolled}
					bodyHeight="calc(100% - 56px)"
					resources={sessions}
					columnRenderers={SessionColumnRenderers}
				/>
			)
			break
		case 'traces':
			productType = ProductType.Traces
			innerTable = (
				<ResourceTable
					resourceType={resource.type}
					selectedColumns={DEFAULT_TRACE_COLUMNS}
					columnRenderers={TraceColumnRenderers}
					query={query}
					queryParts={queryParts}
					loading={tracesLoading}
					error={tracesError}
					loadingAfter={tracesLoadingAfter}
					fetchMoreWhenScrolled={fetchMoreWhenScrolled}
					bodyHeight="calc(100% - 56px)"
					resources={traceEdges}
				/>
			)
			break
	}

	useEffect(() => {
		setQuery(resource.query)
	}, [resource.query])

	return (
		<SearchContext initialQuery={query} onSubmit={handleSubmit} disabled>
			<Panel.Header>
				<Panel.HeaderDivider />
			</Panel.Header>

			<Box
				flex="stretch"
				justifyContent="stretch"
				display="flex"
				overflow="hidden"
			>
				<Box flexDirection="column" display="flex" flexGrow={1}>
					<SearchForm
						startDate={startDate}
						endDate={endDate}
						onDatesChange={() => null}
						presets={[]}
						minDate={startDate}
						timeMode="permalink"
						hideDatePicker
						hideCreateAlert
						productType={productType}
					/>
					<Box height="full">{innerTable}</Box>
				</Box>
			</Box>
		</SearchContext>
	)
}
