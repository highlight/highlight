import { Box, Callout, Text } from '@highlight-run/ui'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { LinkButton } from '@/components/LinkButton'
import { FullScreenContainer } from '@/pages/LogsPage/LogsTable/FullScreenContainer'
import { LogsTable } from '@/pages/LogsPage/LogsTable/LogsTable'
import { SearchForm } from '@/pages/LogsPage/SearchForm/SearchForm'
import {
	DEFAULT_LOGS_OPERATOR,
	stringifyLogsQuery,
} from '@/pages/LogsPage/SearchForm/utils'
import { useGetLogs } from '@/pages/LogsPage/useGetLogs'
import { NetworkResource } from '@/pages/Player/Toolbar/DevToolsWindowV2/utils'
import { useParams } from '@/util/react-router/useParams'

// The amount of time before and after the request started/ended we want to show
// logs for.
const TIME_BUFFER = 200000

export const NetworkResourceLogs: React.FC<{
	resource: NetworkResource
	sessionStartTime: number
}> = ({ resource, sessionStartTime }) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const requestId = resource.requestResponsePairs?.request?.id
	const [query, setQuery] = useState('')
	const tableContainerRef = useRef<HTMLDivElement>(null)
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
		fetchMoreBackward,
		refetch,
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

	useEffect(() => {
		setQuery(
			requestId
				? stringifyLogsQuery([
						{
							key: 'trace_id',
							operator: DEFAULT_LOGS_OPERATOR,
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
						minDate={new Date(sessionStartTime)}
						timeMode="permalink"
						disableSearch
						addLinkToViewInLogViewer
						hideDatePicker
						hideCreateAlert
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
