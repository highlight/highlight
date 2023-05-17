import AttachmentList from '@components/Comment/AttachmentList/AttachmentList'
import CommentReplyForm, {
	SessionCommentReplyAction,
} from '@components/Comment/CommentReplyForm/CommentReplyForm'
import ReplyList from '@components/Comment/ReplyList/ReplyList'
import { Box, IconSolidReply, Stack, Tag, Text } from '@highlight-run/ui'
import { ParsedSessionComment } from '@pages/Player/ReplayerContext'
import { H } from 'highlight.run'
import React, { useEffect, useState } from 'react'

import {
	getDeepLinkedCommentId,
	useNavigateToComment,
} from '@/components/Comment/utils/utils'
import { formatTimeAsHMS } from '@/util/time'

import CommentTextBody from '../../../pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import styles from './SessionComment.module.scss'
import SessionCommentHeader from './SessionCommentHeader'

interface Props {
	comment: ParsedSessionComment
	hasShadow?: boolean
	parentRef?: React.RefObject<HTMLDivElement>
	showReplies?: boolean
}

export const SessionCommentCard = ({
	comment,
	parentRef,
	showReplies,
}: Props) => {
	return (
		<SessionComment
			comment={comment}
			parentRef={parentRef}
			showReplies={showReplies}
		/>
	)
}

export const SessionComment = ({
	comment,
	parentRef,
	isReply,
	showReplies,
}: Props & { isReply?: boolean }) => {
	const navigateToComment = useNavigateToComment(comment)
	const deepLinkedCommentId = getDeepLinkedCommentId()
	const isSelected =
		deepLinkedCommentId === comment.id &&
		comment.__typename === 'SessionComment'
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
					{!isReply && (
						<Stack
							direction="row"
							gap="8"
							justifyContent="space-between"
							align="center"
						>
							<Box>
								{comment.replies?.length > 0 && (
									<Text
										size="xSmall"
										color="secondaryContentText"
									>
										<Stack
											direction="row"
											gap="4"
											align="center"
										>
											<IconSolidReply size={14} />
											{comment.replies?.length}
										</Stack>
									</Text>
								)}
							</Box>
							<Box
								display="flex"
								gap="4"
								flexDirection="row"
								alignItems="center"
							>
								{comment.attachments?.length > 0 && (
									<AttachmentList
										attachments={comment.attachments}
									/>
								)}
								<Box display="flex" flexShrink={0}>
									<Tag
										kind="secondary"
										shape="basic"
										size="small"
									>
										<Text size="xxSmall" weight="regular">
											{commentTime}
										</Text>
									</Tag>
								</Box>
							</Box>
						</Stack>
					)}
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
