import { Box, Callout, Text } from '@highlight-run/ui'

import { LinkButton } from '@/components/LinkButton'
import { ErrorObjectFragment } from '@/graph/generated/operations'
import { SessionExcludedReason } from '@/graph/generated/schemas'
import { useProjectId } from '@/hooks/useProjectId'

type Props = {
	errorObject?: ErrorObjectFragment
}

const getSession = ({ errorObject }: Props) => {
	return errorObject?.session
}

const showProjectSettingsButton = ({ errorObject }: Props) => {
	return (
		errorObject?.session?.excluded_reason ===
			SessionExcludedReason.IgnoredUser ||
		errorObject?.session?.excluded_reason === SessionExcludedReason.NoError
	)
}

const getLearnMoreLink = ({ errorObject }: Props) => {
	const session = getSession({ errorObject })
	if (!session) {
		return 'https://www.highlight.io/docs/getting-started/frontend-backend-mapping'
	}

	const excludedReason = session.excluded_reason

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

const getReason = ({ errorObject }: Props) => {
	const session = getSession({ errorObject })
	if (!session) {
		return "We weren't able to match this error to a session. This error was either thrown in isolation or you aren't mapping errors to sessions."
	}

	const excludedReason = session.excluded_reason

	switch (excludedReason) {
		case SessionExcludedReason.Initializing:
		case SessionExcludedReason.NoActivity:
		case SessionExcludedReason.NoUserInteractionEvents: {
			return 'There was no activity for this session.'
		}
		case SessionExcludedReason.NoError: {
			return 'There was no error for this session and was filtered out by your project settings.'
		}
		case SessionExcludedReason.IgnoredUser: {
			return 'This session was ignored since the user was excluded by your project settings.'
		}
		default:
			return "We weren't able to match this error to a session."
	}
}

export const ErrorSessionMissingOrExcluded = ({ errorObject }: Props) => {
	const session = getSession({ errorObject })
	const learnMoreLink = getLearnMoreLink({ errorObject })
	const { projectId } = useProjectId()

	const backendSDKSetupButton = (
		<LinkButton
			kind="secondary"
			to={`/${projectId}/setup/backend`}
			trackingId="error-mapping-setup"
			target="_blank"
		>
			Backend SDK setup
		</LinkButton>
	)

	const projectSettings = (
		<LinkButton
			kind="secondary"
			to={`/${projectId}/settings/sessions`}
			trackingId="project-settings"
			target="_blank"
		>
			Project Settings
		</LinkButton>
	)

	return (
		<>
			<Callout title="We didn't find a session for this error">
				<Box>
					<Text size="small" weight="medium" color="moderate">
						{getReason({ errorObject })}
					</Text>
				</Box>
				<Box display="flex">
					{!session && backendSDKSetupButton}
					{showProjectSettingsButton({ errorObject }) &&
						projectSettings}
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
