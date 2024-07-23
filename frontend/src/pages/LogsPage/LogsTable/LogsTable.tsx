import { ApolloError } from '@apollo/client'
import { Button } from '@components/Button'
import {
	CustomColumnPopover,
	SerializedColumn,
} from '@components/CustomColumnPopover'
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
} from '@highlight-run/ui/components'
import {
	DEFAULT_LOG_COLUMNS,
	HIGHLIGHT_STANDARD_COLUMNS,
} from '@pages/LogsPage/LogsTable/CustomColumns/columns'
import { ColumnRenderers } from '@pages/LogsPage/LogsTable/CustomColumns/renderers'
import { FullScreenContainer } from '@pages/LogsPage/LogsTable/FullScreenContainer'
import { NoLogsFound } from '@pages/LogsPage/LogsTable/NoLogsFound'
import { LogEdgeWithResources } from '@pages/LogsPage/useGetLogs'
import {
	ColumnDef,
	createColumnHelper,
	ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	Row,
	useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import React, { Key, useEffect, useMemo, useRef, useState } from 'react'

import {
	ColumnHeader,
	CustomColumnHeader,
} from '@/components/CustomColumnHeader'
import { findMatchingAttributes } from '@/components/JsonViewer/utils'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { LogEdge, ProductType } from '@/graph/generated/schemas'
import { MAX_LOGS } from '@/pages/LogsPage/useGetLogs'
import analytics from '@/util/analytics'

import { LogDetails } from './LogDetails'
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
	logEdges: LogEdgeWithResources[]
	selectedCursor: string | undefined
	query: string
	queryParts: SearchExpression[]
	fetchMoreWhenScrolled: (target: HTMLDivElement) => void
	// necessary for loading most recent loads
	moreLogs?: number
	bodyHeight: string
	clearMoreLogs?: () => void
	handleAdditionalLogsDateChange?: () => void
	selectedColumns?: SerializedColumn[]
	setSelectedColumns?: (columns: SerializedColumn[]) => void
	pollingExpired?: boolean
}

const LOADING_AFTER_HEIGHT = 28

const LogsTableInner = ({
	logEdges,
	loadingAfter,
	selectedCursor,
	query,
	queryParts,
	moreLogs,
	pollingExpired,
	bodyHeight,
	clearMoreLogs,
	handleAdditionalLogsDateChange,
	fetchMoreWhenScrolled,
	selectedColumns = DEFAULT_LOG_COLUMNS,
	setSelectedColumns,
}: LogsTableInnerProps) => {
	const bodyRef = useRef<HTMLDivElement>(null)
	const enableFetchMoreLogs =
		(!!moreLogs || pollingExpired) &&
		!!clearMoreLogs &&
		!!handleAdditionalLogsDateChange

	const [expanded, setExpanded] = useState<ExpandedState>({})

	const columnHelper = createColumnHelper<LogEdge>()

	const columnData = useMemo(() => {
		const gridColumns: string[] = []
		const columnHeaders: ColumnHeader[] = []
		const columns: ColumnDef<LogEdge, any>[] = []

		gridColumns.push('32px')
		columnHeaders.push({ id: 'cursor', component: '' })
		columns.push(
			columnHelper.accessor('cursor', {
				cell: ({ row }) => {
					return (
						<Table.Cell alignItems="flex-start">
							<Box flexShrink={0} display="flex" width="full">
								{row.getIsExpanded() ? (
									<IconExpanded />
								) : (
									<IconCollapsed />
								)}
							</Box>
						</Table.Cell>
					)
				},
			}),
		)

		selectedColumns.forEach((column, index) => {
			const first = index === 0

			gridColumns.push(column.size)
			columnHeaders.push({
				id: column.id,
				component: column.label,
				showActions: !!setSelectedColumns,
			})

			const accessorFn =
				column.id in HIGHLIGHT_STANDARD_COLUMNS
					? HIGHLIGHT_STANDARD_COLUMNS[column.id].accessor
					: (`node.logAttributes.${column.id}` as `node.logAttributes.${string}`)

			const columnType =
				column.id in HIGHLIGHT_STANDARD_COLUMNS
					? HIGHLIGHT_STANDARD_COLUMNS[column.id].type
					: 'string'

			const accessor = columnHelper.accessor(accessorFn, {
				cell: ({ row, getValue }) => {
					const ColumnRenderer = ColumnRenderers[columnType]

					return (
						<ColumnRenderer
							first={first}
							key={column.id}
							row={row}
							getValue={getValue}
							queryParts={queryParts}
						/>
					)
				},
				id: column.id,
			})

			columns.push(accessor)
		})

		if (setSelectedColumns) {
			// add custom column
			gridColumns.push('25px')
			columnHeaders.push({
				id: 'edit-column-button',
				noPadding: true,
				component: (
					<CustomColumnPopover
						productType={ProductType.Logs}
						selectedColumns={selectedColumns}
						setSelectedColumns={setSelectedColumns}
						standardColumns={HIGHLIGHT_STANDARD_COLUMNS}
						attributeAccessor={(row: LogEdge) =>
							row.node.logAttributes
						}
					/>
				),
			})
		}

		return {
			gridColumns,
			columnHeaders,
			columns,
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queryParts, selectedColumns, setSelectedColumns])

	const table = useReactTable({
		data: logEdges,
		columns: columnData.columns,
		state: {
			expanded,
		},
		onExpandedChange: (expanded) => {
			setExpanded(expanded)

			if (expanded) {
				analytics.track('logs_table-row-expand_click')
			} else {
				analytics.track('logs_table-row-collapse_click')
			}
		},
		getRowCanExpand: (row) => row.original.node.logAttributes,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
	})

	const { rows } = table.getRowModel()

	const rowVirtualizer = useVirtualizer({
		count: rows.length,
		estimateSize: () => 29,
		getScrollElement: () => bodyRef.current,
		overscan: 50,
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

	useEffect(() => {
		setTimeout(() => {
			if (!loadingAfter && bodyRef?.current) {
				fetchMoreWhenScrolled(bodyRef.current)
			}
		}, 0)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadingAfter])

	const handleFetchMoreWhenScrolled = (
		e: React.UIEvent<HTMLDivElement, UIEvent>,
	) => {
		setTimeout(() => {
			fetchMoreWhenScrolled(e.target as HTMLDivElement)
		}, 0)
	}

	return (
		<Table height="full" noBorder>
			<Table.Head>
				<Table.Row gridColumns={columnData.gridColumns}>
					{columnData.columnHeaders.map((header) => (
						<CustomColumnHeader
							key={header.id}
							header={header}
							selectedColumns={selectedColumns}
							setSelectedColumns={setSelectedColumns!}
							standardColumns={HIGHLIGHT_STANDARD_COLUMNS}
							trackingIdPrefix="LogsTableColumn"
						/>
					))}
				</Table.Row>
				{enableFetchMoreLogs && (
					<Table.Row>
						<Box width="full">
							<AdditionalFeedResults
								maxResults={MAX_LOGS}
								more={moreLogs ?? 0}
								type="logs"
								onClick={() => {
									clearMoreLogs()
									handleAdditionalLogsDateChange()
								}}
								pollingExpired={pollingExpired ?? false}
							/>
						</Box>
					</Table.Row>
				)}
			</Table.Head>
			<Table.Body
				ref={bodyRef}
				overflowY="auto"
				style={{ height: bodyHeight }}
				onScroll={handleFetchMoreWhenScrolled}
				hiddenScroll
			>
				{paddingTop > 0 && <Box style={{ height: paddingTop }} />}
				{virtualRows.map((virtualRow) => {
					const row = rows[virtualRow.index]

					return (
						<LogsTableRow
							key={virtualRow.key}
							row={row}
							rowVirtualizer={rowVirtualizer}
							expanded={row.getIsExpanded()}
							virtualRowKey={virtualRow.key}
							queryParts={queryParts}
							gridColumns={columnData.gridColumns}
						/>
					)
				})}
				{paddingBottom > 0 && <Box style={{ height: paddingBottom }} />}

				{loadingAfter && (
					<Box
						style={{
							height: `${LOADING_AFTER_HEIGHT}px`,
						}}
					>
						<LoadingBox />
					</Box>
				)}
			</Table.Body>
		</Table>
	)
}

export const IconExpanded: React.FC = () => (
	<IconSolidCheveronDown color="#6F6E77" size="12" />
)

export const IconCollapsed: React.FC = () => (
	<IconSolidCheveronRight color="#6F6E77" size="12" />
)

type LogsTableRowProps = {
	row: Row<LogEdgeWithResources>
	rowVirtualizer: any
	expanded: boolean
	virtualRowKey: Key
	queryParts: SearchExpression[]
	gridColumns: string[]
}

const LogsTableRow: React.FC<LogsTableRowProps> = ({
	row,
	rowVirtualizer,
	expanded,
	virtualRowKey,
	queryParts,
	gridColumns,
}) => {
	const attributesRow = (row: LogsTableRowProps['row']) => {
		const log = row.original.node
		const rowExpanded = row.getIsExpanded()

		return (
			<Table.Row
				selected={expanded}
				className={styles.attributesRow}
				gridColumns={['32px', '1fr']}
			>
				{rowExpanded && (
					<>
						<Table.Cell py="4" />
						<Table.Cell py="4" borderTop="dividerWeak">
							<LogDetails
								matchedAttributes={findMatchingAttributes(
									queryParts,
									{
										...log.logAttributes,
										environment: log.environment,
										level: log.level,
										message: log.message,
										secure_session_id: log.secureSessionID,
										service_name: log.serviceName,
										service_version: log.serviceVersion,
										source: log.source,
										span_id: log.spanID,
										trace_id: log.traceID,
									},
								)}
								row={row}
								queryParts={queryParts}
							/>
						</Table.Cell>
					</>
				)}
			</Table.Row>
		)
	}

	return (
		<div
			key={virtualRowKey}
			data-index={virtualRowKey}
			ref={rowVirtualizer.measureElement}
		>
			<Table.Row
				gridColumns={gridColumns}
				onClick={row.getToggleExpandedHandler()}
				selected={expanded}
				className={styles.dataRow}
			>
				{row.getVisibleCells().map((cell: any) => {
					return (
						<React.Fragment key={cell.column.id}>
							{flexRender(
								cell.column.columnDef.cell,
								cell.getContext(),
							)}
						</React.Fragment>
					)
				})}
			</Table.Row>
			{attributesRow(row)}
		</div>
	)
}
