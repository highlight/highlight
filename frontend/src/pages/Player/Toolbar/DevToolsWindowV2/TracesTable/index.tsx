import { ApolloError } from '@apollo/client'
import { Button } from '@components/Button'
import { TraceCustomColumn } from '@components/CustomColumnPopover'
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
import { TraceColumnRenderers } from '@pages/Traces/CustomColumns/renderers'
import { FullScreenContainer } from '@pages/LogsPage/LogsTable/FullScreenContainer'
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
import clsx from 'clsx'
import _ from 'lodash'
import React, {
	Key,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'

import { ColumnHeader } from '@/components/CustomColumnHeader'
import { findMatchingAttributes } from '@/components/JsonViewer/utils'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { TraceEdge } from '@/graph/generated/schemas'
import { LogDetails } from '@/pages/LogsPage/LogsTable/LogDetails'
import { THROTTLED_UPDATE_MS } from '@/pages/Player/PlayerHook/PlayerState'
import {
	ReplayerState,
	useReplayerContext,
} from '@/pages/Player/ReplayerContext'
import analytics from '@/util/analytics'

import * as styles from './style.css'
import { NoTracesFound } from '@pages/Traces/NoTracesFound'

type Props = {
	loading: boolean
	error: ApolloError | undefined
	refetch: () => void
} & TracesTableInnerProps

export const TracesTable = (props: Props) => {
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
					<Callout title="Failed to load traces" kind="error">
						<Box mb="6">
							<Text color="moderate">
								There was an error loading your traces. Reach
								out to us if this might be a bug.
							</Text>
						</Box>
						<Stack direction="row">
							<Button
								kind="secondary"
								trackingId="traces-error-reload"
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

	if (props.traceEdges.length === 0) {
		return (
			<FullScreenContainer>
				<NoTracesFound
					integrated={true}
					hasQuery={!!props.queryParts.length}
				/>
			</FullScreenContainer>
		)
	}

	return <TracesTableInner {...props} />
}

type TracesTableInnerProps = {
	traceEdges: TraceEdge[]
	selectedColumns: TraceCustomColumn[]
	queryParts: SearchExpression[]
	lastActiveTraceIndex: number
	autoScroll: boolean
	bodyHeight: string
	loadingAfter: boolean
	fetchMoreWhenScrolled: (target: HTMLDivElement) => void
}

const LOADING_AFTER_HEIGHT = 28

const TracesTableInner = ({
	traceEdges,
	selectedColumns,
	queryParts,
	lastActiveTraceIndex,
	autoScroll,
	bodyHeight,
	loadingAfter,
	fetchMoreWhenScrolled,
}: TracesTableInnerProps) => {
	const { state } = useReplayerContext()

	const bodyRef = useRef<HTMLDivElement>(null)
	const [expanded, setExpanded] = useState<ExpandedState>({})

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

	const columnHelper = createColumnHelper<TraceEdge>()

	const columnData = useMemo(() => {
		const gridColumns: string[] = []
		const columnHeaders: ColumnHeader[] = []
		const columns: ColumnDef<TraceEdge, any>[] = []

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
			})

			// @ts-ignore
			const accessor = columnHelper.accessor(column.accessor, {
				cell: ({ row, getValue }) => {
					const ColumnRenderer = TraceColumnRenderers[column.type]
					return (
						<ColumnRenderer
							key={column.id}
							first={first}
							row={row}
							getValue={getValue}
							queryParts={queryParts}
							onClick={column.onClick}
						/>
					)
				},
				id: column.id,
			})

			columns.push(accessor)
		})

		return {
			gridColumns,
			columnHeaders,
			columns,
		}
	}, [columnHelper, queryParts, selectedColumns])

	const table = useReactTable({
		data: traceEdges,
		columns: columnData.columns,
		state: {
			expanded,
		},
		onExpandedChange: (expanded) => {
			setExpanded(expanded)

			if (expanded) {
				analytics.track('traces_table-row-expand_click')
			} else {
				analytics.track('traces_table-row-collapse_click')
			}
		},
		getRowCanExpand: (row) => row.original.node.traceAttributes,
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
		table.toggleAllRowsExpanded(false)
	}, [table])

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const scrollFunction = useCallback(
		_.throttle((index: number) => {
			requestAnimationFrame(() => {
				rowVirtualizer.scrollToIndex(index, {
					align: 'center',
					behavior: 'smooth',
				})
			})
		}, THROTTLED_UPDATE_MS),
		[],
	)

	useEffect(() => {
		if (
			autoScroll &&
			state === ReplayerState.Playing &&
			lastActiveTraceIndex >= 0 &&
			!!traceEdges.length
		) {
			scrollFunction(lastActiveTraceIndex)
		}
	}, [lastActiveTraceIndex, traceEdges, scrollFunction, autoScroll, state])

	return (
		<Table height="full" noBorder>
			<Table.Head>
				<Table.Row gridColumns={columnData.gridColumns}>
					{columnData.columnHeaders.map((header) => (
						<Table.Header key={header.id}>
							<Box
								display="flex"
								alignItems="center"
								justifyContent="space-between"
							>
								<Stack direction="row" gap="6" align="center">
									<Text lines="1">{header.component}</Text>
								</Stack>
							</Box>
						</Table.Header>
					))}
				</Table.Row>
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
					const isActive = row.index === lastActiveTraceIndex
					const isPast = row.index <= lastActiveTraceIndex

					return (
						<TracesTableRow
							key={virtualRow.key}
							row={row}
							rowVirtualizer={rowVirtualizer}
							expanded={row.getIsExpanded()}
							virtualRowKey={virtualRow.key}
							gridColumns={columnData.gridColumns}
							queryParts={queryParts}
							isActive={isActive}
							isPast={isPast}
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

type TracesTableRowProps = {
	row: Row<TraceEdge>
	rowVirtualizer: any
	expanded: boolean
	virtualRowKey: Key
	gridColumns: string[]
	queryParts: SearchExpression[]
	isActive: boolean
	isPast: boolean
}

const TracesTableRow = React.memo<TracesTableRowProps>(
	({
		row,
		rowVirtualizer,
		expanded,
		virtualRowKey,
		queryParts,
		gridColumns,
		isActive,
		isPast,
	}) => {
		const attributesRow = (row: TracesTableRowProps['row']) => {
			const trace = row.original.node
			const rowExpanded = row.getIsExpanded()

			return (
				<Table.Row
					selected={expanded}
					className={clsx(styles.attributesRow, {
						[styles.currentRow]: isActive,
					})}
					gridColumns={['32px', '1fr']}
				>
					{rowExpanded && (
						<>
							<Table.Cell py="4" />
							<Table.Cell py="4" borderTop="dividerWeak">
								<Text>
									matching{' '}
									{JSON.stringify(
										findMatchingAttributes(queryParts, {
											...trace.traceAttributes,
											environment: trace.environment,
											secure_session_id:
												trace.secureSessionID,
											service_name: trace.serviceName,
											service_version:
												trace.serviceVersion,
											span_id: trace.spanID,
											span_name: trace.spanName,
											trace_id: trace.traceID,
										}),
									)}
								</Text>
								<Text>row {JSON.stringify(row)}</Text>
								<Text>
									queryParts {JSON.stringify(queryParts)}
								</Text>
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
					className={clsx(styles.dataRow, {
						[styles.pastRow]: isPast,
					})}
				>
					{row.getVisibleCells().map((cell: any) => {
						console.log('cell', {
							cell,
							def: cell.column.columnDef.cell,
							context: cell.getContext(),
						})
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
	},
	(prevProps, nextProps) => {
		return (
			prevProps.virtualRowKey === nextProps.virtualRowKey &&
			prevProps.expanded === nextProps.expanded &&
			prevProps.isActive === nextProps.isActive &&
			prevProps.isPast === nextProps.isPast
		)
	},
)
