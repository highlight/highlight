import { CircularSpinner } from '@components/Loading/Loading'
import { Table } from '@highlight-run/ui/components'
import React from 'react'

import EmptyCardPlaceholder from '../../pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'
import styles from './ProgressBarTable.module.css'

interface Props {
	data: any[]
	onClickHandler: (record: any) => void
	/** The string shown to the user when the table has no data. */
	noDataMessage?: string | React.ReactNode
	noDataTitle?: string
	loading: boolean
}

const ProgressBarTable = ({
	data,
	onClickHandler,
	noDataMessage,
	noDataTitle,
	loading,
}: Props) => {
	if (loading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
				<CircularSpinner />
			</div>
		)
	}

	if (!data || data.length === 0) {
		return (
			<EmptyCardPlaceholder
				message={noDataMessage}
				title={noDataTitle}
			/>
		)
	}

	return (
		<div style={{ height: 287, overflowY: 'auto' }}>
			<Table className={styles.table} noBorder>
				<Table.Body>
					{data.map((record, i) => (
						<Table.Row key={record.key || i} onClick={() => onClickHandler(record)}>
							<Table.Cell>
								<div className={styles.listRow}>{record.file || record.key}</div>
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</div>
	)
}

export default ProgressBarTable
