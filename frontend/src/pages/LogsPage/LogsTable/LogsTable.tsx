import LoadingBox from '@components/LoadingBox'
import { GetLogsQuery } from '@graph/operations'
import { SeverityText } from '@graph/schemas'
import { LogEdge } from '@graph/schemas'
import {
	Box,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Stack,
} from '@highlight-run/ui'
import { LogBody } from '@pages/LogsPage/LogsTable/LogBody'
import { LogDetails } from '@pages/LogsPage/LogsTable/LogDetails'
import { LogSeverityText } from '@pages/LogsPage/LogsTable/LogSeverityText'
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
import clsx from 'clsx'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { useVirtual } from 'react-virtual'

import * as styles from './LogsTable.css'

type Props = {
	loading: boolean
	data: GetLogsQuery | undefined
	query: string
	tableContainerRef: React.RefObject<HTMLDivElement>
}

export const LogsTable = ({
	data,
	loading,
	query,
	tableContainerRef,
}: Props) => {
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
				accessorKey: 'node.severityText',
				cell: ({ getValue }) => (
					<LogSeverityText
						severityText={getValue() as SeverityText}
					/>
				),
			},
			{
				accessorKey: 'node.body',
				cell: ({ row, getValue }) => (
					<LogBody
						query={query}
						body={getValue() as string}
						expanded={row.getIsExpanded()}
					/>
				),
			},
		],
		[query],
	)

	let logEdges: LogEdge[] = useMemo(() => [], [])

	if (data?.logs?.edges) {
		logEdges = data.logs.edges
	}

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

	const rowVirtualizer = useVirtual({
		parentRef: tableContainerRef,
		size: rows.length,
		overscan: 20,
	})
	const { virtualItems: virtualRows, totalSize } = rowVirtualizer
	const paddingTop = virtualRows.length > 0 ? virtualRows[0].start || 0 : 0
	const paddingBottom =
		virtualRows.length > 0
			? totalSize - (virtualRows[virtualRows.length - 5].end || 0)
			: 0
	console.log('::: firstVirtualRow', virtualRows?.[0])
	console.log('::: lastVirtualRow', virtualRows?.[virtualRows.length - 1])
	console.log('::: totalSize', totalSize)
	console.log('::: paddingTop', paddingTop)
	console.log('::: paddingBottom', paddingBottom)

	useEffect(() => {
		// Collapse all rows when search changes
		table.toggleAllRowsExpanded(false)
	}, [logEdges, table])

	if (loading) {
		return (
			<Box
				display="flex"
				flexGrow={1}
				alignItems="center"
				justifyContent="center"
			>
				<LoadingBox />
			</Box>
		)
	}

	if (logEdges.length === 0) {
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

	return (
		<div style={{ height: `${totalSize}px`, position: 'relative' }}>
			{virtualRows.map((virtualRow) => {
				const row = rows[virtualRow.index]

				return (
					<Box
						cssClass={clsx(styles.row, {
							[styles.rowExpanded]: row.getIsExpanded(),
						})}
						key={row.id}
						cursor="pointer"
						onClick={row.getToggleExpandedHandler()}
						mb="1"
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: `${virtualRow.size}px`,
							transform: `translateY(${virtualRow.start}px)`,
						}}
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
		</div>
	)
}

export const IconExpanded: React.FC = () => (
	<IconSolidCheveronDown color="#6F6E77" size="16" />
)

export const IconCollapsed: React.FC = () => (
	<IconSolidCheveronRight color="#6F6E77" size="16" />
)
