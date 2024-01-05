import {
	Box,
	Callout,
	IconSolidExternalLink,
	Text,
} from '@highlight-run/ui/components'
import { stringify } from 'query-string'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DateTimeParam, encodeQueryParams, StringParam } from 'use-query-params'

import { Button } from '@/components/Button'
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
import { FullScreenContainer } from '@/pages/LogsPage/LogsTable/FullScreenContainer'
import { LogsTable } from '@/pages/LogsPage/LogsTable/LogsTable'
import { useGetLogs } from '@/pages/LogsPage/useGetLogs'
import { NetworkResource } from '@/pages/Player/Toolbar/DevToolsWindowV2/utils'
import { useParams } from '@/util/react-router/useParams'

// The amount of time before and after the request started/ended we want to show
// logs for.
const TIME_BUFFER = 200000

const SEARCH_AND_HEADER_HEIGHT = 60

export const NetworkResourceLogs: React.FC<{
	resource: NetworkResource
	sessionStartTime: number
}> = ({ resource, sessionStartTime }) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const requestId = resource.requestResponsePairs?.request?.id
	const [query, setQuery] = useState('')
	const startDate = useMemo(
		() => new Date(sessionStartTime + resource.startTime - TIME_BUFFER),
		[sessionStartTime, resource.startTime],
	)
	const endDate = useMemo(
		() => new Date(sessionStartTime + resource.responseEnd + TIME_BUFFER),
		[resource.responseEnd, sessionStartTime],
	)

	const {
		logEdges,
		loading,
		error,
		loadingAfter,
		fetchMoreForward,
		refetch,
	} = useGetLogs({
		query,
		project_id,
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

	useEffect(() => {
		setQuery(
			requestId
				? stringifySearchQuery([
						{
							key: 'trace_id',
							operator: DEFAULT_OPERATOR,
							value: requestId,
							offsetStart: 0,
						},
				  ])
				: '',
		)
	}, [requestId])

	return (
		<>
			<Box
				padding="8"
				flex="stretch"
				justifyContent="stretch"
				display="flex"
				overflow="hidden"
				height="full"
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
						minDate={new Date(sessionStartTime)}
						timeMode="permalink"
						disableSearch
						actions={SearchFormActions}
						hideDatePicker
						hideCreateAlert
						fetchKeysLazyQuery={useGetLogsKeysLazyQuery}
						fetchValuesLazyQuery={useGetLogsKeyValuesLazyQuery}
					/>
					<Box height="full" pt="4" px="12" pb="12">
						{(!loading && logEdges.length === 0) || !requestId ? (
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
								bodyHeight={`calc(100% - ${SEARCH_AND_HEADER_HEIGHT}px)`}
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
		<FullScreenContainer>
			<Box style={{ maxWidth: 300 }}>
				<Callout title="No associated logs found">
					<Box
						display="flex"
						flexDirection="column"
						gap="16"
						alignItems="flex-start"
					>
						<Text color="moderate">
							To match backend logs to network requests, make sure
							to enable "full stack mapping."
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
		</FullScreenContainer>
	)
}

const SearchFormActions: SearchFormProps['actions'] = ({
	query,
	startDate,
	endDate,
}) => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()

	return (
		<Button
			kind="secondary"
			trackingId="view-in-log-viewer"
			onClick={() => {
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
				navigate({
					pathname: `/${projectId}/logs`,
					search: stringify(encodedQuery),
				})
			}}
			emphasis="medium"
			iconLeft={<IconSolidExternalLink />}
		>
			View in log viewer
		</Button>
	)
}
