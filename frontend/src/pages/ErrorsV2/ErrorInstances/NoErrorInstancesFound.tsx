import { Box, Callout } from '@highlight-run/ui/components'

export const NoErrorInstancesFound = () => {
	return (
		<Box style={{ maxWidth: '300px' }} margin="auto" mb="20">
			<Callout title="No error instances found" />
		</Box>
	)
}
