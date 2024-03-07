import { LinkButton } from '@components/LinkButton'
import { Box, Callout, Text } from '@highlight-run/ui/components'

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

					<LinkButton
						trackingId="logs-empty-state_specification-docs"
						kind="secondary"
						to="https://www.highlight.io/docs/general/product-features/general-features/search"
						target="_blank"
					>
						Log search specification
					</LinkButton>
				</Box>
			</Callout>
		</Box>
	)
}

export { NoLogsFound }
