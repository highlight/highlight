import React, { useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'

type Props = {
	columns: any[]
	data?: any[]
	loading: boolean
	error: any
}

export const Table: React.FC<Props> = ({ loading, error, data, columns }) => {
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
			{error && error.message}
			{data?.length && (
				<Box className={styles.resultsContainer}>
					<Virtuoso
						ref={virtuoso}
						data={data}
						itemContent={(_, service) => (
							<Box key={service.id}>
								<Box
									borderBottom="dividerWeak"
									display="flex"
									flexDirection="row"
									gap="24"
								>
									{columns.map((column) =>
										column.render(service),
									)}
								</Box>
							</Box>
						)}
					/>
				</Box>
			)}
		</Box>
	)
}
