import LoadingBox from '@components/LoadingBox'
import { GetLogsQuery } from '@graph/operations'
import { LogLine, SeverityText } from '@graph/schemas'
import {
	Box,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	Stack,
	Text,
} from '@highlight-run/ui'
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
import clsx from 'clsx'
import React, { Fragment, useState } from 'react'

import * as styles from './LogsTable.css'

type Props = {
	loading: boolean
	data: GetLogsQuery | undefined
	query: string
}

const renderSubComponent = ({ row }: { row: Row<LogLine> }) => {
	return (
		<Stack p="6" paddingBottom="0" gap="1">
			{Object.keys(row.original.logAttributes).map((key, index) => {
				const value =
					row.original.logAttributes[
						key as keyof typeof row.original.logAttributes
					]
				const isString = typeof value === 'string'
				const color = isString ? 'caution' : 'informative'

				return (
					<Box
						key={index}
						display="flex"
						alignItems="center"
						flexDirection="row"
						gap="10"
						py="8"
					>
						<Text family="monospace" weight="bold">
							"{key}":
						</Text>

						<Text family="monospace" weight="bold" color={color}>
							{JSON.stringify(value)}
						</Text>
					</Box>
				)
			})}
		</Stack>
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
							<Box display="flex" alignItems="center">
								{row.getIsExpanded() ? (
									<IconSolidCheveronDown />
								) : (
									<IconSolidCheveronRight />
								)}
							</Box>
						)}
						<LogTimestamp timestamp={getValue() as string} />
					</>
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
					>
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
							<Box>{renderSubComponent({ row })}</Box>
						)}
					</Box>
				)
			})}
		</Box>
	)
}

export { LogsTable }
