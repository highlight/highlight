import { Box, Callout, Stack, Text } from '@highlight-run/ui/components'
import { LinkButton } from '@components/LinkButton'
import React from 'react'

export const NoTracesFound = ({
	integrated,
	hasQuery,
}: {
	integrated: boolean
	hasQuery: boolean
}) => {
	return (
		<Box m="8">
			<Callout>
				<Stack
					direction={{ desktop: 'row', mobile: 'column' }}
					justifyContent={{
						desktop: 'space-between',
						mobile: 'flex-start',
					}}
					align={{ desktop: 'center', mobile: 'flex-start' }}
				>
					{!integrated ? (
						<>
							<Stack gap="12" my="6">
								<Text weight="bold" size="medium">
									Set up traces
								</Text>
								<Text color="moderate">
									No traces found. Have you finished setting
									up tracing in your app yet?
								</Text>
							</Stack>

							<LinkButton
								to="https://www.highlight.io/docs/getting-started/native-opentelemetry/tracing"
								kind="primary"
								size="small"
								trackingId="tracing-empty-state_learn-more-setup"
								target="_blank"
							>
								Learn more
							</LinkButton>
						</>
					) : (
						<>
							<Stack gap="12" my="6">
								<Text weight="bold" size="medium">
									No traces found
								</Text>
								<Text color="moderate">
									{hasQuery ? (
										<>
											No traces found for the current
											search query. Try using a more
											generic search query, removing
											filters, or updating the time range
											to see more traces.
										</>
									) : (
										<>
											No traces found. Try updating your
											time range to see more traces.
										</>
									)}
								</Text>
							</Stack>

							<LinkButton
								trackingId="traces-empty-state_specification-docs"
								kind="secondary"
								to="https://www.highlight.io/docs/general/product-features/general-features/search"
								target="_blank"
							>
								View search docs
							</LinkButton>
						</>
					)}
				</Stack>
			</Callout>
		</Box>
	)
}
