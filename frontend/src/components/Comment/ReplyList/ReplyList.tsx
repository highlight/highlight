import { CommentReply, Maybe } from '@graph/schemas'
import clsx from 'clsx'
import React from 'react'

import SessionComment from '@/components/Comment/SessionComment/SessionComment'
import { ParsedSessionComment } from '@/pages/Player/ReplayerContext'

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
								<SessionComment
									comment={record as ParsedSessionComment}
									isReply
								/>
							</div>
						</div>
					)
				)
			})}
		</div>
	)
}

export default ReplyList
