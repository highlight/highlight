import { Box, Callout, Text } from '@highlight-run/ui/components'
import { stringify } from 'query-string'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { DateTimeParam, encodeQueryParams, StringParam } from 'use-query-params'
import useLocalStorage from '@rehooks/local-storage'

import { LinkButton } from '@/components/LinkButton'
import {
	RelatedLogs,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'
import { Panel } from '@/components/RelatedResources/Panel'
import { SearchContext } from '@/components/Search/SearchContext'
import { SearchForm } from '@/components/Search/SearchForm/SearchForm'
import { parseSearch } from '@/components/Search/utils'
import { ProductType } from '@/graph/generated/schemas'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { LogsTable } from '@/pages/LogsPage/LogsTable/LogsTable'
import { useGetLogs } from '@/pages/LogsPage/useGetLogs'
import { SerializedColumn } from '@/components/CustomColumnPopover'
import { DEFAULT_LOG_COLUMNS } from '@/pages/LogsPage/LogsTable/CustomColumns/columns'

export const LogsPanel: React.FC<{ resource: RelatedLogs }> = ({
	resource,
}) => {
	const { set } = useRelatedResource()
	const [query, setQuery] = useState(resource.query ?? '')
	const { queryParts } = parseSearch(query)
	const handleSubmit = (query: string) => set({ ...resource, query })
	const { projectId } = useNumericProjectId()

	const [selectedColumns, setSelectedColumns] = useLocalStorage<
		SerializedColumn[]
	>(`highlight-logs-related-table-columns`, DEFAULT_LOG_COLUMNS)

	/* eslint-disable react-hooks/exhaustive-deps */
	const startDate = useMemo(() => new Date(resource.startDate), [])
	const endDate = useMemo(() => new Date(resource.endDate), [])
	/* eslint-enable react-hooks/exhaustive-deps */

	const { logEdges, loading, error, loadingAfter, fetchMoreForward } =
		useGetLogs({
			query,
			project_id: projectId,
			logCursor: resource.logCursor,
			startDate,
			endDate,
			disablePolling: true,
		})

	const fetchMoreWhenScrolled = useCallback(
		(containerRefElement?: HTMLDivElement | null) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } =
					containerRefElement

				if (scrollHeight - scrollTop - clientHeight < 100) {
					fetchMoreForward()
				}
			}
		},
		[fetchMoreForward],
	)

	// Making this a noop since there shouldn't be additional logs to fetch
	const refetch = () => {}

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

		return resource.logCursor
			? `/${projectId}/logs/${resource.logCursor}?${search}`
			: `/${projectId}/logs?${search}`

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, query, resource.logCursor])

	useEffect(() => {
		setQuery(resource.query)
	}, [resource.query])

	return (
		<SearchContext initialQuery={query} onSubmit={handleSubmit} disabled>
			<Panel.Header path={path}>
				<Panel.HeaderCopyLinkButton path={path} />
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
						productType={ProductType.Logs}
					/>
					<Box height="full">
						{!loading && logEdges.length === 0 ? (
							<Box
								display="flex"
								alignItems="center"
								height="full"
							>
								<NoLogsFound />
							</Box>
						) : (
							<LogsTable
								query={query}
								queryParts={queryParts}
								logEdges={logEdges}
								loading={loading}
								error={error}
								refetch={refetch}
								loadingAfter={loadingAfter}
								selectedCursor={undefined}
								fetchMoreWhenScrolled={fetchMoreWhenScrolled}
								selectedColumns={selectedColumns}
								setSelectedColumns={setSelectedColumns}
								bodyHeight="calc(100% - 64px)"
							/>
						)}
					</Box>
				</Box>
			</Box>
		</SearchContext>
	)
}

const NoLogsFound = () => {
	return (
		<Box mx="auto" style={{ maxWidth: 300 }}>
			<Callout title="No associated logs found">
				<Box
					display="flex"
					flexDirection="column"
					gap="16"
					alignItems="flex-start"
				>
					<Text color="moderate">
						To match backend logs to traces, make sure to enable
						"full stack mapping."
					</Text>

					<LinkButton
						trackingId="logs-empty-state_specification-docs"
						kind="secondary"
						to="https://www.highlight.io/docs/getting-started/frontend-backend-mapping"
						target="_blank"
					>
						Learn more
					</LinkButton>
				</Box>
			</Callout>
		</Box>
	)
}
