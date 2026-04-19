import { CircularSpinner } from '@components/Loading/Loading'
import { Table as HLTable } from '@highlight-run/ui/components'
import clsx from 'clsx'
import React from 'react'

import styles from './Table.module.css'

export type ColumnType<T = any> = {
	key?: React.Key
	title?: React.ReactNode
	dataIndex?: string | string[]
	render?: (value: any, record: T, index: number) => React.ReactNode
	width?: string | number
	align?: 'left' | 'right' | 'center'
	className?: string
}

export type ColumnsType<T = any> = ColumnType<T>[]

type Props = {
	columns?: ColumnsType<any>
	dataSource?: any[]
	loading?: boolean
	pagination?: false | object
	showHeader?: boolean
	onRow?: (record: any, index?: number) => React.HTMLAttributes<HTMLElement>
	renderEmptyComponent?: React.ReactNode
	rowHasPadding?: boolean
	smallPadding?: boolean
	className?: string
}

const getColumnValue = (record: any, dataIndex?: string | string[]): any => {
	if (!dataIndex) return undefined
	if (Array.isArray(dataIndex)) {
		return dataIndex.reduce(
			(obj, key) => (obj != null ? obj[key] : undefined),
			record,
		)
	}
	return record[dataIndex]
}

const buildGridColumns = (columns?: ColumnsType<any>): string[] | undefined => {
	if (!columns || columns.length === 0) return undefined
	return columns.map((col) => (col.width ? String(col.width) : '1fr'))
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
	className,
}: Props) => {
	const gridColumns = buildGridColumns(columns)

	const isInteractable = !!onRow

	return (
		<HLTable
			className={clsx(
				styles.table,
				{
					[styles.normalTableSizing]: !smallPadding,
					[styles.smallTableSizing]: smallPadding,
					[styles.rowHasPadding]: rowHasPadding,
					[styles.interactable]: isInteractable,
				},
				className,
			)}
		>
			{showHeader && columns && columns.length > 0 && (
				<HLTable.Head>
					<HLTable.Row gridColumns={gridColumns}>
						{columns.map((col, i) => (
							<HLTable.Header
								key={String(col.key ?? col.dataIndex ?? i)}
							>
								{col.title}
							</HLTable.Header>
						))}
					</HLTable.Row>
				</HLTable.Head>
			)}
			<HLTable.Body>
				{loading ? (
					<HLTable.FullRow>
						<div className={styles.loadingWrapper}>
							<CircularSpinner />
						</div>
					</HLTable.FullRow>
				) : !dataSource || dataSource.length === 0 ? (
					renderEmptyComponent ? (
						<HLTable.FullRow>
							{renderEmptyComponent}
						</HLTable.FullRow>
					) : null
				) : (
					dataSource.map((record, i) => {
						const rowProps = onRow?.(record, i) ?? {}
						return (
							<HLTable.Row
								key={record.key ?? i}
								gridColumns={gridColumns}
								onClick={
									rowProps.onClick as
										| React.MouseEventHandler<HTMLDivElement>
										| undefined
								}
							>
								{columns?.map((col, j) => (
									<HLTable.Cell
										key={String(
											col.key ?? col.dataIndex ?? j,
										)}
										style={
											col.align
												? { textAlign: col.align }
												: undefined
										}
									>
										{col.render
											? col.render(
													getColumnValue(
														record,
														col.dataIndex,
													),
													record,
													i,
												)
											: getColumnValue(
													record,
													col.dataIndex,
												)}
									</HLTable.Cell>
								))}
							</HLTable.Row>
						)
					})
				)}
			</HLTable.Body>
		</HLTable>
	)
}

export default Table
