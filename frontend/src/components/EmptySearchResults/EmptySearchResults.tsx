import { Button } from '@components/Button'
import { Callout, Stack, Text } from '@highlight-run/ui/components'

export enum SearchResultsKind {
	Errors = 'errors',
	Sessions = 'sessions',
}

interface Props {
	kind: SearchResultsKind
}

export const EmptySearchResults = ({ kind }: Props) => {
	return (
		<Callout title={`Couldn't find any relevant ${kind}`} icon={false}>
			<Text color="moderate">
				If you think something's wrong, feel free to reach out to us!
			</Text>

			<Stack direction="row" gap="8">
				<Button
					kind="secondary"
					emphasis="low"
					onClick={() => {
						const url =
							kind === SearchResultsKind.Errors
								? 'https://www.highlight.io/docs/general/product-features/error-monitoring/error-search'
								: 'https://www.highlight.io/docs/general/product-features/session-replay/session-search'

						window.open(url, '_blank')
					}}
					trackingId="emptySearchResultsLearnMore"
				>
					Learn more
				</Button>
			</Stack>
		</Callout>
	)
}
