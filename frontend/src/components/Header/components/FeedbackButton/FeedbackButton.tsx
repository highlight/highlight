import SvgMailIcon from '@icons/MailIcon'
import { isOnPrem } from '@util/onPrem/onPremUtils'
import { showIntercom } from '@util/window'
import React from 'react'

import { useAuthContext } from '../../../../routers/AuthenticationRolerouter/context/AuthContext'
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
								action: () => showIntercom({ admin }),
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

const FEEDBACK_URL = 'https://highlight.io/community'
