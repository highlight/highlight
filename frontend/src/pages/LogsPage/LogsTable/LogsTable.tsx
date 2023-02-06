import { LogLine } from '@graph/schemas'
import { Box, Stack, Text } from '@highlight-run/ui'
import SvgChevronDownIcon from '@icons/ChevronDownIcon'
import SvgChevronRightIcon from '@icons/ChevronRightIcon'
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

function padTo2Digits(num: number) {
	return num.toString().padStart(2, '0')
}

const toYearMonthDay = (timestamp: string) => {
	const date = new Date(timestamp)
	const year = date.getFullYear()
	const month = padTo2Digits(date.getMonth() + 1)
	const day = padTo2Digits(date.getDate())

	return `${year}-${month}-${day}`
}

type Props = {
	data: LogLine[]
}

const renderSubComponent = ({ row }: { row: Row<LogLine> }) => {
	return (
		<pre style={{ fontSize: '10px' }}>
			<code>{JSON.stringify(row.original, null, 2)}</code>
		</pre>
	)
}

const LogsTable = ({ data }: Props) => {
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
						<Text color="weak">
							{toYearMonthDay(getValue() as string)}
						</Text>
					</>
				),
			},
			{
				accessorKey: 'severityText',
				cell: ({ getValue }) => <Text>{getValue() as string}</Text>,
			},
			{
				accessorKey: 'body',
				cell: ({ getValue }) => (
					<Text lines="1">{getValue() as string}</Text>
				),
			},
		],
		[],
	)

	const table = useReactTable({
		data,
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
