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
				>
					<Text color="moderate">
						Try using a more generic search query or removing
						filters.
					</Text>

					{/*
					TODO: Uncomment and ensure the link is accurate once
					https://github.com/highlight/highlight/issues/4592 is resolved.
					<LinkButton
						trackingId="logs-empty-state_specification-docs"
						kind="secondary"
						to="https://www.highlight.io/docs/general/company/open-source/contributing/adding-an-sdk#Recording-a-Log"
						target="_blank"
					>
						Log search specification
					</LinkButton>
					*/}
				</Box>
			</Callout>
		</Box>
	)
}

export { NoLogsFound }
