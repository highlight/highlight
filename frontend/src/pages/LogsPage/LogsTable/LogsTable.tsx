import { ApolloError } from '@apollo/client'
import { Button } from '@components/Button'
import { AdditionalFeedResults } from '@components/FeedResults/FeedResults'
import { Link } from '@components/Link'
import LoadingBox from '@components/LoadingBox'
import {
	Box,
	Callout,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui'
import { FullScreenContainer } from '@pages/LogsPage/LogsTable/FullScreenContainer'
import { LogLevel } from '@pages/LogsPage/LogsTable/LogLevel'
import { LogMessage } from '@pages/LogsPage/LogsTable/LogMessage'
import { LogTimestamp } from '@pages/LogsPage/LogsTable/LogTimestamp'
import { NoLogsFound } from '@pages/LogsPage/LogsTable/NoLogsFound'
import { LogEdgeWithError } from '@pages/LogsPage/useGetLogs'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'

import { parseSearchQuery } from '@/components/Search/SearchForm/utils'
import { findMatchingLogAttributes } from '@/pages/LogsPage/utils'

import { LogDetails, LogValue } from './LogDetails'
import * as styles from './LogsTable.css'

type Props = {
	loading: boolean
	error: ApolloError | undefined
	refetch: () => void
} & LogsTableInnerProps

export const LogsTable = (props: Props) => {
	if (props.loading) {
		return (
			<FullScreenContainer>
				<LoadingBox />
			</FullScreenContainer>
		)
	}

	if (props.error) {
		return (
			<FullScreenContainer>
				<Box m="auto" style={{ maxWidth: 300 }}>
					<Callout title="Failed to load logs" kind="error">
						<Box mb="6">
							<Text color="moderate">
								There was an error loading your logs. Reach out
								to us if this might be a bug.
							</Text>
						</Box>
						<Stack direction="row">
							<Button
								kind="secondary"
								trackingId="logs-error-reload"
								onClick={() => props.refetch()}
							>
								Reload query
							</Button>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<Link
									to="https://highlight.io/community"
									target="_blank"
								>
									Help
								</Link>
							</Box>
						</Stack>
					</Callout>
				</Box>
			</FullScreenContainer>
		)
	}

	if (props.logEdges.length === 0) {
		return (
			<FullScreenContainer>
				<NoLogsFound />
			</FullScreenContainer>
		)
	}

	return <LogsTableInner {...props} />
}

type LogsTableInnerProps = {
	loadingAfter: boolean
	logEdges: LogEdgeWithError[]
	query: string
	selectedCursor: string | undefined
	fetchMoreWhenScrolled: (target: HTMLDivElement) => void
	// necessary for loading most recent loads
	moreLogs?: number
	clearMoreLogs?: () => void
	handleAdditionalLogsDateChange?: () => void
}

const LOADING_AFTER_HEIGHT = 28

const GRID_COLUMNS = ['200px', '75px', '1fr']

const LogsTableInner = ({
	logEdges,
	loadingAfter,
	query,
	selectedCursor,
	moreLogs,
	clearMoreLogs,
	handleAdditionalLogsDateChange,
	fetchMoreWhenScrolled,
}: LogsTableInnerProps) => {
	const enableFetchMoreLogs =
		!!moreLogs && !!clearMoreLogs && !!handleAdditionalLogsDateChange

	return (
		<Table height="full" noBorder>
			<Table.Head>
				<Table.Row gridColumns={GRID_COLUMNS}>
					<Table.Header>Timestamp</Table.Header>
					<Table.Header>Level</Table.Header>
					<Table.Header>Body</Table.Header>
				</Table.Row>
				{enableFetchMoreLogs && (
					<Table.Row>
						<Box width="full">
							<AdditionalFeedResults
								more={moreLogs}
								type="logs"
								onClick={() => {
									clearMoreLogs()
									handleAdditionalLogsDateChange()
								}}
							/>
						</Box>
					</Table.Row>
				)}
			</Table.Head>
			<Table.Body
				overflowY="scroll"
				style={{
					// Subtract heights of elements above, including loading more loads when relevant
					height: moreLogs
						? `calc(100vh - 280px)`
						: `calc(100vh - 252px)`,
				}}
				onScroll={(e) =>
					fetchMoreWhenScrolled(e.target as HTMLDivElement)
				}
			>
				<>
					{logEdges.map((logEdge) => (
						<LogsTableRow
							key={logEdge.cursor}
							logEdge={logEdge}
							query={query}
							selectedCursor={selectedCursor}
						/>
					))}
					<Table.Row>
						<Box
							style={{
								height: `${LOADING_AFTER_HEIGHT}px`,
							}}
						>
							{loadingAfter && <LoadingBox />}
						</Box>
					</Table.Row>
				</>
			</Table.Body>
		</Table>
	)
}

interface LogsTableRowProps {
	logEdge: LogEdgeWithError
	query: string
	selectedCursor: string | undefined
}

const LogsTableRow = ({
	logEdge,
	query,
	selectedCursor,
}: LogsTableRowProps) => {
	const { node: log } = logEdge
	const queryTerms = parseSearchQuery(query)
	const [expanded, setExpanded] = useState(false)
	const rowRef = useRef<HTMLDivElement>(null)

	// TODO(spenny): this fires too much, and causes headaches when scrolling resets
	useEffect(() => {
		if (selectedCursor && rowRef?.current) {
			if (logEdge.cursor === selectedCursor) {
				console.log('ONMOUNT')

				rowRef?.current.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
				})
				setExpanded(true)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const toggleExpanded = () => {
		setExpanded(!expanded)
	}

	const matchedAttributes = findMatchingLogAttributes(queryTerms, {
		...log.logAttributes,
		level: log.level,
		message: log.message,
		secure_session_id: log.secureSessionID,
		service_name: log.serviceName,
		service_version: log.serviceVersion,
		source: log.source,
		span_id: log.spanID,
		trace_id: log.traceID,
	})

	return (
		<Table.Row
			gridColumns={GRID_COLUMNS}
			onClick={toggleExpanded}
			ref={rowRef}
			cssClass={clsx(styles.row, {
				[styles.rowExpanded]: expanded,
			})}
		>
			<Table.Cell alignItems="flex-start">
				<Box
					flexShrink={0}
					flexDirection="row"
					display="flex"
					alignItems="center"
					gap="6"
					ref={rowRef}
				>
					<Table.Discoverable trigger="row">
						{expanded ? <IconExpanded /> : <IconCollapsed />}
					</Table.Discoverable>

					<LogTimestamp timestamp={log.timestamp} />
				</Box>
			</Table.Cell>
			<Table.Cell alignItems="flex-start">
				<LogLevel level={log.level} />
			</Table.Cell>
			<Table.Cell alignItems="flex-start">
				<Stack gap="2">
					<LogMessage
						queryTerms={queryTerms}
						message={log.message}
						expanded={expanded}
					/>
					{!expanded && Object.entries(matchedAttributes).length > 0 && (
						<Box mt="10" ml="20">
							{Object.entries(matchedAttributes).map(
								([key, { match, value }]) => {
									return (
										<LogValue
											key={key}
											label={key}
											value={value}
											queryKey={key}
											queryMatch={match}
											queryTerms={queryTerms}
										/>
									)
								},
							)}
						</Box>
					)}
					<LogDetails
						matchedAttributes={matchedAttributes}
						log={logEdge}
						queryTerms={queryTerms}
						expanded={expanded}
					/>
				</Stack>
			</Table.Cell>
		</Table.Row>
	)
}

export const IconExpanded: React.FC = () => (
	<IconSolidCheveronDown color="#6F6E77" size="12" />
)

export const IconCollapsed: React.FC = () => (
	<IconSolidCheveronRight color="#6F6E77" size="12" />
)
