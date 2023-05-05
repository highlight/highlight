import { SessionCommentCard } from '@components/Comment/SessionComment/SessionComment'
import { Box, Text } from '@highlight-run/ui'
import React, { useEffect, useRef, useState } from 'react'

import { useGetSessionCommentsQuery } from '@/graph/generated/hooks'
import { useParams } from '@/util/react-router/useParams'

import FullCommentList from '../../../components/FullCommentList/FullCommentList'
import { PlayerSearchParameters } from '../PlayerHook/utils'

const SessionFullCommentList = ({}: {}) => {
	const sessionCommentsRef = useRef(null)
	const { session_secure_id } = useParams<{ session_secure_id: string }>()
	const { data, loading } = useGetSessionCommentsQuery({
		variables: {
			session_secure_id: session_secure_id!,
		},
		skip: !session_secure_id,
	})
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

	return (
		<Box ref={sessionCommentsRef} height="full">
			<Box py="16" px="12" borderBottom="dividerWeak">
				<Text size="small" weight="bold">
					Threads
				</Text>
			</Box>
			<FullCommentList
				loading={loading}
				comments={data?.session_comments}
				commentRender={(comment) => (
					<SessionCommentCard
						parentRef={sessionCommentsRef}
						deepLinkedCommentId={deepLinkedCommentId}
						comment={comment}
					/>
				)}
				noCommentsMessage="Click anywhere on the session player to leave one"
			/>
		</Box>
	)
}

export default SessionFullCommentList
