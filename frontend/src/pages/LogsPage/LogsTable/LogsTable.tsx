import { CircularSpinner } from '@components/Loading/Loading'
import { LogLevel as LogLevelType } from '@graph/schemas'
import { LogEdge } from '@graph/schemas'
import {
	Box,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Stack,
	Text,
} from '@highlight-run/ui'
import { LogDetails } from '@pages/LogsPage/LogsTable/LogDetails'
import { LogLevel } from '@pages/LogsPage/LogsTable/LogLevel'
import { LogMessage } from '@pages/LogsPage/LogsTable/LogMessage'
import { LogTimestamp } from '@pages/LogsPage/LogsTable/LogTimestamp'
import { NoLogsFound } from '@pages/LogsPage/LogsTable/NoLogsFound'
import { parseLogsQuery } from '@pages/LogsPage/SearchForm/utils'
import { LogEdgeWithError } from '@pages/LogsPage/useGetLogs'
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

import * as styles from './LogsTable.css'

type Props = {
	loading: boolean
	loadingAfter: boolean
	logEdges: LogEdgeWithError[]
	query: string
	tableContainerRef: React.RefObject<HTMLDivElement>
	selectedCursor: string | undefined
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
	query,
	tableContainerRef,
	selectedCursor,
}: Props) => {
	const queryTerms = parseLogsQuery(query)
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
						queryTerms={queryTerms}
						message={getValue() as string}
						expanded={row.getIsExpanded()}
					/>
				),
			},
		],
		// Only want to update when the query string matches.
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
	})
	const totalSize = rowVirtualizer.getTotalSize()
	const virtualRows = rowVirtualizer.getVirtualItems()
	const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0
	const paddingBottom =
		virtualRows.length > 0
			? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
			: 0

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

	return (
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

						<LogDetails row={row} queryTerms={queryTerms} />
					</Box>
				)
			})}

			{paddingBottom > 0 && <Box style={{ height: paddingBottom }} />}

			{loadingAfter && (
				<Box
					backgroundColor="white"
					border="dividerWeak"
					display="flex"
					flexGrow={1}
					alignItems="center"
					justifyContent="center"
					padding="12"
					position="fixed"
					shadow="medium"
					borderRadius="6"
					textAlign="center"
					style={{
						bottom: 20,
						left: 'calc(50% - 150px)',
						width: 300,
						zIndex: 10,
					}}
				>
					<Text color="weak">Loading...</Text>
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
