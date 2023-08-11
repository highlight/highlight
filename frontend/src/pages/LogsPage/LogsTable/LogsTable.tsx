import { ApolloError } from '@apollo/client'
import { Button } from '@components/Button'
import { Link } from '@components/Link'
import LoadingBox from '@components/LoadingBox'
import { LogEdge } from '@graph/schemas'
import {
	Box,
	Callout,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Stack,
	Text,
} from '@highlight-run/ui'
import { FullScreenContainer } from '@pages/LogsPage/LogsTable/FullScreenContainer'
import { LogDetails, LogValue } from '@pages/LogsPage/LogsTable/LogDetails'
import { LogLevel } from '@pages/LogsPage/LogsTable/LogLevel'
import { LogMessage } from '@pages/LogsPage/LogsTable/LogMessage'
import { LogTimestamp } from '@pages/LogsPage/LogsTable/LogTimestamp'
import { NoLogsFound } from '@pages/LogsPage/LogsTable/NoLogsFound'
import { parseLogsQuery } from '@pages/LogsPage/SearchForm/utils'
import { LogEdgeWithError } from '@pages/LogsPage/useGetLogs'
import {
	createColumnHelper,
	ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import React, { Fragment, useEffect, useState } from 'react'

import { findMatchingLogAttributes } from '@/pages/LogsPage/utils'

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
	tableContainerRef: React.RefObject<HTMLDivElement>
	selectedCursor: string | undefined
}

const LOADING_AFTER_HEIGHT = 28

const LogsTableInner = ({
	logEdges,
	loadingAfter,
	query,
	tableContainerRef,
	selectedCursor,
}: LogsTableInnerProps) => {
	const queryTerms = parseLogsQuery(query)
	const [expanded, setExpanded] = useState<ExpandedState>({})

	const columnHelper = createColumnHelper<LogEdge>()

	const columns = [
		columnHelper.accessor('node.timestamp', {
			cell: ({ row, getValue }) => (
				<Box
					flexShrink={0}
					flexDirection="row"
					display="flex"
					alignItems="flex-start"
					gap="6"
				>
					{row.getCanExpand() && (
						<Box
							display="flex"
							alignItems="flex-start"
							cssClass={styles.expandIcon}
						>
							{row.getIsExpanded() ? (
								<IconExpanded />
							) : (
								<IconCollapsed />
							)}
						</Box>
					)}
					<LogTimestamp timestamp={getValue()} />
				</Box>
			),
		}),
		columnHelper.accessor('node.level', {
			cell: ({ getValue }) => <LogLevel level={getValue()} />,
		}),
		columnHelper.accessor('node.message', {
			cell: ({ row, getValue }) => (
				<LogMessage
					queryTerms={queryTerms}
					message={getValue()}
					expanded={row.getIsExpanded()}
				/>
			),
		}),
	]

	const table = useReactTable({
		data: logEdges,
		columns,
		state: {
			expanded,
		},
		onExpandedChange: setExpanded,
		getRowCanExpand: (row) => row.original.node.logAttributes,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		debugTable: true,
	})

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 26,
		getScrollElement: () => tableContainerRef.current,
		overscan: 10,
	})
	const totalSize = rowVirtualizer.getTotalSize()
	const virtualRows = rowVirtualizer.getVirtualItems()
	const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0
	let paddingBottom =
		virtualRows.length > 0
			? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
			: 0

	if (!loadingAfter) {
		paddingBottom += LOADING_AFTER_HEIGHT
	}

	useEffect(() => {
		// Collapse all rows when search changes
		table.toggleAllRowsExpanded(false)
	}, [query, table])

	useEffect(() => {
		const foundRow = rows.find(
			(row) => row.original.cursor === selectedCursor,
		)

		if (foundRow) {
			rowVirtualizer.scrollToIndex(foundRow.index, {
				align: 'start',
				behavior: 'smooth',
			})
			foundRow.toggleExpanded(true)
		}

		// Only run when the component mounts
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<div style={{ height: `${totalSize}px`, position: 'relative' }}>
			{paddingTop > 0 && <Box style={{ height: paddingTop }} />}

			{virtualRows.map((virtualRow) => {
				const row = rows[virtualRow.index]
				const log = row.original.node
				const matchedAttributes = findMatchingLogAttributes(
					queryTerms,
					{
						...log.logAttributes,
						level: log.level,
						message: log.message,
						secure_session_id: log.secureSessionID,
						service_name: log.serviceName,
						service_version: log.serviceVersion,
						source: log.source,
						span_id: log.spanID,
						trace_id: log.traceID,
					},
				)

				return (
					<Box
						cssClass={clsx(styles.row, {
							[styles.rowExpanded]: row.getIsExpanded(),
						})}
						key={virtualRow.key}
						data-index={virtualRow.index}
						cursor="pointer"
						onClick={row.getToggleExpandedHandler()}
						mb="2"
						ref={rowVirtualizer.measureElement}
					>
						<Stack direction="row" align="flex-start">
							{row.getVisibleCells().map((cell) => {
								return (
									<Fragment key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</Fragment>
								)
							})}
						</Stack>

						{!row.getIsExpanded() &&
							Object.entries(matchedAttributes).length > 0 && (
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
							row={row}
							queryTerms={queryTerms}
						/>
					</Box>
				)
			})}

			{paddingBottom > 0 && <Box style={{ height: paddingBottom }} />}

			{loadingAfter && (
				<Box
					backgroundColor="nested"
					style={{
						height: `${LOADING_AFTER_HEIGHT}px`,
					}}
				>
					<LoadingBox />
				</Box>
			)}
		</div>
	)
}

export const IconExpanded: React.FC = () => (
	<IconSolidCheveronDown color="#6F6E77" size="16" />
)

export const IconCollapsed: React.FC = () => (
	<IconSolidCheveronRight color="#6F6E77" size="16" />
)
