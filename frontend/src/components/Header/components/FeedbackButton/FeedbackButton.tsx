import SvgMailIcon from '@icons/MailIcon'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { H } from 'highlight.run'
import React from 'react'

import { useAuthContext } from '../../../../authentication/AuthContext'
import SvgAnnotationDotsIcon from '../../../../static/AnnotationDotsIcon'
import SvgBugIcon from '../../../../static/BugIcon'
import SvgPlusIcon from '../../../../static/PlusIcon'
import Button from '../../../Button/Button/Button'
import PopoverMenu from '../../../PopoverMenu/PopoverMenu'
import styles from './FeedbackButton.module.scss'

const FeedbackButton = () => {
	const { admin } = useAuthContext()

	return (
		<PopoverMenu
			menuItems={[
				...(!isOnPrem
					? [
							{
								displayName: 'Bug Report',
								icon: <SvgBugIcon />,
								action: async () => {
									const sessionId = await H.getSessionURL()

									window.Intercom('boot', {
										app_id: 'gm6369ty',
										alignment: 'right',
										hide_default_launcher: true,
										email: admin?.email,
										sessionId,
									})
									window.Intercom('showNewMessage')
								},
							},
					  ]
					: []),
				{
					displayName: 'Feature Request',
					icon: <SvgPlusIcon />,
					link: FEEDBACK_URL,
				},
				{
					displayName: 'Email Us',
					icon: <SvgMailIcon />,
					link: 'mailto:support@highlight.run',
				},
			]}
			buttonTrackingId="feedbackButton"
			buttonContentsOverride={
				<Button
					className={styles.feedbackButton}
					trackingId="feedbackButton"
				>
					<SvgAnnotationDotsIcon />
					Got feedback?
				</Button>
			}
		></PopoverMenu>
	)
}

export default FeedbackButton

const FEEDBACK_URL = 'https://feedback.highlight.run/feature-requests'
