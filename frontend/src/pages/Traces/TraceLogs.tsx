import { Box, Callout, IconSolidExternalLink, Text } from '@highlight-run/ui'
import moment from 'moment'
import { stringify } from 'query-string'
import React, { useEffect, useRef, useState } from 'react'
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
	useGetLogsKeysQuery,
	useGetLogsKeyValuesLazyQuery,
} from '@/graph/generated/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import { LogsTable } from '@/pages/LogsPage/LogsTable/LogsTable'
import { useGetLogs } from '@/pages/LogsPage/useGetLogs'
import { useParams } from '@/util/react-router/useParams'

const startDate = moment().subtract(30, 'days').toDate()
const endDate = moment().toDate()

export const TraceLogs: React.FC = () => {
	const { project_id, trace_id } = useParams<{
		project_id: string
		trace_id: string
	}>()
	const [query, setQuery] = useState('')
	const tableContainerRef = useRef<HTMLDivElement>(null)

	const {
		logEdges,
		loading,
		error,
		loadingAfter,
		fetchMoreForward,
		fetchMoreBackward,
	} = useGetLogs({
		query,
		project_id,
		logCursor: undefined,
		startDate,
		endDate,
	})

	const fetchMoreWhenScrolled = React.useCallback(
		(containerRefElement?: HTMLDivElement | null) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } =
					containerRefElement

				if (scrollHeight - scrollTop - clientHeight < 100) {
					fetchMoreForward()
				} else if (scrollTop === 0) {
					fetchMoreBackward()
				}
			}
		},
		[fetchMoreForward, fetchMoreBackward],
	)

	// Making this a noop since there shouldn't be additional logs to fetch
	const refetch = () => {}

	useEffect(() => {
		setQuery(
			trace_id
				? stringifySearchQuery([
						{
							key: 'trace_id',
							operator: DEFAULT_OPERATOR,
							value: trace_id,
							offsetStart: 0,
						},
				  ])
				: '',
		)
	}, [trace_id])

	return (
		<>
			<Box
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
				overflow="hidden"
				maxHeight="full"
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
						onFormSubmit={(value) => setQuery(value)}
						startDate={startDate}
						endDate={endDate}
						onDatesChange={() => null}
						presets={[]}
						minDate={startDate}
						timeMode="permalink"
						disableSearch
						actions={SearchFormActions}
						hideDatePicker
						hideCreateAlert
						fetchKeys={useGetLogsKeysQuery}
						fetchValuesLazyQuery={useGetLogsKeyValuesLazyQuery}
					/>
					<Box
						height="screen"
						pt="4"
						px="12"
						pb="12"
						overflowY="auto"
						onScroll={(e) =>
							fetchMoreWhenScrolled(e.target as HTMLDivElement)
						}
						ref={tableContainerRef}
					>
						{(!loading && logEdges.length === 0) || !trace_id ? (
							<NoLogsFound />
						) : (
							<LogsTable
								logEdges={logEdges}
								loading={loading}
								error={error}
								refetch={refetch}
								loadingAfter={loadingAfter}
								query={query}
								tableContainerRef={tableContainerRef}
								selectedCursor={undefined}
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
