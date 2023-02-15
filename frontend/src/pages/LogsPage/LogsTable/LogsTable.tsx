import LoadingBox from '@components/LoadingBox'
import { GetLogsQuery } from '@graph/operations'
import { LogLine } from '@graph/schemas'
import { Box, Stack } from '@highlight-run/ui'
import SvgChevronDownIcon from '@icons/ChevronDownIcon'
import SvgChevronRightIcon from '@icons/ChevronRightIcon'
import { LogBody } from '@pages/LogsPage/LogsTable/LogBody'
import { LogSeverityText } from '@pages/LogsPage/LogsTable/LogSeverityText'
import { LogTimestamp } from '@pages/LogsPage/LogsTable/LogTimestamp'
import { NoLogsFound } from '@pages/LogsPage/LogsTable/NoLogsFound'
import {
	ColumnDef,
	ExpandedState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	Row,
	useReactTable,
} from '@tanstack/react-table'
import React, { Fragment, useState } from 'react'

type Props = {
	loading: boolean
	data: GetLogsQuery | undefined
	query: string
}

const renderSubComponent = ({ row }: { row: Row<LogLine> }) => {
	return (
		<pre style={{ fontSize: '10px' }}>
			<code>{JSON.stringify(row.original, null, 2)}</code>
		</pre>
	)
}

const LogsTable = ({ data, loading, query }: Props) => {
	const [expanded, setExpanded] = useState<ExpandedState>({})

	const columns = React.useMemo<ColumnDef<LogLine>[]>(
		() => [
			{
				accessorKey: 'timestamp',
				cell: ({ row, getValue }) => (
					<>
						{row.getCanExpand() && (
							<div
								{...{
									onClick: row.getToggleExpandedHandler(),
									style: { cursor: 'pointer' },
								}}
							>
								{row.getIsExpanded() ? (
									<SvgChevronDownIcon />
								) : (
									<SvgChevronRightIcon />
								)}
							</div>
						)}
						<LogTimestamp timestamp={getValue() as string} />
					</>
				),
			},
			{
				accessorKey: 'severityText',
				cell: ({ getValue }) => (
					<LogSeverityText severityText={getValue() as string} />
				),
			},
			{
				accessorKey: 'body',
				cell: ({ getValue }) => (
					<LogBody query={query} body={getValue() as string} />
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
		<>
			{table.getRowModel().rows.map((row) => {
				return (
					<Fragment key={row.id}>
						<Stack direction="row" align="center">
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

						{row.getIsExpanded() && (
							<Stack>
								<Box>{renderSubComponent({ row })}</Box>
							</Stack>
						)}
					</Fragment>
				)
			})}
		</>
	)
}

export { LogsTable }
