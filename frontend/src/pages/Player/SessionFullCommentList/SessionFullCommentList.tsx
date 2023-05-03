import { SessionCommentCard } from '@components/Comment/SessionComment/SessionComment'
import { SessionCommentType } from '@graph/schemas'
import { Box } from '@highlight-run/ui'
import { useReplayerContext } from '@pages/Player/ReplayerContext'
import { getFeedbackCommentSessionTimestamp } from '@util/comment/util'
import { MillisToMinutesAndSeconds } from '@util/time'
import React, { useEffect, useRef, useState } from 'react'

import { useGetSessionCommentsQuery } from '@/graph/generated/hooks'
import { useParams } from '@/util/react-router/useParams'

import FullCommentList from '../../../components/FullCommentList/FullCommentList'
import { PlayerSearchParameters } from '../PlayerHook/utils'
import styles from './SessionFullCommentList.module.scss'

const SessionFullCommentList = ({}: {}) => {
	const sessionCommentsRef = useRef(null)
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const { data, loading } = useGetSessionCommentsQuery({
		variables: {
			session_secure_id: session_secure_id!,
		},
		skip: !session_secure_id,
	})
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
		<Box ref={sessionCommentsRef} height="full">
			<FullCommentList
				loading={loading}
				comments={data?.session_comments}
				commentRender={(comment) => (
					<SessionCommentCard
						parentRef={sessionCommentsRef}
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
		</Box>
	)
}

export default SessionFullCommentList
