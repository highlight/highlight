import { Box } from '@highlight-run/ui/components'
import { useCallback, useEffect, useMemo, useState, type JSX } from 'react'

import {
	RelatedResource,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'
import { Panel } from '@/components/RelatedResources/Panel'
import { ResourceTable } from '@/components/RelatedResources/ResourceTable'
import { SearchContext } from '@/components/Search/SearchContext'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import { parseSearch } from '@/components/Search/utils'
import { ProductType, SortDirection } from '@/graph/generated/schemas'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { ErrorObjectColumnRenderers } from '@/pages/ErrorsV2/CustomColumns/renderers'
import { SessionColumnRenderers } from '@/pages/Sessions/CustomColumns/renderers'
import { useGetErrorObjectsPaginated } from '@/pages/Sessions/useGetErrorObjectsPaginated'
import { useGetSessionsPaginated } from '@/pages/Sessions/useGetSessionsPaginated'
import { TraceColumnRenderers } from '@/pages/Traces/CustomColumns/renderers'
import { useGetTraces } from '@/pages/Traces/useGetTraces'
import { useGetEventsPaginated } from '@/pages/Sessions/useGetEventsPaginated'
import { DateTimeParam, encodeQueryParams, StringParam } from 'use-query-params'
import { stringify } from 'query-string'

export const RelatedResourceList: React.FC<{
	resource: RelatedResource & {
		type: 'traces' | 'sessions' | 'errors' | 'events'
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

	const [sortDirection, setSortDirection] = useState<SortDirection>()
	const [sortColumn, setSortColumn] = useState<string>()

	const handleSort = useCallback(
		(column: string, direction?: SortDirection | null) => {
			if (
				column === sortColumn &&
				(direction === null || sortDirection === SortDirection.Asc)
			) {
				setSortColumn(undefined)
				setSortDirection(undefined)
			} else {
				const nextDirection =
					direction ??
					(column === sortColumn &&
					sortDirection === SortDirection.Desc
						? SortDirection.Asc
						: SortDirection.Desc)

				setSortColumn(column)
				setSortDirection(nextDirection)
			}
		},
		[setSortColumn, setSortDirection, sortColumn, sortDirection],
	)

	const path = useMemo(() => {
		const encodedQuery = encodeQueryParams(
			{
				query: StringParam,
				start_date: DateTimeParam,
				end_date: DateTimeParam,
			},
			{
				query: query,
				start_date: startDate,
				end_date: endDate,
			},
		)
		const search = stringify(encodedQuery)

		switch (resource.type) {
			case 'traces':
				return `/${projectId}/traces?${search}`
			case 'sessions':
				return `/${projectId}/sessions?${search}`
			case 'errors':
				return `/${projectId}/errors?${search}`
			default:
				return ''
		}
	}, [endDate, projectId, query, resource.type, startDate])

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
		sortColumn,
		sortDirection,
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

	const {
		sessions: eventSessions,
		loading: eventsLoading,
		error: eventsError,
		loadingAfter: eventsLoadingAfter,
		fetchMoreForward: moreEvents,
	} = useGetEventsPaginated({
		query,
		projectId: projectId!,
		startDate,
		endDate,
		skip: resource.type !== 'events',
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
						case 'events':
							moreEvents()
							break
					}
				}
			}
		},
		[moreErrorObjects, moreSessions, moreTraces, moreEvents, resource.type],
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
					bodyHeight="calc(100% - 64px)"
					resources={errorObjects}
					columnRenderers={ErrorObjectColumnRenderers}
				/>
			)
			break
		case 'sessions':
			productType = ProductType.Sessions
			innerTable = (
				<ResourceTable
					resourceType={resource.type}
					query={query}
					queryParts={queryParts}
					loading={sessionsLoading}
					error={sessionsError}
					loadingAfter={sessionsLoadingAfter}
					fetchMoreWhenScrolled={fetchMoreWhenScrolled}
					bodyHeight="calc(100% - 64px)"
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
					columnRenderers={TraceColumnRenderers}
					query={query}
					queryParts={queryParts}
					loading={tracesLoading}
					error={tracesError}
					loadingAfter={tracesLoadingAfter}
					fetchMoreWhenScrolled={fetchMoreWhenScrolled}
					bodyHeight="calc(100% - 64px)"
					resources={traceEdges}
					handleSort={handleSort}
					sortDirection={sortDirection}
					sortColumn={sortColumn}
				/>
			)
			break
		case 'events':
			productType = ProductType.Events
			innerTable = (
				<ResourceTable
					// show sessions for events
					resourceType="sessions"
					query={query}
					queryParts={queryParts}
					loading={eventsLoading}
					error={eventsError}
					loadingAfter={eventsLoadingAfter}
					fetchMoreWhenScrolled={fetchMoreWhenScrolled}
					bodyHeight="calc(100% - 64px)"
					resources={eventSessions}
					columnRenderers={SessionColumnRenderers}
				/>
			)
	}

	useEffect(() => {
		setQuery(resource.query)
	}, [resource.query])

	return (
		<SearchContext initialQuery={query} onSubmit={handleSubmit} disabled>
			<Panel.Header path={path}>
				{!!path && <Panel.HeaderCopyLinkButton path={path} />}
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
						hideCreateAlert
						productType={productType}
					/>
					<Box height="full">{innerTable}</Box>
				</Box>
			</Box>
		</SearchContext>
	)
}
