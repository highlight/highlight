import { CircularSpinner } from '@components/Loading/Loading'
import React from 'react'

import EmptyCardPlaceholder from '../../pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'
import styles from './ProgressBarTable.module.css'

interface Column {
	title: string
	dataIndex: string
	key: string
	width?: string
	render?: (value: any, record: any) => React.ReactNode
}

interface Props {
	columns: Column[]
	data: any[]
	onClickHandler: (record: any) => void
	noDataMessage?: string | React.ReactNode
	noDataTitle?: string
	loading: boolean
}

const ProgressBarTable = ({
	columns,
	data,
	onClickHandler,
	noDataMessage,
	noDataTitle,
	loading,
}: Props) => {
	if (loading) {
		return (
			<div className={styles.loadingContainer}>
				<CircularSpinner />
			</div>
		)
	}

	if (!data || data.length === 0) {
		return (
			<div className={styles.emptyContainer}>
				<EmptyCardPlaceholder
					message={noDataMessage}
					title={noDataTitle}
				/>
			</div>
		)
	}

	return (
		<div className={styles.scrollContainer}>
			<table className={styles.table}>
				<tbody>
					{data.map((record: any, rowIndex: number) => (
						<tr
							key={record.key || rowIndex}
							className={styles.row}
							onClick={() => onClickHandler(record)}
						>
							{columns.map((col) => (
								<td key={col.key} className={styles.cell}>
									{col.render
										? col.render(record[col.dataIndex], record)
										: record[col.dataIndex]}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default ProgressBarTable
