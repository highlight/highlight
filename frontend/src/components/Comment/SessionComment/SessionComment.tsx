import AttachmentList from '@components/Comment/AttachmentList/AttachmentList'
import CommentReplyForm, {
	SessionCommentReplyAction,
} from '@components/Comment/CommentReplyForm/CommentReplyForm'
import ReplyList from '@components/Comment/ReplyList/ReplyList'
import { Box, IconSolidReply, Stack, Tag, Text } from '@highlight-run/ui'
import { ParsedSessionComment } from '@pages/Player/ReplayerContext'
import { H } from 'highlight.run'
import React, { useEffect, useState } from 'react'

import { useNavigateToComment } from '@/components/Comment/utils/utils'
import { formatTimeAsHMS } from '@/util/time'

import CommentTextBody from '../../../pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import styles from './SessionComment.module.scss'
import SessionCommentHeader from './SessionCommentHeader'

interface Props {
	comment: ParsedSessionComment
	deepLinkedCommentId?: string | null
	hasShadow?: boolean
	parentRef?: React.RefObject<HTMLDivElement>
	showReplies?: boolean
}

export const SessionCommentCard = ({
	comment,
	deepLinkedCommentId,
	parentRef,
	showReplies,
}: Props) => {
	return (
		<SessionComment
			comment={comment}
			deepLinkedCommentId={deepLinkedCommentId}
			parentRef={parentRef}
			showReplies={showReplies}
		/>
	)
}

export const SessionComment = ({
	comment,
	deepLinkedCommentId,
	parentRef,
	isReply,
	showReplies,
}: Props & { isReply?: boolean }) => {
	const navigateToComment = useNavigateToComment(comment)
	const isSelected = deepLinkedCommentId === comment.id
	const commentTime = formatTimeAsHMS(comment.timestamp || 0)
	const isClickable = !isReply && !showReplies

	return (
		<>
			<Box p={isReply || !showReplies ? undefined : '4'}>
				<Box
					backgroundColor={
						isSelected
							? { default: 'secondarySelected' }
							: {
									default: 'white',
									hover: 'secondarySelectedHover',
							  }
					}
					boxShadow={isSelected ? 'innerSecondary' : undefined}
					cursor={isClickable ? 'pointer' : undefined}
					paddingTop="8"
					paddingBottom="10"
					px="8"
					borderRadius="6"
					display="flex"
					flexDirection="column"
					gap="8"
					onClick={() => {
						if (isClickable) {
							navigateToComment()
						}
					}}
				>
					<SessionCommentHeader
						key={comment.id}
						comment={comment}
						isReply={isReply}
					/>
					<CommentTextBody commentText={comment.text} />
					{comment.replies?.length > 0 ||
						(comment.attachments?.length > 0 && (
							<Stack
								direction="row"
								gap="8"
								justifyContent="space-between"
							>
								<Stack
									direction="row"
									gap="4"
									alignItems="center"
								>
									{comment.replies?.length > 0 && (
										<>
											<IconSolidReply size={14} />
											<Text>
												{comment.replies?.length}
											</Text>
										</>
									)}
								</Stack>
								<Box display="flex" gap="4" flexDirection="row">
									{comment.attachments?.length > 0 && (
										<AttachmentList
											attachments={comment.attachments}
										/>
									)}
									{!isReply && (
										<Tag
											kind="secondary"
											shape="basic"
											size="small"
										>
											{commentTime}
										</Tag>
									)}
								</Box>
							</Stack>
						))}
				</Box>
				{showReplies && comment.replies?.length > 0 && (
					<ReplyList replies={comment.replies} />
				)}
			</Box>
			{showReplies && (
				<CommentReplyForm<SessionCommentReplyAction>
					action={new SessionCommentReplyAction()}
					commentID={comment.id}
					parentRef={parentRef}
				/>
			)}
		</>
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
