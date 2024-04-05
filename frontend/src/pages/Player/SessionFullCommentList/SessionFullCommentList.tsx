import { SessionCommentCard } from '@components/Comment/SessionComment/SessionComment'
import { Box, Text } from '@highlight-run/ui/components'
import { useRef } from 'react'

import { useGetSessionCommentsQuery } from '@/graph/generated/hooks'
import { useSessionParams } from '@/pages/Sessions/utils'

import FullCommentList from '../../../components/FullCommentList/FullCommentList'

const SessionFullCommentList = ({}: {}) => {
	const sessionCommentsRef = useRef(null)
	const { sessionSecureId } = useSessionParams()
	const { data, loading } = useGetSessionCommentsQuery({
		variables: {
			session_secure_id: sessionSecureId!,
		},
		skip: !sessionSecureId,
	})

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
						comment={comment}
					/>
				)}
				noCommentsMessage="Click anywhere on the session player to leave one"
			/>
		</Box>
	)
}

export default SessionFullCommentList
