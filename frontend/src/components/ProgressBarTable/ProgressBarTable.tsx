import { Box, Table } from '@highlight-run/ui/components'
import React from 'react'

import EmptyCardPlaceholder from '../../pages/Home/components/EmptyCardPlaceholder/EmptyCardPlaceholder'

interface Props {
	columns: any[]
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
	if (loading) {
		return (
			<Box p="24" display="flex" justifyContent="center">
				Loading...
			</Box>
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
		<Table noBorder>
			<Table.Body>
				{data.map((record, index) => (
					<Table.Row
						key={record.key || index}
						onClick={() => onClickHandler(record)}
					>
						{columns.map((column) => (
							<Table.Cell key={column.key}>
								{column.render
									? column.render(
											record[column.dataIndex],
											record,
									  )
									: record[column.dataIndex]}
							</Table.Cell>
						))}
					</Table.Row>
				))}
			</Table.Body>
		</Table>
	)
}

export default ProgressBarTable
