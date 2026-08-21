import React from 'react'

import EmptyCardPlaceholder from '../../pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'
import styles from './ProgressBarTable.module.css'

type ProgressBarTableColumn<TRecord extends Record<string, any>> = {
	dataIndex?: keyof TRecord | string
	key?: React.Key
	render?: (value: any, record: TRecord, index: number) => React.ReactNode
	title?: React.ReactNode
	width?: React.CSSProperties['width']
}

interface Props<TRecord extends Record<string, any>> {
	columns: ProgressBarTableColumn<TRecord>[]
	data: TRecord[]
	onClickHandler: (record: TRecord) => void
	/** The string shown to the user when the table has no data. */
	noDataMessage?: string | React.ReactNode
	noDataTitle?: string
	loading: boolean
}

const ProgressBarTable = <TRecord extends Record<string, any>>({
	columns,
	data,
	onClickHandler,
	noDataMessage,
	noDataTitle,
	loading,
}: Props<TRecord>) => {
	const handleRowKeyDown = (
		event: React.KeyboardEvent<HTMLTableRowElement>,
		record: TRecord,
	) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			onClickHandler(record)
		}
	}

	if (loading) {
		return <div className={styles.loadingState}>Loading...</div>
	}

	if (!data.length) {
		return (
			<div className={styles.emptyState}>
				<EmptyCardPlaceholder
					message={noDataMessage}
					title={noDataTitle}
				/>
			</div>
		)
	}

	return (
		<div className={styles.tableFrame}>
			<table className={styles.table}>
				<tbody>
					{data.map((record, index) => (
						<tr
							key={String(record.key ?? index)}
							onClick={() => onClickHandler(record)}
							onKeyDown={(event) =>
								handleRowKeyDown(event, record)
							}
							role="button"
							tabIndex={0}
						>
							{columns.map((column, columnIndex) => {
								const dataIndex =
									typeof column.dataIndex === 'string'
										? column.dataIndex
										: String(column.dataIndex ?? '')
								const value = dataIndex
									? record[dataIndex]
									: undefined

								return (
									<td
										key={String(
											column.key ??
												column.dataIndex ??
												columnIndex,
										)}
										style={{ width: column.width }}
									>
										{column.render
											? column.render(
													value,
													record,
													index,
												)
											: String(value ?? '')}
									</td>
								)
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default ProgressBarTable
