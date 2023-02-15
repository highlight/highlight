import AttachmentList from '@components/Comment/AttachmentList/AttachmentList'
import { CommentHeader } from '@components/Comment/CommentHeader'
import CommentReplyForm, {
	ErrorCommentReplyAction,
} from '@components/Comment/CommentReplyForm/CommentReplyForm'
import ReplyList from '@components/Comment/ReplyList/ReplyList'
import MenuItem from '@components/Menu/MenuItem'
import NewIssueModal from '@components/NewIssueModal/NewIssueModal'
import { useDeleteErrorCommentMutation } from '@graph/hooks'
import { GetErrorGroupQuery, namedOperations } from '@graph/operations'
import { ErrorComment, IntegrationType, Maybe } from '@graph/schemas'
import SvgFileText2Icon from '@icons/FileText2Icon'
import SvgTrashIcon from '@icons/TrashIcon'
import { ErrorCommentButton } from '@pages/Error/components/ErrorComments/ErrorCommentButton/ErrorCommentButton'
import { useIsProjectIntegratedWith } from '@pages/IntegrationsPage/components/common/useIsProjectIntegratedWith'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import {
	CLICKUP_INTEGRATION,
	HEIGHT_INTEGRATION,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import { IssueTrackerIntegration } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import analytics from '@util/analytics'
import { getErrorBody } from '@util/errors/errorUtils'
import { Menu } from 'antd'
import clsx from 'clsx'
import React, { useMemo, useState } from 'react'

import CommentTextBody from '../../../Player/Toolbar/NewCommentForm/CommentTextBody/CommentTextBody'
import styles from '../../ErrorPage.module.scss'

interface Props {
	parentRef?: React.RefObject<HTMLDivElement>
	onClickCreateComment?: () => void
}

const ErrorComments = ({ onClickCreateComment }: Props) => {
	return (
		<>
			<div
				className={styles.actionButtonsContainer}
				style={{ margin: 0 }}
			>
				<div className={styles.actionButtons}>
					<ErrorCommentButton
						trackingId="CreateErrorCommentSide"
						onClick={onClickCreateComment ?? (() => {})}
					/>
				</div>
			</div>
		</>
	)
}

interface Props {
	comment?: Maybe<ErrorComment>
	errorGroup?: GetErrorGroupQuery
	footer?: React.ReactNode
	parentRef?: React.RefObject<HTMLDivElement>
	deepLinked?: boolean
}

export const ErrorCommentCard = ({
	comment,
	errorGroup,
	deepLinked,
	parentRef,
}: Props) => {
	if (!comment) return null
	return (
		<div
			className={clsx(styles.commentDiv, {
				[styles.deepLinked]: !!deepLinked,
			})}
		>
			<ErrorCommentHeader comment={comment} errorGroup={errorGroup}>
				<CommentTextBody commentText={comment.text} />
			</ErrorCommentHeader>
			{comment?.attachments.length > 0 && (
				<AttachmentList attachments={comment.attachments} />
			)}
			{comment?.replies.length > 0 && (
				<ReplyList replies={comment.replies} />
			)}
			<CommentReplyForm<ErrorCommentReplyAction>
				action={new ErrorCommentReplyAction()}
				commentID={comment?.id}
				parentRef={parentRef}
			/>
		</div>
	)
}

const ErrorCommentHeader = ({ comment, children, errorGroup }: any) => {
	const [deleteSessionComment] = useDeleteErrorCommentMutation({
		refetchQueries: [namedOperations.Query.GetErrorComments],
	})

	const [showNewIssueModal, setShowNewIssueModal] = useState<
		IssueTrackerIntegration | undefined
	>(undefined)

	const defaultIssueTitle = useMemo(() => {
		if (errorGroup?.error_group?.event) {
			return getErrorBody(errorGroup?.error_group?.event)
		}
		return `Issue from this bug`
	}, [errorGroup])

	const { isLinearIntegratedWithProject } = useLinearIntegration()
	const { isIntegrated: isClickupIntegrated } = useIsProjectIntegratedWith(
		IntegrationType.ClickUp,
	)
	const { isIntegrated: isHeightIntegrated } = useIsProjectIntegratedWith(
		IntegrationType.Height,
	)

	const issueTrackers: [boolean | undefined, IssueTrackerIntegration][] = [
		[isLinearIntegratedWithProject, LINEAR_INTEGRATION],
		[isClickupIntegrated, CLICKUP_INTEGRATION],
		[isHeightIntegrated, HEIGHT_INTEGRATION],
	]

	const createIssueMenuItems = (
		<>
			{issueTrackers.map((item) => {
				const [isIntegrated, integration] = item
				return isIntegrated ? (
					<MenuItem
						icon={<SvgFileText2Icon />}
						onClick={() => {
							analytics.track(
								`Create ${integration.name} Issue from Comment`,
							)
							setShowNewIssueModal(integration)
						}}
					>
						Create {integration.name} Issue
					</MenuItem>
				) : null
			})}
		</>
	)

	const moreMenu = (
		<Menu>
			{createIssueMenuItems}
			<MenuItem
				icon={<SvgTrashIcon />}
				onClick={() => {
					deleteSessionComment({
						variables: {
							id: comment.id,
						},
					})
				}}
			>
				Delete comment
			</MenuItem>
		</Menu>
	)

	return (
		<CommentHeader
			moreMenu={moreMenu}
			comment={comment}
			errorComment={true}
		>
			{children}
			<NewIssueModal
				selectedIntegration={showNewIssueModal ?? LINEAR_INTEGRATION}
				visible={!!showNewIssueModal}
				onClose={() => setShowNewIssueModal(undefined)}
				commentId={parseInt(comment.id, 10)}
				commentText={comment.text}
				commentType="ErrorComment"
				defaultIssueTitle={defaultIssueTitle || ''}
			/>
		</CommentHeader>
	)
}

export default ErrorComments
