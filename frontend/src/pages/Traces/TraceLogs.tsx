import {
	Box,
	Callout,
	IconSolidExternalLink,
	Text,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { stringify } from 'query-string'
import React, { useEffect, useState } from 'react'
import { DateTimeParam, encodeQueryParams, StringParam } from 'use-query-params'

import { LinkButton } from '@/components/LinkButton'
import { SearchContext } from '@/components/Search/SearchContext'
import {
	SearchForm,
	SearchFormProps,
} from '@/components/Search/SearchForm/SearchForm'
import { DEFAULT_OPERATOR } from '@/components/Search/SearchForm/utils'
import { ProductType } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'
import { LogsTable } from '@/pages/LogsPage/LogsTable/LogsTable'
import { useGetLogs } from '@/pages/LogsPage/useGetLogs'
import { useTrace } from '@/pages/Traces/TraceProvider'
import analytics from '@/util/analytics'

const startDate = moment().subtract(30, 'days').toDate()
const endDate = moment().toDate()

export const TraceLogs: React.FC = () => {
	const { traceId } = useTrace()
	const { projectId } = useProjectId()
	const [query, setQuery] = useState('')

	const { logEdges, loading, error, loadingAfter, fetchMoreForward } =
		useGetLogs({
			query,
			project_id: projectId,
			logCursor: undefined,
			startDate,
			endDate,
			disablePolling: true,
		})

	const fetchMoreWhenScrolled = React.useCallback(
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

	useEffect(() => {
		setQuery(traceId ? `trace_id${DEFAULT_OPERATOR}${traceId}` : '')
		analytics.track('trace_logs_view')
	}, [traceId])

	return (
		<SearchContext initialQuery={query} onSubmit={setQuery} disabled>
			<Box display="flex" overflow="hidden">
				<Box
					borderRadius="6"
					flexDirection="column"
					display="flex"
					flexGrow={1}
					border="dividerWeak"
					shadow="medium"
				>
					<SearchForm
						startDate={startDate}
						endDate={endDate}
						onDatesChange={() => null}
						presets={[]}
						minDate={startDate}
						timeMode="permalink"
						actions={SearchFormActions}
						hideDatePicker
						hideCreateAlert
						productType={ProductType.Logs}
					/>
					<Box height="full">
						{(!loading && logEdges.length === 0) || !traceId ? (
							<Box style={{ height: 400 }}>
								<Box
									display="flex"
									flexGrow={1}
									alignItems="center"
									justifyContent="center"
									height="full"
								>
									<NoLogsFound />
								</Box>
							</Box>
						) : (
							<LogsTable
								logEdges={logEdges}
								loading={loading}
								error={error}
								refetch={refetch}
								loadingAfter={loadingAfter}
								selectedCursor={undefined}
								fetchMoreWhenScrolled={fetchMoreWhenScrolled}
								bodyHeight="400px"
							/>
						)}
					</Box>
				</Box>
			</Box>
		</SearchContext>
	)
}

export const NoLogsFound = () => {
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

const SearchFormActions: SearchFormProps['actions'] = ({
	query,
	startDate,
	endDate,
}) => {
	const { projectId } = useProjectId()
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

	return (
		<LinkButton
			kind="secondary"
			trackingId="view-in-log-viewer"
			to={`/${projectId}/logs?${stringify(encodedQuery)}`}
			emphasis="medium"
			iconLeft={<IconSolidExternalLink />}
		>
			View in log viewer
		</LinkButton>
	)
}
