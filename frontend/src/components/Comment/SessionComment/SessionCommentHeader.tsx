import GoToButton from '@components/Button/GoToButton'
import { CommentHeader } from '@components/Comment/CommentHeader'
import MenuItem from '@components/Menu/MenuItem'
import NewIssueModal from '@components/NewIssueModal/NewIssueModal'
import { useDeleteSessionCommentMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType, SessionCommentType } from '@graph/schemas'
import SvgClipboardIcon from '@icons/ClipboardIcon'
import SvgCopyIcon from '@icons/CopyIcon'
import SvgFileText2Icon from '@icons/FileText2Icon'
import SvgReferrer from '@icons/Referrer'
import SvgTrashIcon from '@icons/TrashIcon'
import { useIsProjectIntegratedWith } from '@pages/IntegrationsPage/components/common/useIsProjectIntegratedWith'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import {
	CLICKUP_INTEGRATION,
	HEIGHT_INTEGRATION,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import { IssueTrackerIntegration } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { PlayerSearchParameters } from '@pages/Player/PlayerHook/utils'
import {
	ParsedSessionComment,
	useReplayerContext,
} from '@pages/Player/ReplayerContext'
import { onGetLinkWithTimestamp } from '@pages/Player/SessionShareButton/utils/utils'
import analytics from '@util/analytics'
import { getFeedbackCommentSessionTimestamp } from '@util/comment/util'
import { delayedRefetch } from '@util/gql'
import { MillisToMinutesAndSeconds } from '@util/time'
import { Menu, message } from 'antd'
import React, { PropsWithChildren, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
		refetchQueries: [
			namedOperations.Query.GetSessionComments,
			namedOperations.Query.GetSessionsOpenSearch,
		],
		onQueryUpdated: delayedRefetch,
	})
	const navigate = useNavigate()

	const { isLinearIntegratedWithProject, loading: isLoadingLinear } =
		useLinearIntegration()

	const { isIntegrated: isClickupIntegrated, loading: isLoadingClickUp } =
		useIsProjectIntegratedWith(IntegrationType.ClickUp)

	const { isIntegrated: isHeightIntegrated, loading: isLoadingHeight } =
		useIsProjectIntegratedWith(IntegrationType.Height)

	const [showNewIssueModal, setShowNewIssueModal] = useState<
		IssueTrackerIntegration | undefined
	>()

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
						key={integration.name}
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

	const handleGotoClick = () => {
		const urlSearchParams = new URLSearchParams()
		urlSearchParams.append(PlayerSearchParameters.commentId, comment?.id)

		navigate(`${location.pathname}?${urlSearchParams.toString()}`, {
			replace: true,
		})

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
			{session && createIssueMenuItems}
			{menuItems?.map((menuItem, index) => (
				<MenuItem onClick={menuItem.onClick} key={index} icon={<></>}>
					{menuItem.label}
				</MenuItem>
			))}
		</Menu>
	)

	const shareMenu = <Menu>{session && createIssueMenuItems}</Menu>

	return (
		<CommentHeader
			comment={comment}
			moreMenu={moreMenu}
			footer={footer}
			shareMenu={shareMenu}
			gotoButton={<GoToButton small onClick={handleGotoClick} />}
			onClose={onClose}
			isSharingDisabled={
				isLoadingLinear || isLoadingClickUp || isLoadingHeight
			}
		>
			{children}
			<NewIssueModal
				selectedIntegration={showNewIssueModal ?? LINEAR_INTEGRATION}
				visible={!!showNewIssueModal}
				onClose={() => {
					setShowNewIssueModal(undefined)
				}}
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
