import { useAuthContext } from '@authentication/AuthContext'
import { Button } from '@components/Button'
import { Callout, Stack, Text } from '@highlight-run/ui'
import { showIntercom } from '@util/window'

export enum SearchResultsKind {
	Errors = 'errors',
	Sessions = 'sessions',
}

interface Props {
	kind: SearchResultsKind
}

export const EmptySearchResults = ({ kind }: Props) => {
	const { admin } = useAuthContext()

	return (
		<Callout title={`Couldn't find any relevant ${kind}`} icon={false}>
			<Text color="moderate">
				If you think something's wrong, feel free to reach out to us!
			</Text>

			<Stack direction="row" gap="8">
				<Button
					kind="secondary"
					onClick={() => showIntercom({ admin })}
					trackingId="emptySearchResultsContact"
				>
					Contact
				</Button>

				<Button
					kind="secondary"
					emphasis="low"
					onClick={() => {
						const url =
							kind === SearchResultsKind.Errors
								? 'https://www.highlight.io/docs/error-monitoring/grouping-errors'
								: 'https://www.highlight.io/docs/product-features/session-search'

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
