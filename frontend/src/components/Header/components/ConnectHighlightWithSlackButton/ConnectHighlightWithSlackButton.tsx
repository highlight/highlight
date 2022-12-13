import classNames from 'classnames'
import React from 'react'

import { useAuthContext } from '../../../../authentication/AuthContext'
import Button, {
	GenericHighlightButtonProps,
} from '../../../Button/Button/Button'
import styles from './ConnectHighlightWithSlackButton.module.scss'
import { useSlackBot } from './utils/utils'

type Props = Pick<GenericHighlightButtonProps, 'className' | 'style'>

const ConnectHighlightWithSlackButton = ({ className, style }: Props) => {
	const { isLoggedIn } = useAuthContext()

	const { slackUrl: slackBotUrl, isSlackConnectedToWorkspace } = useSlackBot()

	if (!isLoggedIn || isSlackConnectedToWorkspace) return null

	return (
		<Button
			className={classNames(
				className,
				styles.connectHighlightWithSlackButton,
			)}
			type="primary"
			trackingId="ConnectHighlightWithSlackButton"
			href={slackBotUrl}
			style={style}
		>
			{'Connect Highlight with Slack'}
		</Button>
	)
}

export default ConnectHighlightWithSlackButton
