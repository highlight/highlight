import { SessionCommentCard } from '@components/Comment/SessionComment/SessionComment'
import { GetSessionCommentsQuery } from '@graph/operations'
import { SessionCommentType } from '@graph/schemas'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { getFeedbackCommentSessionTimestamp } from '@util/comment/util'
import { MillisToMinutesAndSeconds } from '@util/time'
import React, { useEffect, useState } from 'react'

import FullCommentList from '../../../components/FullCommentList/FullCommentList'
import { PlayerSearchParameters } from '../PlayerHook/utils'
import styles from './SessionFullCommentList.module.scss'

const SessionFullCommentList = ({
	loading,
	sessionCommentsData,
	parentRef,
}: {
	loading: boolean
	sessionCommentsData?: GetSessionCommentsQuery
	parentRef?: React.RefObject<HTMLDivElement>
}) => {
	const { sessionMetadata } = useReplayerContext()
	const [deepLinkedCommentId, setDeepLinkedCommentId] = useState(
		new URLSearchParams(location.search).get(
			PlayerSearchParameters.commentId,
		),
	)

	useEffect(() => {
		const commentId = new URLSearchParams(location.search).get(
			PlayerSearchParameters.commentId,
		)
		setDeepLinkedCommentId(commentId)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.search])

	const getCommentTimestamp = (comment: any) => {
		if (comment.type === SessionCommentType.Feedback) {
			const sessionStartTime = sessionMetadata.startTime

			if (sessionStartTime) {
				const deltaMilliseconds = getFeedbackCommentSessionTimestamp(
					comment,
					sessionStartTime,
				)

				return MillisToMinutesAndSeconds(deltaMilliseconds)
			}
		}

		return MillisToMinutesAndSeconds(comment?.timestamp || 0)
	}

	return (
		<FullCommentList
			loading={loading}
			comments={sessionCommentsData?.session_comments}
			commentRender={(comment) => (
				<SessionCommentCard
					parentRef={parentRef}
					deepLinkedCommentId={deepLinkedCommentId}
					comment={comment}
					footer={
						<div className={styles.footer}>
							{comment.type === SessionCommentType.Feedback &&
								comment?.metadata?.email && (
									<a
										href={`mailto:${comment.metadata.email}`}
										className={styles.email}
									>
										{comment.metadata.email}
									</a>
								)}
							<p className={styles.timestamp}>
								{getCommentTimestamp(comment)}
							</p>
						</div>
					}
				/>
			)}
			noCommentsMessage="Click anywhere on the session player to leave one"
		/>
	)
}

export default SessionFullCommentList
