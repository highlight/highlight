import { CircularSpinner } from '@components/Loading/Loading'
import clsx from 'clsx'
import React from 'react'

import styles from './Table.module.css'

export type ColumnType<T> = {
	title?: React.ReactNode
	dataIndex?: string
	key?: string
	render?: (value: any, record: T, index: number) => React.ReactNode
	width?: number | string
}

type Props<T = any> = {
	columns?: ColumnType<T>[]
	dataSource?: T[]
	loading?: boolean
	pagination?: false | object
	showHeader?: boolean
	onRow?: (record: T, index?: number) => React.HTMLAttributes<HTMLElement>
	renderEmptyComponent?: React.ReactNode
	rowHasPadding?: boolean
	smallPadding?: boolean
}

function Table<T extends object = any>({
	columns = [],
	dataSource = [],
	loading = false,
	showHeader = true,
	onRow,
	renderEmptyComponent,
	rowHasPadding = false,
	smallPadding = false,
}: Props<T>) {
	if (loading) {
		return (
			<div className={styles.table} style={{ padding: 16, textAlign: 'center' }}>
				<CircularSpinner />
			</div>
		)
	}

	if (!dataSource.length && renderEmptyComponent) {
		return <div className={styles.table}>{renderEmptyComponent}</div>
	}

	return (
		<table
			className={clsx(styles.table, {
				[styles.normalTableSizing]: !smallPadding,
				[styles.smallTableSizing]: smallPadding,
				[styles.rowHasPadding]: rowHasPadding,
				[styles.interactable]: !!onRow,
			})}
		>
			{showHeader && (
				<thead>
					<tr>
						{columns.map((col, i) => (
							<th key={col.key ?? col.dataIndex ?? i} style={{ width: col.width }}>
								{col.title}
							</th>
						))}
					</tr>
				</thead>
			)}
			<tbody>
				{dataSource.map((record, rowIndex) => {
					const rowProps = onRow ? onRow(record, rowIndex) : {}
					return (
						<tr key={rowIndex} {...(rowProps as React.HTMLAttributes<HTMLTableRowElement>)}>
							{columns.map((col, colIndex) => {
								const value = col.dataIndex
									? (record as any)[col.dataIndex]
									: undefined
								return (
									<td key={col.key ?? col.dataIndex ?? colIndex}>
										{col.render
											? col.render(value, record, rowIndex)
											: value}
									</td>
								)
							})}
						</tr>
					)
				})}
			</tbody>
		</table>
	)
}

export default Table
