import { useAuthContext } from '@authentication/AuthContext'
import CloseButton from '@components/CloseButton/CloseButton'
import { Admin, SanitizedAdminInput, SessionCommentType } from '@graph/schemas'
import SvgShare2Icon from '@icons/Share2Icon'
import { CommentSuggestion } from '@util/comment/util'
import React, { PropsWithChildren } from 'react'
import { SuggestionDataItem } from 'react-mentions'

import { AdminAvatar, Avatar } from '../Avatar/Avatar'
import DotsMenu from '../DotsMenu/DotsMenu'
import RelativeTime from '../RelativeTime/RelativeTime'
import styles from './CommentHeader.module.scss'

export interface AdminSuggestion extends SuggestionDataItem {
	email?: string
	photoUrl?: string
	name?: string
}

export const parseAdminSuggestions = (
	/** A list of all admins in the project. */
	suggestions: CommentSuggestion[],
	/** The current logged in admin. */
	currentAdmin: Admin | undefined,
	/** A list of admins that have already been mentioned. */
	mentionedAdmins: SanitizedAdminInput[],
): AdminSuggestion[] => {
	if (!currentAdmin) {
		return []
	}

	return (
		suggestions
			// Filter out these admins
			.filter(
				(suggestion) =>
					// 1. The admin that is creating the comment
					suggestion?.email !== currentAdmin.email &&
					// 2. Admins that are already mentioned
					!mentionedAdmins.some(
						(mentionedAdmin) =>
							mentionedAdmin.id === suggestion?.id,
					),
			)
			.map((suggestion) => {
				return {
					id: suggestion!.id,
					email: suggestion!.email,
					photo_url: suggestion!.photoUrl,
					display: suggestion?.name || suggestion!.email || '',
					name: suggestion?.name,
				}
			})
	)
}

export const CommentHeader = ({
	comment,
	moreMenu,
	children,
	footer,
	shareMenu,
	gotoButton,
	onClose,
	small,
	errorComment,
	isSharingDisabled,
}: PropsWithChildren<{
	comment: any
	moreMenu?: JSX.Element
	shareMenu?: JSX.Element
	gotoButton?: JSX.Element
	onClose?: () => void
	footer?: React.ReactNode
	small?: boolean
	errorComment?: boolean
	isSharingDisabled?: boolean
}>) => {
	const { isLoggedIn } = useAuthContext()

	return (
		<>
			{!small && (
				<div
					className={clsx(styles.topBar, {
						[styles.errorTopBar]: errorComment,
					})}
				>
					<span className={styles.startActions}>
						{moreMenu && (
							<DotsMenu
								menu={moreMenu}
								trackingId="CommentsHeader"
							/>
						)}
					</span>
					<span className={styles.endActions}>
						{isLoggedIn && !small && (
							<>
								{shareMenu && (
									<DotsMenu
										menu={shareMenu}
										trackingId="CommentsShare"
										icon={<SvgShare2Icon />}
										disabled={isSharingDisabled}
									/>
								)}
								{gotoButton!}
								{onClose && (
									<CloseButton
										onClick={onClose}
										trackingId="CommentsClose"
									/>
								)}
							</>
						)}
					</span>
				</div>
			)}
			<div
				className={clsx(styles.commentHeader, {
					[styles.small]: !!small,
				})}
			>
				{comment?.type === SessionCommentType.Feedback ? (
					<Avatar
						seed={
							comment?.metadata?.name ||
							comment?.metadata?.email ||
							'Anonymous'
						}
						style={{ height: 30, width: 30 }}
					/>
				) : (
					<AdminAvatar adminInfo={comment.author} size={30} />
				)}
				<div
					className={clsx(styles.textContainer, {
						[styles.small]: !!small,
					})}
				>
					<p className={styles.commentAuthor}>
						{comment?.type === SessionCommentType.Feedback
							? comment?.metadata?.name ||
							  comment?.metadata?.email?.split('@')[0] ||
							  'Anonymous'
							: comment.author.name ||
							  comment.author.email.split('@')[0]}
					</p>
					<span className={styles.commentUpdatedTime}>
						<RelativeTime datetime={comment.updated_at} />
					</span>
				</div>
				<div
					className={clsx(styles.childrenContainer, {
						[styles.small]: !!small,
					})}
				>
					{children}
				</div>
				{footer && <div className={styles.footer}>{footer}</div>}
			</div>
		</>
	)
}
