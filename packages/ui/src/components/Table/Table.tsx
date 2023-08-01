import React, { useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'

type RowFormat = {
	alignment?: 'left' | 'center' | 'right'
	size?: string // pixels or percentage as a string
	grow?: number // 0 is fixed, 1+ determines relative growth
}

type Column = {
	name: string
	render: (row: Row) => React.ReactNode
	rowFormat: RowFormat
}

type Row = {
	id: string
	[key: string]: any
}

type Props = {
	columns: Column[]
	rows?: Row[]
	loading?: boolean
	error?: string
}

export const Table: React.FC<Props> = ({ loading, error, rows, columns }) => {
	const virtuoso = useRef<VirtuosoHandle>(null)

	return (
		<Box className={styles.container}>
			<Box className={styles.header}>
				{columns.map((column) => (
					<Text color="n11" key={column.name}>
						{column.name}
					</Text>
				))}
			</Box>
			{loading && 'Loading...'}
			{!!error && error}
			{rows?.length && (
				<Box className={styles.resultsContainer}>
					<Virtuoso
						ref={virtuoso}
						data={rows}
						itemContent={(_, row) => (
							<Box key={row.id}>
								<Box
									borderBottom="dividerWeak"
									display="flex"
									flexDirection="row"
									gap="24"
								>
									{columns.map((column) => (
										<Box
											key={column.name}
											display="flex"
											// justifySelf={
											// 	column?.rowFormat?.alignment ||
											// 	'center'
											// }
										>
											{column.render(row)}
										</Box>
									))}
								</Box>
							</Box>
						)}
					/>
				</Box>
			)}
		</Box>
	)
}
