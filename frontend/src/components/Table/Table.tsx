import { CircularSpinner } from '@components/Loading/Loading'
import { ConfigProvider, Table as AntDesignTable, TableProps } from 'antd'
import React from 'react'

import styles from './Table.module.scss'

type Props = Pick<
	TableProps<any>,
	'columns' | 'dataSource' | 'loading' | 'pagination' | 'showHeader' | 'onRow'
> & {
	renderEmptyComponent?: React.ReactNode
	rowHasPadding?: boolean
	smallPadding?: boolean
}

const Table = ({
	renderEmptyComponent,
	rowHasPadding = false,
	smallPadding = false,
	...props
}: Props) => {
	return (
		<ConfigProvider
			renderEmpty={() => {
				if (props.loading) {
					return null
				}
				return renderEmptyComponent || null
			}}
		>
			<AntDesignTable
				{...props}
				className={clsx(styles.table, {
					[styles.normalTableSizing]: !smallPadding,
					[styles.smallTableSizing]: smallPadding,
					[styles.rowHasPadding]: rowHasPadding,
					[styles.interactable]: !!props.onRow,
				})}
				loading={
					props.loading ? { indicator: <CircularSpinner /> } : false
				}
			/>
		</ConfigProvider>
	)
}

export default Table
