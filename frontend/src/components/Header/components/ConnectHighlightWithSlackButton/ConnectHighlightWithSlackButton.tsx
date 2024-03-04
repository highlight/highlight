import { LinkButton } from '@/components/LinkButton'

import { useAuthContext } from '../../../../authentication/AuthContext'
import { useSlackBot } from './utils/utils'

const ConnectHighlightWithSlackButton = () => {
	const { isLoggedIn } = useAuthContext()
	const { slackUrl: slackBotUrl, isSlackConnectedToWorkspace } = useSlackBot()

	if (isSlackConnectedToWorkspace) return null

	return (
		<LinkButton
			to={slackBotUrl}
			kind="primary"
			trackingId="ConnectHighlightWithSlackButton"
			disabled={!isLoggedIn}
		>
			Connect Highlight with Slack
		</LinkButton>
	)
}

export default ConnectHighlightWithSlackButton
