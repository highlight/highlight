import React from 'react'

import EmptyCardPlaceholder from '../../pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'
import Table, { ColumnsType } from '../Table/Table'
import styles from './ProgressBarTable.module.css'

interface Props {
	columns: ColumnsType<any>
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
		<Table
			className={styles.table}
			loading={loading}
			showHeader={false}
			columns={columns}
			dataSource={data}
			pagination={false}
			renderEmptyComponent={
				<EmptyCardPlaceholder
					message={noDataMessage}
					title={noDataTitle}
				/>
			}
			onRow={(record) => ({
				onClick: () => {
					onClickHandler(record)
				},
			})}
		/>
	)
}

export default ProgressBarTable
