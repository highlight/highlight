import { CommentReply, Maybe } from '@graph/schemas'
import { Box } from '@highlight-run/ui/components'
import React from 'react'

import { SessionComment } from '@/components/Comment/SessionComment/SessionComment'
import { ParsedSessionComment } from '@/pages/Player/ReplayerContext'

interface Props {
	replies: Maybe<CommentReply>[]
}

const ReplyList: React.FC<Props> = ({ replies }) => {
	return (
		<Box>
			{replies.map((reply) => {
				return (
					reply && (
						<Box key={reply.id}>
							<SessionComment
								comment={reply as ParsedSessionComment}
								isReply
							/>
						</Box>
					)
				)
			})}
		</Box>
	)
}

export default ReplyList
