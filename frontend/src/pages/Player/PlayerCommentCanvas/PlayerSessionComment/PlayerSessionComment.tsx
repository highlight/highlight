import { SessionCommentCard } from '@components/Comment/SessionComment/SessionComment'
import { Box } from '@highlight-run/ui/components'
import { MillisToMinutesAndSeconds } from '@util/time'
import { message } from 'antd'
import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CommentIndicator } from '@/components/Comment/CommentIndicator'
import { getDeepLinkedCommentId } from '@/components/Comment/utils/utils'

import TransparentPopover from '../../../../components/Popover/TransparentPopover'
import {
	Maybe,
	SanitizedAdmin,
	SessionComment as SessionCommentModelType,
	SessionCommentType,
} from '../../../../graph/generated/schemas'
import { useReplayerContext } from '../../ReplayerContext'
import commentButtonStyles from '../PlayerCommentCanvas.module.css'
import styles from './PlayerSessionComment.module.css'

interface Props {
	comment: Maybe<
		{ __typename?: 'SessionComment' } & Pick<
			SessionCommentModelType,
			| 'id'
			| 'timestamp'
			| 'created_at'
			| 'session_id'
			| 'updated_at'
			| 'text'
			| 'x_coordinate'
			| 'y_coordinate'
			| 'project_id'
			| 'type'
			| 'session_secure_id'
			| 'tags'
			| 'attachments'
			| 'replies'
		> & {
				author?: Maybe<
					{ __typename?: 'SanitizedAdmin' } & Pick<
						SanitizedAdmin,
						'id' | 'name' | 'email' | 'photo_url'
					>
				>
			}
	>
}

/**
 * A comment that is rendered onto the Player relative to where the comment was made.
 */
const PlayerSessionComment = ({ comment }: Props) => {
	const deepLinkedCommentId = getDeepLinkedCommentId()
	const { pause } = useReplayerContext()
	const [visible, setVisible] = useState(deepLinkedCommentId === comment?.id)
	const [clicked, setClicked] = useState(deepLinkedCommentId === comment?.id)
	const commentCardParentRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (deepLinkedCommentId) {
			setVisible(deepLinkedCommentId === comment?.id)
		}
	}, [comment?.id, deepLinkedCommentId])

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key == 'Escape') {
				setVisible(false)
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => {
			window.removeEventListener('keydown', onKeyDown)
		}
	}, [])

	const handleClick: EventListener = useCallback(
		(e) => {
			if (!visible) {
				return
			}

			if (!commentCardParentRef.current?.contains(e.target as Node)) {
				setVisible(false)
			}
		},
		[visible],
	)

	useEffect(() => {
		window.removeEventListener('click', handleClick)
		window.addEventListener('click', handleClick)

		return () => {
			window.removeEventListener('click', handleClick)
		}
	}, [visible, handleClick])

	if (!comment) {
		return null
	}

	// This case is true when the comment is a non-ADMIN type comment.
	if (
		comment.x_coordinate == null ||
		comment.y_coordinate == null ||
		comment.timestamp == null ||
		comment.type !== SessionCommentType.Admin
	) {
		return null
	}

	return (
		<div
			key={comment.id}
			className={styles.comment}
			style={{
				left: `calc(${comment.x_coordinate * 100}%)`,
				top: `calc(${
					comment.y_coordinate * 100
				}% - var(--comment-indicator-width))`,
			}}
			onClick={(e) => {
				e.stopPropagation()
				setClicked(true)
			}}
			onMouseEnter={() => {
				setVisible(true)
			}}
			onMouseLeave={() => {
				if (!clicked && comment.id !== deepLinkedCommentId) {
					setVisible(false)
				}
			}}
		>
			<TransparentPopover
				placement="right"
				content={
					<Box
						backgroundColor="white"
						border="divider"
						borderRadius="8"
						boxShadow="medium"
						style={{ width: 350 }}
						ref={commentCardParentRef}
					>
						<SessionCommentCard
							parentRef={commentCardParentRef}
							comment={comment}
							showReplies
						/>
					</Box>
				}
				align={{ offset: [0, 12] }}
				visible={visible}
				defaultVisible={deepLinkedCommentId === comment.id}
				// Sets the Popover's mount node as the player center panel.
				// The default is document.body
				// We override here to be able to show the comments when the player is in fullscreen
				// Without this, the new comment modal would be below the fullscreen view.
				getPopupContainer={() => {
					const playerCenterPanel =
						document.getElementById('playerCenterPanel')

					if (playerCenterPanel) {
						return playerCenterPanel
					}

					return document.body
				}}
			>
				<button
					onClick={() => {
						pause(comment.timestamp as number)
						message.success(
							`Changed player time to where comment was created at ${MillisToMinutesAndSeconds(
								comment.timestamp as number,
							)}.`,
						)
					}}
					className={clsx(
						commentButtonStyles.commentIndicator,
						styles.commentPinButton,
					)}
				>
					<CommentIndicator
						seed={
							comment.author?.name ??
							comment.author?.email ??
							'Anonymous'
						}
						customImage={comment.author?.photo_url}
					/>
				</button>
			</TransparentPopover>
		</div>
	)
}

export default PlayerSessionComment
