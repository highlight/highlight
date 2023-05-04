import AttachmentList from '@components/Comment/AttachmentList/AttachmentList'
import CommentReplyForm, {
	SessionCommentReplyAction,
} from '@components/Comment/CommentReplyForm/CommentReplyForm'
import ReplyList from '@components/Comment/ReplyList/ReplyList'
import { Box, IconSolidReply, Stack, Tag, Text } from '@highlight-run/ui'
import { ParsedSessionComment } from '@pages/Player/ReplayerContext'
import { H } from 'highlight.run'
import React, { useEffect, useState } from 'react'

import { formatTimeAsHMS, MillisToMinutesAndSeconds } from '@/util/time'

import CommentTextBody from '../../../pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import styles from './SessionComment.module.scss'
import SessionCommentHeader from './SessionCommentHeader'

interface Props {
	comment: ParsedSessionComment
	deepLinkedCommentId?: string | null
	hasShadow?: boolean
	onClose?: () => void
	parentRef?: React.RefObject<HTMLDivElement>
	showReplies?: boolean
}

export const SessionCommentCard = ({
	comment,
	deepLinkedCommentId,
	onClose,
	parentRef,
	showReplies,
}: Props) => {
	return (
		<Box>
			<SessionComment
				comment={comment}
				deepLinkedCommentId={deepLinkedCommentId}
				onClose={onClose}
				parentRef={parentRef}
				showReplies={showReplies}
			/>
		</Box>
	)
}

export const SessionComment = ({
	comment,
	deepLinkedCommentId,
	parentRef,
	isReply,
	showReplies,
	onClose,
}: Props & { isReply?: boolean }) => {
	const isSelected = deepLinkedCommentId === comment.id
	const commentTime = formatTimeAsHMS(comment.timestamp || 0)

	return (
		<Stack gap="4" direction="column">
			<Box
				backgroundColor={
					isSelected
						? { default: 'secondarySelected' }
						: { default: 'white', hover: 'secondaryHover' }
				}
				boxShadow={isSelected ? 'innerSecondary' : undefined}
				paddingTop="8"
				paddingBottom="10"
				px="8"
				borderRadius="6"
				display="flex"
				flexDirection="column"
				gap="4"
			>
				<SessionCommentHeader
					key={comment.id}
					comment={comment}
					onClose={onClose}
					isReply={isReply}
				/>
				<CommentTextBody commentText={comment.text} />
				<Stack direction="row" gap="8" justifyContent="space-between">
					<Stack direction="row" gap="4" alignItems="center">
						{comment?.replies?.length > 0 && (
							<>
								<IconSolidReply size={14} />
								<Text>{comment?.replies?.length}</Text>
							</>
						)}
					</Stack>
					<Box display="flex">
						{comment?.attachments?.length > 0 && (
							<AttachmentList attachments={comment.attachments} />
						)}
						{!isReply && (
							<Tag kind="secondary" shape="basic" size="small">
								{commentTime}
							</Tag>
						)}
					</Box>
				</Stack>
			</Box>
			{showReplies && (
				<>
					{comment?.replies?.length > 0 && (
						<ReplyList replies={comment.replies} />
					)}

					<CommentReplyForm<SessionCommentReplyAction>
						action={new SessionCommentReplyAction()}
						commentID={comment.id}
						parentRef={parentRef}
					/>
				</>
			)}
		</Stack>
	)
}

type SessionCommentTextBodyProps = Pick<Props, 'comment'>
export const SessionCommentTextBody = ({
	comment,
}: SessionCommentTextBodyProps) => {
	const [tags, setTags] = useState<string[]>([])

	useEffect(() => {
		if (comment.tags && comment.tags.length > 0) {
			try {
				// @ts-expect-error
				setTags(JSON.parse(comment.tags[0]))
			} catch (_e) {
				const e = _e as Error
				H.consumeError(e)
			}
		}
	}, [comment.tags])

	return (
		<>
			<CommentTextBody commentText={comment.text} />
			{tags.length > 0 && (
				<div className={styles.tagsContainer}>
					{tags.map((tag) => (
						<Tag key={tag}>{tag}</Tag>
					))}
				</div>
			)}
		</>
	)
}

export default SessionComment
