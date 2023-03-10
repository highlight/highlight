import { CircularSpinner } from '@components/Loading/Loading'
import { LogLevel as LogLevelType } from '@graph/schemas'
import { LogEdge } from '@graph/schemas'
import {
	Box,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Stack,
} from '@highlight-run/ui'
import { LoadingPage } from '@pages/LogsPage/LogsTable/LoadingPage'
import { LogDetails } from '@pages/LogsPage/LogsTable/LogDetails'
import { LogLevel } from '@pages/LogsPage/LogsTable/LogLevel'
import { LogMessage } from '@pages/LogsPage/LogsTable/LogMessage'
import { LogTimestamp } from '@pages/LogsPage/LogsTable/LogTimestamp'
import { NoLogsFound } from '@pages/LogsPage/LogsTable/NoLogsFound'
import {
	ColumnDef,
	ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import clsx from 'clsx'
import React, { Fragment, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

import * as styles from './LogsTable.css'

type Props = {
	loading: boolean
	loadingAfter: boolean
	loadingBefore: boolean
	logEdges: LogEdge[]
	query: string
	tableContainerRef: React.RefObject<HTMLDivElement>
	selectedCursor: string | undefined
	fetchMoreForward: () => void
	fetchMoreBackward: () => void
	hasNextPage: boolean
	hasPreviousPage: boolean
}

export const LogsTable = (props: Props) => {
	if (props.loading) {
		return (
			<Box
				display="flex"
				flexGrow={1}
				alignItems="center"
				justifyContent="center"
			>
				<CircularSpinner />
			</Box>
		)
	}

	if (props.logEdges.length === 0) {
		return (
			<Box
				display="flex"
				flexGrow={1}
				alignItems="center"
				justifyContent="center"
			>
				<NoLogsFound />
			</Box>
		)
	}

	return <LogsTableInner {...props} />
}

const LogsTableInner = ({
	logEdges,
	loadingAfter,
	loadingBefore,
	query,
	tableContainerRef,
	selectedCursor,
	fetchMoreForward,
	fetchMoreBackward,
	hasNextPage,
	hasPreviousPage,
}: Props) => {
	const { ref: previousRef, inView: inPreviousView } = useInView()
	const { ref: nextRef, inView: inNextView } = useInView()

	const [expanded, setExpanded] = useState<ExpandedState>({})

	const columns = React.useMemo<ColumnDef<LogEdge>[]>(
		() => [
			{
				accessorKey: 'node.timestamp',
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
						<LogTimestamp timestamp={getValue() as string} />
					</Box>
				),
			},
			{
				accessorKey: 'node.level',
				cell: ({ getValue }) => (
					<LogLevel level={getValue() as LogLevelType} />
				),
			},
			{
				accessorKey: 'node.message',
				cell: ({ row, getValue }) => (
					<LogMessage
						query={query}
						message={getValue() as string}
						expanded={row.getIsExpanded()}
					/>
				),
			},
		],
		[query],
	)

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
		scrollMargin: 50,
	})
	const totalSize = rowVirtualizer.getTotalSize()
	const virtualRows = rowVirtualizer.getVirtualItems()
	const [paddingTop, paddingBottom] =
		rows.length > 0
			? [
					Math.max(
						0,
						virtualRows[0].start -
							rowVirtualizer.options.scrollMargin,
					),
					Math.max(
						0,
						rowVirtualizer.getTotalSize() -
							virtualRows[virtualRows.length - 1].end,
					),
			  ]
			: [0, 0]

	useEffect(() => {
		// Collapse all rows when search changes
		table.toggleAllRowsExpanded(false)
	}, [logEdges, table])

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

	React.useEffect(() => {
		if (rowVirtualizer.isScrolling) {
			return
		}
		if (inPreviousView && hasPreviousPage && !loadingBefore) {
			fetchMoreBackward()
		}
	}, [
		rowVirtualizer.isScrolling,
		fetchMoreBackward,
		hasPreviousPage,
		inPreviousView,
		loadingBefore,
	])

	React.useEffect(() => {
		if (inNextView && hasNextPage && !loadingAfter) {
			fetchMoreForward()
		}
	}, [fetchMoreForward, hasNextPage, inNextView, loadingAfter])

	return (
		<div>
			<div style={{ height: 50 }} ref={previousRef}>
				{loadingBefore && <LoadingPage alignTop={true} />}
			</div>

			<div style={{ height: `${totalSize}px`, position: 'relative' }}>
				{paddingTop > 0 && <Box style={{ height: paddingTop }} />}

				{virtualRows.map((virtualRow) => {
					const row = rows[virtualRow.index]
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

							<LogDetails row={row} />
						</Box>
					)
				})}

				{paddingBottom > 0 && <Box style={{ height: paddingBottom }} />}

				<div style={{ height: 50 }} ref={nextRef}>
					{loadingAfter && <LoadingPage alignTop={false} />}
				</div>
			</div>
		</div>
	)
}

export const IconExpanded: React.FC = () => (
	<IconSolidCheveronDown color="#6F6E77" size="16" />
)

export const IconCollapsed: React.FC = () => (
	<IconSolidCheveronRight color="#6F6E77" size="16" />
)
