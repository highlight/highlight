import { SessionCommentType } from '@graph/schemas'

import { GetNotificationsQuery } from '../../../../graph/generated/operations'

export enum NotificationType {
	ErrorComment,
	SessionComment,
	SessionFeedback,
}

export const processNotifications = ({
	error_comments_for_project,
	session_comments_for_project,
}: GetNotificationsQuery) => {
	const errorCommentNotifications = error_comments_for_project.map(
		(errorComment) => ({
			...errorComment,
			type: NotificationType.ErrorComment,
		}),
	)

	const sessionComments = session_comments_for_project.filter(
		(comment) => comment?.type === SessionCommentType.Admin,
	)
	const sessionFeedback = session_comments_for_project.filter(
		(comment) => comment?.type === SessionCommentType.Feedback,
	)
	const sessionAdminCommentNotifications = sessionComments.map(
		(sessionComment) => ({
			...sessionComment,
			type: NotificationType.SessionComment,
		}),
	)
	const sessionFeedbackCommentNotifications = sessionFeedback.map(
		(sessionComment) => ({
			...sessionComment,
			type: NotificationType.SessionFeedback,
		}),
	)
	const allNotifications: any[] = [
		...errorCommentNotifications,
		...sessionAdminCommentNotifications,
		...sessionFeedbackCommentNotifications,
	]

	const sortedNotificationsDescending = allNotifications.sort((a, b) => {
		return (
			new Date(b?.updated_at || 0).getTime() -
			new Date(a?.updated_at || 0).getTime()
		)
	})

	return sortedNotificationsDescending
}
