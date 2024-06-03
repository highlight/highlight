import NewIssueModal from '@components/NewIssueModal/NewIssueModal'
import { toast } from '@components/Toaster'
import { IntegrationType, SessionCommentType } from '@graph/schemas'
import {
	Box,
	IconSolidArrowCircleRight,
	IconSolidDotsHorizontal,
	IconSolidExternalLink,
	IconSolidLink,
	IconSolidTrash,
	Menu,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useIsProjectIntegratedWith } from '@pages/IntegrationsPage/components/common/useIsProjectIntegratedWith'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import {
	CLICKUP_INTEGRATION,
	GITLAB_INTEGRATION,
	HEIGHT_INTEGRATION,
	JIRA_INTEGRATION,
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
import moment from 'moment'
import React, { useMemo, useState } from 'react'

import { AdminAvatar, Avatar } from '@/components/Avatar/Avatar'
import { getAttachmentUrl } from '@/components/Comment/AttachmentList/AttachmentList'
import {
	useDeleteComment,
	useNavigateToComment,
} from '@/components/Comment/utils/utils'
import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'

interface Props {
	comment: ParsedSessionComment
	isReply?: boolean
}

const SessionCommentHeader: React.FC<Props> = ({ comment, isReply }) => {
	const { session } = useReplayerContext()
	const navigateToComment = useNavigateToComment(comment)
	const deleteComment = useDeleteComment(comment)

	const { isLinearIntegratedWithProject } = useLinearIntegration()

	const { settings: jiraSettings } = useJiraIntegration()
	const { settings: gitlabSettings } = useGitlabIntegration()

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
		[jiraSettings.isIntegrated, JIRA_INTEGRATION],
		[isHeightIntegrated, HEIGHT_INTEGRATION],
		[gitlabSettings.isIntegrated, GITLAB_INTEGRATION],
	]

	const anyIssueTrackerIntegrated = issueTrackers.some(
		([isIntegrated]) => isIntegrated,
	)

	const createIssueMenuItems = (
		<>
			{issueTrackers.map((item) => {
				const [isIntegrated, integration] = item
				const existingAttachment = comment.attachments?.find(
					(attachment) =>
						attachment?.integration_type === integration.name,
				)

				return isIntegrated ? (
					<Menu.Item
						key={integration.name}
						onClick={() => {
							existingAttachment
								? window.open(
										getAttachmentUrl(existingAttachment),
										'_blank',
								  )
								: analytics.track(
										`Create ${integration.name} Issue from Comment`,
								  )
							setShowNewIssueModal(integration)
						}}
					>
						<Stack gap="4" direction="row" align="center">
							<integration.Icon />
							{existingAttachment ? (
								<>
									View {existingAttachment.title}{' '}
									<IconSolidExternalLink /> {}
								</>
							) : (
								<>Create {integration.name} issue</>
							)}
						</Stack>
					</Menu.Item>
				) : null
			})}
		</>
	)

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
					<Text size="small" color="strong" lines="1">
						{authorName}
					</Text>
					<Text size="small" color="moderate" lines="1">
						{timeAgo}
					</Text>
				</Stack>

				{!isReply && (
					<Box>
						<Menu placement="bottom-end">
							<Menu.Button
								onClick={(
									e: React.MouseEvent<HTMLButtonElement>,
								) => {
									e.stopPropagation()
								}}
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
								<Menu.Item onClick={navigateToComment}>
									<Stack
										gap="4"
										direction="row"
										align="center"
									>
										<IconSolidArrowCircleRight />
										Go to timestamp
									</Stack>
								</Menu.Item>
								<Menu.Item
									onClick={() => {
										const url = getCommentLink()
										toast.success('Copied link!')
										navigator.clipboard.writeText(url.href)
									}}
								>
									<Stack
										gap="4"
										direction="row"
										align="center"
									>
										<IconSolidLink />
										Copy link
									</Stack>
								</Menu.Item>
								<Menu.Item onClick={deleteComment}>
									<Stack
										gap="4"
										direction="row"
										align="center"
									>
										<IconSolidTrash />
										Delete comment
									</Stack>
								</Menu.Item>
								{session && anyIssueTrackerIntegrated && (
									<>
										<Menu.Divider />
										{createIssueMenuItems}
									</>
								)}
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
