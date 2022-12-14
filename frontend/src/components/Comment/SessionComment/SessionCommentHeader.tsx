import GoToButton from '@components/Button/GoToButton'
import { CommentHeader } from '@components/Comment/CommentHeader'
import MenuItem from '@components/Menu/MenuItem'
import NewIssueModal from '@components/NewIssueModal/NewIssueModal'
import { useDeleteSessionCommentMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { SessionCommentType } from '@graph/schemas'
import SvgBallotBoxIcon from '@icons/BallotBoxIcon'
import SvgClipboardIcon from '@icons/ClipboardIcon'
import SvgCopyIcon from '@icons/CopyIcon'
import SvgFileText2Icon from '@icons/FileText2Icon'
import SvgReferrer from '@icons/Referrer'
import SvgTrashIcon from '@icons/TrashIcon'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { LINEAR_INTEGRATION } from '@pages/IntegrationsPage/Integrations'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import {
	ParsedSessionComment,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import { onGetLinkWithTimestamp } from '@pages/Player/SessionShareButton/utils/utils'
import analytics from '@util/analytics'
import { getFeedbackCommentSessionTimestamp } from '@util/comment/util'
import { MillisToMinutesAndSeconds } from '@util/time'
import { Menu, message } from 'antd'
import React, { PropsWithChildren, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'

interface Props {
	comment: ParsedSessionComment
	menuItems?: CommentHeaderMenuItem[]
	footer?: React.ReactNode
	onClose?: () => void
}

export interface CommentHeaderMenuItem {
	label: string
	onClick: () => void
}

const SessionCommentHeader = ({
	comment,
	children,
	menuItems,
	onClose,
	footer,
}: PropsWithChildren<Props>) => {
	const { pause, session, sessionMetadata } = useReplayerContext()
	const [deleteSessionComment] = useDeleteSessionCommentMutation({
		refetchQueries: [namedOperations.Query.GetSessionComments],
	})
	const history = useHistory()

	const { isLinearIntegratedWithProject } = useLinearIntegration()

	const [showNewIssueModal, setShowNewIssueModal] = useState(false)

	const getCommentLink = () => {
		const url = onGetLinkWithTimestamp(comment.timestamp || 0)
		url.searchParams.set(PlayerSearchParameters.commentId, comment.id)
		return url
	}

	const defaultIssueTitle = useMemo(() => {
		if (session?.identifier) {
			return `Highlight Comment: ${session?.identifier}'s session`
		}
		if (session?.fingerprint) {
			return `Highlight Comment: session with device ID ${session?.fingerprint}`
		}
		return `Highlight Comment for a session`
	}, [session])

	const createIssueMenuItem = (
		<MenuItem
			icon={<SvgFileText2Icon />}
			onClick={() => {
				analytics.track('Create Issue from Comment')
				setShowNewIssueModal(true)
			}}
		>
			Create Linear Issue
		</MenuItem>
	)

	const handleGotoClick = () => {
		const urlSearchParams = new URLSearchParams()
		urlSearchParams.append(PlayerSearchParameters.commentId, comment?.id)

		history.replace(
			`${history.location.pathname}?${urlSearchParams.toString()}`,
		)

		let commentTimestamp = comment.timestamp || 0

		if (comment.type === SessionCommentType.Feedback) {
			const sessionStartTime = sessionMetadata.startTime

			if (sessionStartTime) {
				commentTimestamp = getFeedbackCommentSessionTimestamp(
					comment,
					sessionStartTime,
				)
			}
		}
		pause(commentTimestamp)
		message.success(
			`Changed player time to where comment was created at ${MillisToMinutesAndSeconds(
				commentTimestamp,
			)}.`,
		)
	}

	const moreMenu = (
		<Menu>
			<MenuItem
				icon={<SvgCopyIcon />}
				onClick={() => {
					const url = getCommentLink()
					message.success('Copied link!')
					navigator.clipboard.writeText(url.href)
				}}
			>
				Copy link
			</MenuItem>
			{comment.type === SessionCommentType.Feedback &&
				comment?.metadata?.email && (
					<MenuItem
						icon={<SvgClipboardIcon />}
						onClick={() => {
							message.success(
								"Copied the feedback provider's email!",
							)
							navigator.clipboard.writeText(
								comment.metadata?.email as string,
							)
						}}
					>
						Copy feedback email
					</MenuItem>
				)}
			<MenuItem icon={<SvgReferrer />} onClick={handleGotoClick}>
				Goto
			</MenuItem>
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
			{session && isLinearIntegratedWithProject && createIssueMenuItem}
			{menuItems?.map((menuItem, index) => (
				<MenuItem onClick={menuItem.onClick} key={index} icon={<></>}>
					{menuItem.label}
				</MenuItem>
			))}
		</Menu>
	)

	const shareMenu = (
		<Menu>
			{session && createIssueMenuItem}
			<MenuItem
				icon={<SvgBallotBoxIcon />}
				onClick={() => {
					window.open(
						'https://highlight.canny.io/feature-requests/p/jira-integration',
						'_blank',
					)
				}}
			>
				Vote on Jira Integration
			</MenuItem>
			<MenuItem
				icon={<SvgBallotBoxIcon />}
				onClick={() => {
					window.open(
						'https://highlight.canny.io/feature-requests/p/clickup-integration',
						'_blank',
					)
				}}
			>
				Vote on ClickUp Integration
			</MenuItem>
			<MenuItem
				icon={<SvgBallotBoxIcon />}
				onClick={() => {
					window.open(
						'https://highlight.canny.io/feature-requests/p/mondaycom-integration',
						'_blank',
					)
				}}
			>
				Vote on Monday Integration
			</MenuItem>
			<MenuItem
				icon={<SvgBallotBoxIcon />}
				onClick={() => {
					window.open(
						'https://highlight.canny.io/feature-requests/p/asana-integration',
						'_blank',
					)
				}}
			>
				Vote on Asana Integration
			</MenuItem>
			<MenuItem
				icon={<SvgBallotBoxIcon />}
				onClick={() => {
					window.open(
						'https://highlight.canny.io/feature-requests?',
						'_blank',
					)
				}}
			>
				Suggest an Integration
			</MenuItem>
		</Menu>
	)

	return (
		<CommentHeader
			comment={comment}
			moreMenu={moreMenu}
			footer={footer}
			shareMenu={shareMenu}
			gotoButton={<GoToButton small onClick={handleGotoClick} />}
			onClose={onClose}
		>
			{children}
			<NewIssueModal
				selectedIntegration={LINEAR_INTEGRATION}
				visible={showNewIssueModal}
				changeVisible={setShowNewIssueModal}
				timestamp={comment.timestamp || 0}
				commentId={parseInt(comment.id, 10)}
				commentText={comment.text}
				commentType="SessionComment"
				defaultIssueTitle={defaultIssueTitle}
			/>
		</CommentHeader>
	)
}

export default SessionCommentHeader
