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
import {
	SearchForm,
	SearchFormProps,
} from '@/components/Search/SearchForm/SearchForm'
import {
	DEFAULT_OPERATOR,
	stringifySearchQuery,
} from '@/components/Search/SearchForm/utils'
import {
	useGetLogsKeysLazyQuery,
	useGetLogsKeyValuesLazyQuery,
} from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { LogsTable } from '@/pages/LogsPage/LogsTable/LogsTable'
import { useGetLogs } from '@/pages/LogsPage/useGetLogs'
import { useTrace } from '@/pages/Traces/TraceProvider'

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
		setQuery(
			traceId
				? stringifySearchQuery([
						{
							key: 'trace_id',
							operator: DEFAULT_OPERATOR,
							value: traceId,
							offsetStart: 0,
						},
				  ])
				: '',
		)
	}, [traceId])

	return (
		<>
			<Box
				flex="stretch"
				justifyContent="stretch"
				display="flex"
				overflow="hidden"
			>
				<Box
					borderRadius="6"
					flexDirection="column"
					display="flex"
					flexGrow={1}
					border="dividerWeak"
					shadow="medium"
				>
					<SearchForm
						initialQuery={query}
						onFormSubmit={setQuery}
						startDate={startDate}
						endDate={endDate}
						onDatesChange={() => null}
						datePickerValue={{}}
						presets={[]}
						minDate={startDate}
						timeMode="permalink"
						disableSearch
						actions={SearchFormActions}
						hideDatePicker
						hideCreateAlert
						fetchKeysLazyQuery={useGetLogsKeysLazyQuery}
						fetchValuesLazyQuery={useGetLogsKeyValuesLazyQuery}
					/>
					<Box height="full" pt="4" px="12" pb="12">
						{(!loading && logEdges.length === 0) || !traceId ? (
							<NoLogsFound />
						) : (
							<LogsTable
								logEdges={logEdges}
								loading={loading}
								error={error}
								refetch={refetch}
								loadingAfter={loadingAfter}
								query={query}
								selectedCursor={undefined}
								fetchMoreWhenScrolled={fetchMoreWhenScrolled}
								bodyHeight="400px"
							/>
						)}
					</Box>
				</Box>
			</Box>
		</>
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
