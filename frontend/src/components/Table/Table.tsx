import { Table as UiTable, Box, Text, Stack } from '@highlight-run/ui/components'
import { CircularSpinner } from '@components/Loading/Loading'
import clsx from 'clsx'
import React from 'react'

import styles from './Table.module.css'

type Column = {
	title?: string
	dataIndex?: string
	key?: string
	render?: (value: any, record: any, index: number) => React.ReactNode
	width?: number | string
	sorter?: (a: any, b: any) => number
	align?: 'left' | 'center' | 'right'
}

type Props = {
	columns?: Column[]
	dataSource?: any[]
	loading?: boolean
	pagination?: false | object
	showHeader?: boolean
	onRow?: (record: any) => { onClick?: () => void; [key: string]: any }
	renderEmptyComponent?: React.ReactNode
	rowHasPadding?: boolean
	smallPadding?: boolean
	className?: string
}

const Table = ({
	renderEmptyComponent,
	rowHasPadding = false,
	smallPadding = false,
	columns,
	dataSource,
	loading,
	showHeader = true,
	onRow,
	...props
}: Props) => {
	if (loading) {
		return (
			<Box display="flex" justifyContent="center" p="16">
				<CircularSpinner />
			</Box>
		)
	}

	if (!dataSource || dataSource.length === 0) {
		return renderEmptyComponent ? <>{renderEmptyComponent}</> : null
	}

	return (
		<UiTable
			className={clsx(styles.table, {
				[styles.normalTableSizing]: !smallPadding,
				[styles.smallTableSizing]: smallPadding,
				[styles.rowHasPadding]: rowHasPadding,
				[styles.interactable]: !!onRow,
			}, props.className)}
		>
			{showHeader && columns && (
				<UiTable.Head>
					<UiTable.Row>
						{columns.map((col, i) => (
							<UiTable.Header key={col.key ?? col.dataIndex ?? i}>
								<Text size="small" weight="bold" color="strong">
									{col.title}
								</Text>
							</UiTable.Header>
						))}
					</UiTable.Row>
				</UiTable.Head>
			)}
			<UiTable.Body>
				{dataSource.map((record, rowIndex) => (
					<UiTable.Row
						key={record.key ?? record.id ?? rowIndex}
						{...(onRow ? { onClick: onRow(record).onClick } : {})}
					>
						{columns?.map((col, colIndex) => {
							const value = col.dataIndex
								? record[col.dataIndex]
								: undefined
							const rendered = col.render
								? col.render(value, record, rowIndex)
								: value
							return (
								<UiTable.Cell
									key={col.key ?? col.dataIndex ?? colIndex}
								>
									{rendered}
								</UiTable.Cell>
							)
						})}
					</UiTable.Row>
				))}
			</UiTable.Body>
		</UiTable>
	)
}

export default Table
