import Table from '@components/Table/Table'
import React from 'react'

import EmptyCardPlaceholder from '../../pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'
import styles from './ProgressBarTable.module.css'

type Column = {
	title?: string
	dataIndex?: string
	key?: string
	render?: (value: any, record: any, index: number) => React.ReactNode
	width?: number | string
	sorter?: (a: any, b: any) => number
}

interface Props {
	columns: Column[]
	data: any[]
	onClickHandler: (record: any) => void
	/** The string shown to the user when the table has no data. */
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
	return (
		<div className={styles.table}>
			<Table
				loading={loading}
				showHeader={false}
				columns={columns}
				dataSource={data}
				pagination={false}
				onRow={(record) => ({
					onClick: () => {
						onClickHandler(record)
					},
				})}
				renderEmptyComponent={
					<EmptyCardPlaceholder
						message={noDataMessage}
						title={noDataTitle}
					/>
				}
			/>
		</div>
	)
}

export default ProgressBarTable
