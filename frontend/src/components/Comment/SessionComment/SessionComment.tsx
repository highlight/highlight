import { useAuthContext } from '@authentication/AuthContext'
import Button from '@components/Button/Button/Button'
import AttachmentList from '@components/Comment/AttachmentList/AttachmentList'
import CommentReplyForm, {
	SessionCommentReplyAction,
} from '@components/Comment/CommentReplyForm/CommentReplyForm'
import ReplyList from '@components/Comment/ReplyList/ReplyList'
import SplitButton from '@components/SplitButton/SplitButton'
import Tag from '@components/Tag/Tag'
import SvgHeartIcon from '@icons/HeartIcon'
import SvgSpeechBubbleIcon from '@icons/SpeechBubbleIcon'
import { ParsedSessionComment } from '@pages/Player/ReplayerContext'
import { message } from 'antd'
import Menu from 'antd/lib/menu'
import clsx from 'clsx'
import { H } from 'highlight.run'
import React, { useEffect, useState } from 'react'

import CommentTextBody from '../../../pages/Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import styles from './SessionComment.module.scss'
import SessionCommentHeader, {
	CommentHeaderMenuItem,
} from './SessionCommentHeader'

interface Props {
	comment: ParsedSessionComment
	deepLinkedCommentId?: string | null
	hasShadow?: boolean
	menuItems?: CommentHeaderMenuItem[]
	onClose?: () => void
	footer?: React.ReactNode
	parentRef?: React.RefObject<HTMLDivElement>
	scrollReplies?: boolean
}

export const SessionCommentCard = ({
	comment,
	deepLinkedCommentId,
	hasShadow,
	menuItems,
	onClose,
	footer,
	parentRef,
	scrollReplies,
}: Props) => {
	return (
		<div
			className={clsx(styles.container, {
				[styles.deepLinkedComment]: deepLinkedCommentId === comment.id,
				[styles.hasShadow]: hasShadow,
			})}
		>
			<SessionComment
				comment={comment}
				deepLinkedCommentId={deepLinkedCommentId}
				menuItems={menuItems}
				onClose={onClose}
				footer={footer}
				parentRef={parentRef}
				scrollReplies={scrollReplies}
			/>
		</div>
	)
}

export const SessionComment = ({
	comment,
	menuItems,
	onClose,
	parentRef,
	scrollReplies,
}: Props) => {
	return (
		<>
			<SessionCommentHeader
				key={comment.id}
				comment={comment}
				menuItems={menuItems}
				onClose={onClose}
			>
				<SessionCommentTextBody comment={comment} />
			</SessionCommentHeader>
			{comment?.attachments?.length > 0 && (
				<AttachmentList attachments={comment.attachments} />
			)}
			{comment?.replies?.length > 0 && (
				<ReplyList
					replies={comment.replies}
					scrollReplies={scrollReplies}
				/>
			)}
			<CommentReplyForm<SessionCommentReplyAction>
				action={new SessionCommentReplyAction()}
				commentID={comment.id}
				parentRef={parentRef}
			/>
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
						<Tag key={tag} autoColorsText={tag}>
							{tag}
						</Tag>
					))}
				</div>
			)}
		</>
	)
}

interface SessionCommentFooterProps {
	a?: any
}

export const ExperimentalSessionCommentFooter: React.FC<
	React.PropsWithChildren<SessionCommentFooterProps>
> = ({ children }) => {
	const { admin } = useAuthContext()

	return (
		<footer className={styles.footer}>
			<div className={styles.actions}>
				<SplitButton
					buttonLabel={
						<span className={styles.iconLabel}>
							<SvgHeartIcon /> Like
						</span>
					}
					trackingId="SessionCommentReact"
					overlay={
						<Menu>
							<Menu.Item
								icon={<SvgHeartIcon />}
								className={styles.iconLabel}
								onClick={() => {
									message.success(
										`Hi ${
											admin?.name.split(' ')[0]
										}, this doesn't do anything yet.`,
									)
								}}
							>
								Thumbs Up
							</Menu.Item>
							<Menu.Item
								icon={<SvgHeartIcon />}
								className={styles.iconLabel}
								onClick={() => {
									message.success(
										`Hi ${
											admin?.name.split(' ')[0]
										}, this doesn't do anything yet.`,
									)
								}}
							>
								Thumbs Down
							</Menu.Item>
						</Menu>
					}
					onClick={() => {
						message.success(
							`Hi ${
								admin?.name.split(' ')[0]
							}, this doesn't do anything yet.`,
						)
					}}
				/>
				<Button
					trackingId="SessionCommentReply"
					type="text"
					className={clsx(styles.iconLabel, styles.actionButton)}
					onClick={() => {
						message.success(
							`Hi ${
								admin?.name.split(' ')[0]
							}, this doesn't do anything yet.`,
						)
					}}
				>
					<SvgSpeechBubbleIcon /> Reply
				</Button>
			</div>
			{children}
		</footer>
	)
}

export default SessionComment
