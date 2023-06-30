import { Box, Callout, Text } from '@highlight-run/ui'

export const NoErrorInstancesFound = () => {
	return (
		<Box style={{ maxWidth: '300px' }}>
			<Callout title="No error instances found">
				<Box
					display="flex"
					flexDirection="column"
					gap="16"
					alignItems="flex-start"
				>
					<Text color="moderate">
						This is a bug. Please reach out to us to report an
						issue.
					</Text>
				</Box>
			</Callout>
		</Box>
	)
}
