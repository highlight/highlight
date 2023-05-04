import NewIssueModal from '@components/NewIssueModal/NewIssueModal'
import { useDeleteSessionCommentMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType, SessionCommentType } from '@graph/schemas'
import {
	Box,
	IconSolidDotsHorizontal,
	Menu,
	Stack,
	Text,
} from '@highlight-run/ui'
import { vars } from '@highlight-run/ui/src/css/vars'
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
import { message } from 'antd'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdminAvatar, Avatar } from '@/components/Avatar/Avatar'

interface Props {
	comment: ParsedSessionComment
	isReply?: boolean
	onClose?: () => void
}

const SessionCommentHeader: React.FC<Props> = ({
	comment,
	isReply,
	onClose,
}) => {
	const { pause, session, sessionMetadata } = useReplayerContext()
	const navigate = useNavigate()

	const [deleteSessionComment] = useDeleteSessionCommentMutation({
		refetchQueries: [
			namedOperations.Query.GetSessionComments,
			namedOperations.Query.GetSessionsOpenSearch,
		],
		onQueryUpdated: delayedRefetch,
	})

	const { isLinearIntegratedWithProject } = useLinearIntegration()
	const { isIntegrated: isClickupIntegrated } = useIsProjectIntegratedWith(
		IntegrationType.ClickUp,
	)
	const { isIntegrated: isHeightIntegrated } = useIsProjectIntegratedWith(
		IntegrationType.Height,
	)

	const [showNewIssueModal, setShowNewIssueModal] = useState<
		IssueTrackerIntegration | undefined
	>()

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
					<Menu.Item
						key={integration.name}
						onClick={() => {
							analytics.track(
								`Create ${integration.name} Issue from Comment`,
							)
							setShowNewIssueModal(integration)
						}}
					>
						Create {integration.name} Issue
					</Menu.Item>
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

	const getCommentLink = () => {
		const url = onGetLinkWithTimestamp(comment.timestamp || 0)
		url.searchParams.set(PlayerSearchParameters.commentId, comment.id)
		return url
	}

	const authorName =
		comment.type === SessionCommentType.Feedback
			? comment.metadata?.name ||
			  comment.metadata?.email?.split('@')[0] ||
			  'Anonymous'
			: comment.author?.name || comment.author?.email.split('@')[0]

	const timeAgo = moment(comment.created_at).fromNow()

	return (
		<Box>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Stack direction="row" gap="4" alignItems="center">
					{comment.type === SessionCommentType.Feedback ? (
						<Avatar
							seed={
								comment.metadata?.name ||
								comment.metadata?.email ||
								'Anonymous'
							}
							style={{ height: 20, width: 20 }}
						/>
					) : (
						<AdminAvatar
							adminInfo={{
								name: comment.author?.name ?? undefined,
								photo_url: comment.author?.photo_url,
								email: comment.author?.email,
							}}
							size={20}
						/>
					)}
					<Text size="small" color="strong">
						{authorName}
					</Text>
					<Text size="small" color="moderate">
						{timeAgo}
					</Text>
				</Stack>

				{!isReply && (
					<Box>
						<Menu placement="bottom-end">
							<Menu.Button
								icon={
									<IconSolidDotsHorizontal
										size={14}
										color={vars.color.n11}
									/>
								}
								emphasis="low"
								kind="secondary"
								size="xSmall"
							/>
							<Menu.List>
								<Menu.Item
									onClick={() => {
										const url = getCommentLink()
										message.success('Copied link!')
										navigator.clipboard.writeText(url.href)
									}}
								>
									Copy link
								</Menu.Item>
								{comment.type === SessionCommentType.Feedback &&
									comment?.metadata?.email && (
										<Menu.Item
											onClick={() => {
												message.success(
													"Copied the feedback provider's email!",
												)
												navigator.clipboard.writeText(
													comment.metadata
														?.email as string,
												)
											}}
										>
											Copy feedback email
										</Menu.Item>
									)}
								<Menu.Item onClick={handleGotoClick}>
									Goto
								</Menu.Item>
								<Menu.Item
									onClick={() => {
										deleteSessionComment({
											variables: {
												id: comment.id,
											},
										})
									}}
								>
									Delete comment
								</Menu.Item>
								{session && createIssueMenuItems}
							</Menu.List>
						</Menu>
					</Box>
				)}
			</Box>

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
		</Box>
	)
}

export default SessionCommentHeader
