import {
	Box,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Table,
	Text,
} from '@highlight-run/ui/components'
import React, { useMemo } from 'react'
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table'
import * as styles from '../MetricsPage.css'
import { ColumnRenderers, gridColumns } from './renderers'

interface MetricsTableProps {
	metrics: any[]
	sorting: SortingState
	setSorting: React.Dispatch<React.SetStateAction<SortingState>>
}

export const MetricsTable: React.FC<MetricsTableProps> = ({
	metrics,
	sorting,
	setSorting,
}) => {
	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				id: 'name',
				accessorKey: 'name',
				header: 'Metric Name',
				cell: (props) => flexRender(ColumnRenderers.metricName, props),
			},
			{
				id: 'lastConfigured',
				accessorKey: 'lastConfigured',
				header: 'Last Configured',
				cell: (props) =>
					flexRender(ColumnRenderers.lastConfigured, props),
			},
			{
				id: 'dataPoints',
				accessorKey: 'dataPoints',
				header: 'Data Points',
				cell: (props) => flexRender(ColumnRenderers.dataPoints, props),
			},
			{
				id: 'metricType',
				accessorKey: 'metricType',
				header: 'Metric Type',
				cell: (props) => flexRender(ColumnRenderers.metricType, props),
			},
			{
				id: 'serviceName',
				accessorKey: 'serviceName',
				header: 'Service Name',
				cell: (props) => flexRender(ColumnRenderers.serviceName, props),
			},
		],
		[],
	)

	const table = useReactTable({
		data: metrics,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	if (metrics.length === 0) {
		return (
			<Box p="8" textAlign="center">
				<Text color="weak">No metrics found</Text>
			</Box>
		)
	}

	return (
		<Table className={styles.metricsTable}>
			<Table.Head>
				{table.getHeaderGroups().map((headerGroup) => (
					<Table.Row key={headerGroup.id} gridColumns={gridColumns}>
						{headerGroup.headers.map((header) => {
							const isSorted = header.column.getIsSorted()
							return (
								<Table.Header
									key={header.id}
									onClick={header.column.getToggleSortingHandler()}
									style={{
										cursor: 'pointer',
									}}
								>
									<Box
										display="flex"
										alignItems="center"
										gap="2"
									>
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
										{isSorted &&
											(isSorted === 'asc' ? (
												<IconSolidCheveronUp
													size={12}
												/>
											) : (
												<IconSolidCheveronDown
													size={12}
												/>
											))}
									</Box>
								</Table.Header>
							)
						})}
					</Table.Row>
				))}
			</Table.Head>
			<Table.Body>
				{table.getRowModel().rows.map((row) => (
					<Table.Row key={row.id} gridColumns={gridColumns}>
						{row
							.getVisibleCells()
							.map((cell) =>
								flexRender(
									cell.column.columnDef.cell,
									cell.getContext(),
								),
							)}
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	)
}
