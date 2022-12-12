import classNames from 'classnames'
import React from 'react'

import Button, {
	GenericHighlightButtonProps,
} from '../../../Button/Button/Button'
import { useAuthContext } from './../../../../authentication/AuthContext'
import styles from './PersonalNotificationButton.module.scss'
import { useSlackBot } from './utils/utils'

type Props = { text: string } & Pick<
	GenericHighlightButtonProps,
	'className' | 'style'
>

const PersonalNotificationButton = ({ className, style, text }: Props) => {
	const { isLoggedIn } = useAuthContext()

	const { slackUrl: slackBotUrl, isSlackConnectedToWorkspace } = useSlackBot()

	if (!isLoggedIn || isSlackConnectedToWorkspace) return null

	return (
		<Button
			className={classNames(className, styles.personalNotificationButton)}
			type="primary"
			trackingId="EnablePersonalNotificationButton"
			href={slackBotUrl}
			style={style}
		>
			{text}
		</Button>
	)
}

export default PersonalNotificationButton
