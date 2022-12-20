import { useAuthContext } from '@authentication/AuthContext'
import { Button, Callout, Stack, Text } from '@highlight-run/ui'
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
		<Callout title={`Couldn't find any relevant ${kind}`}>
			<Text>
				If you think something's wrong, feel free to reach out to us!
			</Text>
			<Stack direction="row" gap="8">
				<Button
					kind="secondary"
					onClick={() => showIntercom({ admin })}
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
				>
					Learn more
				</Button>
			</Stack>
		</Callout>
	)
}
