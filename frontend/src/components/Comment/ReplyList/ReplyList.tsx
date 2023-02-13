import { CommentHeader } from '@components/Comment/CommentHeader'
import { CommentReply, Maybe } from '@graph/schemas'
import CommentTextBody from '@pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import clsx from 'clsx'
import React from 'react'

import styles from './ReplyList.module.scss'

interface ReplyListProps {
	replies: Maybe<CommentReply>[]
	errorComment?: boolean
	scrollReplies?: boolean
}

const ReplyList: React.FC<React.PropsWithChildren<ReplyListProps>> = ({
	replies,
	scrollReplies,
}) => {
	return (
		<div
			className={clsx(styles.repliesList, {
				[styles.scrollReplies]: scrollReplies,
			})}
		>
			{replies.map((record) => {
				return (
					record && (
						<div className={styles.record} key={record.id}>
							<div>
								<CommentHeader comment={record} small>
									<CommentTextBody
										commentText={record.text}
									/>
								</CommentHeader>
							</div>
						</div>
					)
				)
			})}
		</div>
	)
}

export default ReplyList
