import LoadingBox from '@components/LoadingBox'
import { GetLogsQuery } from '@graph/operations'
import { LogLine, SeverityText } from '@graph/schemas'
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
import React, { Fragment, useEffect, useState } from 'react'

import * as styles from './LogsTable.css'

type Props = {
	loading: boolean
	data: GetLogsQuery | undefined
	query: string
}

const LogsTable = ({ data, loading, query }: Props) => {
	const [expanded, setExpanded] = useState<ExpandedState>({})

	const columns = React.useMemo<ColumnDef<LogLine>[]>(
		() => [
			{
				accessorKey: 'timestamp',
				cell: ({ row, getValue }) => (
					<Box
						flexShrink={0}
						flexDirection="row"
						display="flex"
						alignItems="center"
						gap="6"
					>
						{row.getCanExpand() && (
							<Box
								display="flex"
								alignItems="center"
								cssClass={styles.expandIcon}
							>
								{row.getIsExpanded() ? (
									<IconSolidCheveronDown />
								) : (
									<IconSolidCheveronRight />
								)}
							</Box>
						)}
						<LogTimestamp timestamp={getValue() as string} />
					</Box>
				),
			},
			{
				accessorKey: 'severityText',
				cell: ({ getValue }) => (
					<LogSeverityText
						severityText={getValue() as SeverityText}
					/>
				),
			},
			{
				accessorKey: 'body',
				cell: ({ row, getValue }) => (
					<LogBody
						expanded={row.getIsExpanded()}
						query={query}
						body={getValue() as string}
					/>
				),
			},
		],
		[query],
	)

	let logs: LogLine[] = []

	if (data?.logs) {
		logs = data.logs
	}

	const table = useReactTable({
		data: logs,
		columns,
		state: {
			expanded,
		},
		onExpandedChange: setExpanded,
		getRowCanExpand: (row) => row.original.logAttributes,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		debugTable: true,
	})

	useEffect(() => {
		// Collapse all rows when search changes
		table.toggleAllRowsExpanded(false)
	}, [logs])

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

	if (logs.length === 0) {
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
		<Box px="12" overflowY="scroll">
			{table.getRowModel().rows.map((row) => {
				return (
					<Box
						cssClass={clsx(styles.row, {
							[styles.rowExpanded]: row.getIsExpanded(),
						})}
						key={row.id}
						cursor="pointer"
						onClick={row.getToggleExpandedHandler()}
						mb="1"
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
		</Box>
	)
}

export { LogsTable }
