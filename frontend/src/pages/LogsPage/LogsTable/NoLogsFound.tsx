import { Box, Callout, Text } from '@highlight-run/ui'
import React from 'react'

const NoLogsFound = () => {
	return (
		<Box style={{ maxWidth: '300px' }}>
			<Callout title="No matching logs found">
				<Box
					display="flex"
					flexDirection="column"
					gap="16"
					alignItems="flex-start"
					mb="6"
				>
					<Text color="moderate">
						Try using a more generic search query or removing
						filters.
					</Text>
				</Box>
			</Callout>
		</Box>
	)
}

export { NoLogsFound }
