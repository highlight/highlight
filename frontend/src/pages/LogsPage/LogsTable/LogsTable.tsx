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

import * as styles from './LogsTable.css'

type Props = {
	loading: boolean
	data: GetLogsQuery | undefined
	query: string
}

export const LogsTable = ({ data, loading, query }: Props) => {
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

export const IconExpanded: React.FC = () => (
	<IconSolidCheveronDown color="#6F6E77" size="16" />
)

export const IconCollapsed: React.FC = () => (
	<IconSolidCheveronRight color="#6F6E77" size="16" />
)
