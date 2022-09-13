import { SessionCommentTextBody } from '@components/Comment/SessionComment/SessionComment'
import {
	DEMO_WORKSPACE_APPLICATION_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { ALERT_CONFIGURATIONS } from '@pages/Alerts/Alerts'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { Link } from 'react-router-dom'

import { PlayerSearchParameters } from '../../../../pages/Player/PlayerHook/utils'
import CommentTextBody from '../../../../pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import SvgMessageIcon from '../../../../static/MessageIcon'
import { AdminAvatar, Avatar } from '../../../Avatar/Avatar'
import Dot from '../../../Dot/Dot'
import RelativeTime from '../../../RelativeTime/RelativeTime'
import notificationStyles from '../Notification.module.scss'
import { NotificationType } from '../utils/utils'

interface Props {
	notification: any
	viewed: boolean
	onViewHandler: () => void
}

const CommentNotification = ({
	notification,
	onViewHandler,
	viewed,
}: Props) => {
	const { project_id } = useParams<{ project_id: string }>()
	const projectIdRemapped =
		project_id === DEMO_WORKSPACE_APPLICATION_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id

	return (
		<Link
			className={notificationStyles.notification}
			to={getLink(notification, projectIdRemapped)}
			onClick={onViewHandler}
		>
			<div className={notificationStyles.notificationStartColumn}>
				<div className={notificationStyles.notificationIconContainer}>
					{getIcon(notification.type)}
				</div>

				{getAvatar(notification)}
			</div>
			<div className={notificationStyles.notificationBody}>
				<h3 className={notificationStyles.title}>
					{getTitle(notification)}
				</h3>
				<p className={notificationStyles.timestamp}>
					<RelativeTime datetime={notification?.updated_at} />
				</p>
				{notification.type === NotificationType.SessionComment ? (
					<SessionCommentTextBody comment={notification} />
				) : (
					<CommentTextBody commentText={notification?.text || ''} />
				)}
			</div>
			<div className={notificationStyles.dotContainer}>
				{!viewed && <Dot />}
			</div>
		</Link>
	)
}

export default CommentNotification

const getIcon = (type: NotificationType) => {
	switch (type) {
		case NotificationType.ErrorComment:
			return ALERT_CONFIGURATIONS['ERROR_ALERT'].icon
		case NotificationType.SessionComment:
			return <SvgMessageIcon />
		case NotificationType.SessionFeedback:
			return ALERT_CONFIGURATIONS['SESSION_FEEDBACK_ALERT'].icon
	}
}

const getAvatar = (notification: any) => {
	switch (notification.type) {
		case NotificationType.ErrorComment:
		case NotificationType.SessionComment:
			return <AdminAvatar adminInfo={notification.author} size={30} />
		case NotificationType.SessionFeedback:
			return (
				<Avatar
					seed={
						notification?.metadata?.name ||
						notification?.metadata?.email ||
						'Anonymous'
					}
					style={{
						height: 30,
						width: 30,
					}}
				/>
			)
	}
}

const getTitle = (notification: any): React.ReactNode => {
	let notificationAuthor =
		notification?.author.name || notification?.author.email
	let suffix = 'commented'

	switch (notification.type as NotificationType) {
		case NotificationType.ErrorComment:
			suffix = 'commented on an error'
			break
		case NotificationType.SessionComment:
			suffix = 'commented on a session'
			break
		case NotificationType.SessionFeedback:
			notificationAuthor =
				notification?.metadata?.name ||
				notification?.metadata?.email?.split('@')[0] ||
				'Anonymous'
			suffix = 'left feedback'
			break
	}

	return (
		<>
			{notificationAuthor}{' '}
			<span className={notificationStyles.titleSuffix}>{suffix}</span>
		</>
	)
}

const getLink = (notification: any, project_id: string) => {
	const baseUrl = `/${project_id}`

	switch (notification.type as NotificationType) {
		case NotificationType.ErrorComment:
			return `${baseUrl}/errors/${notification.error_secure_id}`
		case NotificationType.SessionComment:
			return `${baseUrl}/sessions/${notification.session_secure_id}?${
				PlayerSearchParameters.commentId
			}=${notification.id}&${PlayerSearchParameters.ts}=${
				notification.timestamp / 1000
			}`
		case NotificationType.SessionFeedback:
			return `${baseUrl}/sessions/${notification.session_secure_id}?${PlayerSearchParameters.commentId}=${notification.id}`
		default:
			return `/`
	}
}
