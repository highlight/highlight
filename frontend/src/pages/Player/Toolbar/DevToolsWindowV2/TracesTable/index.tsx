import { ApolloError } from '@apollo/client'
import { Button } from '@components/Button'
import { TraceCustomColumn } from '@components/CustomColumnPopover'
import { Link } from '@components/Link'
import LoadingBox from '@components/LoadingBox'
import { Box, Callout, Stack, Table, Text } from '@highlight-run/ui/components'
import { TraceColumnRenderers } from '@pages/Traces/CustomColumns/renderers'
import { FullScreenContainer } from '@pages/LogsPage/LogsTable/FullScreenContainer'
import {
	ColumnDef,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	Row,
	useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import _ from 'lodash'
import React, { Key, useCallback, useEffect, useMemo, useRef } from 'react'

import { ColumnHeader } from '@/components/CustomColumnHeader'
import { SearchExpression } from '@/components/Search/Parser/listener'
import { TraceEdge } from '@/graph/generated/schemas'
import { THROTTLED_UPDATE_MS } from '@/pages/Player/PlayerHook/PlayerState'
import {
	ReplayerState,
	useReplayerContext,
} from '@/pages/Player/ReplayerContext'

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
		getCoreRowModel: getCoreRowModel(),
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

type TracesTableRowProps = {
	row: Row<TraceEdge>
	rowVirtualizer: any
	virtualRowKey: Key
	gridColumns: string[]
	queryParts: SearchExpression[]
	isActive: boolean
	isPast: boolean
}

const TracesTableRow = React.memo<TracesTableRowProps>(
	({ row, rowVirtualizer, virtualRowKey, gridColumns, isPast }) => {
		return (
			<div
				key={virtualRowKey}
				data-index={virtualRowKey}
				ref={rowVirtualizer.measureElement}
			>
				<Table.Row
					gridColumns={gridColumns}
					className={clsx(styles.dataRow, {
						[styles.pastRow]: isPast,
					})}
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
			</div>
		)
	},
	(prevProps, nextProps) => {
		return (
			prevProps.virtualRowKey === nextProps.virtualRowKey &&
			prevProps.isActive === nextProps.isActive &&
			prevProps.isPast === nextProps.isPast
		)
	},
)
