import { Box, Callout, Text } from '@highlight-run/ui'

import { LinkButton } from '@/components/LinkButton'
import { Maybe, SessionExcludedReason } from '@/graph/generated/schemas'

type Props = {
	excludedReason: Maybe<SessionExcludedReason> | undefined
}

const getLearnMoreLink = ({ excludedReason }: Props) => {
	switch (excludedReason) {
		case SessionExcludedReason.NoError: {
			return 'https://www.highlight.io/docs/general/product-features/session-replay/ignoring-sessions#ignoring-sessions-without-an-error'
		}
		case SessionExcludedReason.IgnoredUser: {
			return 'https://www.highlight.io/docs/general/product-features/session-replay/ignoring-sessions#ignore-sessions-by-user-identifier'
		}
		default:
			return null
	}
}

const getReason = ({ excludedReason }: Props) => {
	switch (excludedReason) {
		case SessionExcludedReason.Initializing:
		case SessionExcludedReason.NoActivity:
		case SessionExcludedReason.NoUserInteractionEvents: {
			return 'There was no activity for this session.'
		}
		case SessionExcludedReason.NoError: {
			return 'There was no error for this session.'
		}
		case SessionExcludedReason.IgnoredUser: {
			return 'This session was ignored since the user was excluded.'
		}
		default:
			return "We weren't able to match this error to a session."
	}
}

export const ErrorSessionExcluded = ({ excludedReason }: Props) => {
	const learnMoreLink = getLearnMoreLink({ excludedReason })

	return (
		<>
			<Callout title="We didn't find a session for this error">
				<Box>
					<Text size="small" weight="medium" color="moderate">
						{getReason({ excludedReason })}
					</Text>
				</Box>
				<Box display="flex">
					{learnMoreLink && (
						<LinkButton
							kind="secondary"
							to={learnMoreLink}
							trackingId="session-ignoring-docs"
							emphasis="low"
							target="_blank"
						>
							Learn more
						</LinkButton>
					)}
				</Box>
			</Callout>
		</>
	)
}
