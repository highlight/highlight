import { ConfigProvider, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import React from 'react'

import EmptyCardPlaceholder from '../../pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'
import styles from './ProgressBarTable.module.scss'

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
		<ConfigProvider
			renderEmpty={() => (
				<EmptyCardPlaceholder
					message={noDataMessage}
					title={noDataTitle}
				/>
			)}
		>
			<Table
				className={styles.table}
				loading={loading}
				scroll={{ y: 287 }}
				showHeader={false}
				columns={columns}
				dataSource={data}
				pagination={false}
				onRow={(record) => ({
					onClick: () => {
						onClickHandler(record)
					},
				})}
			/>
		</ConfigProvider>
	)
}

export default ProgressBarTable
