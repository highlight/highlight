import { useAuthContext } from '@authentication/AuthContext'
import { getAttachmentUrl } from '@components/Comment/AttachmentList/AttachmentList'
import NewIssueModal from '@components/NewIssueModal/NewIssueModal'
import {
	useGetErrorIssuesQuery,
	useRemoveErrorIssueMutation,
} from '@graph/hooks'
import { GetErrorGroupQuery, namedOperations } from '@graph/operations'
import { ExternalAttachment, IntegrationType } from '@graph/schemas'
import {
	Box,
	IconSolidCheveronRight,
	IconSolidClipboardCopy,
	IconSolidDocumentAdd,
	IconSolidExternalLink,
	IconSolidPlusSm,
	IconSolidTrash,
	Menu,
	Text,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useProjectId } from '@hooks/useProjectId'
import { useIsProjectIntegratedWith } from '@pages/IntegrationsPage/components/common/useIsProjectIntegratedWith'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import {
	CLICKUP_INTEGRATION,
	GITHUB_INTEGRATION,
	GITLAB_INTEGRATION,
	HEIGHT_INTEGRATION,
	JIRA_INTEGRATION,
	LINEAR_INTEGRATION,
} from '@pages/IntegrationsPage/Integrations'
import { IssueTrackerIntegration } from '@pages/IntegrationsPage/IssueTrackerIntegrations'
import { getErrorBody } from '@util/errors/errorUtils'
import { copyToClipboard } from '@util/string'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'

import * as style from './style.css'
interface Props {
	errorGroup: GetErrorGroupQuery['error_group']
}

const ErrorIssueButton = ({ errorGroup }: Props) => {
	const { isLoggedIn } = useAuthContext()
	const { projectId } = useProjectId()

	const { isLinearIntegratedWithProject, loading: isLoadingLinear } =
		useLinearIntegration()

	const { settings: jiraSettings } = useJiraIntegration()
	const { settings: gitlabSettings } = useGitlabIntegration()

	const { isIntegrated: isClickupIntegrated, loading: isLoadingClickUp } =
		useIsProjectIntegratedWith(IntegrationType.ClickUp)

	const { isIntegrated: isHeightIntegrated, loading: isLoadingHeight } =
		useIsProjectIntegratedWith(IntegrationType.Height)

	const { settings: githubSettings } = useGitHubIntegration()

	const { data: errorIssues, loading: isLoadingErrorIssues } =
		useGetErrorIssuesQuery({
			variables: {
				error_group_secure_id: errorGroup?.secure_id ?? '',
			},
			fetchPolicy: 'network-only',
		})

	const [removeErrorIssue, { loading: isDeleting }] =
		useRemoveErrorIssueMutation({
			refetchQueries: [namedOperations.Query.GetErrorIssues],
		})

	const integrations: Array<[boolean | undefined, IssueTrackerIntegration]> =
		useMemo(
			() => [
				[isLinearIntegratedWithProject, LINEAR_INTEGRATION],
				[jiraSettings.isIntegrated, JIRA_INTEGRATION],
				[gitlabSettings.isIntegrated, GITLAB_INTEGRATION],
				[isClickupIntegrated, CLICKUP_INTEGRATION],
				[isHeightIntegrated, HEIGHT_INTEGRATION],
				[githubSettings.isIntegrated, GITHUB_INTEGRATION],
			],
			[
				isClickupIntegrated,
				isLinearIntegratedWithProject,
				jiraSettings.isIntegrated,
				isHeightIntegrated,
				githubSettings.isIntegrated,
				gitlabSettings.isIntegrated,
			],
		)

	const [showNewIssueModal, setShowNewIssueModal] = useState<
		IssueTrackerIntegration | undefined
	>(undefined)

	const defaultIssueTitle = useMemo(() => {
		if (errorGroup?.event) {
			return getErrorBody(errorGroup?.event)
		}
		return `Issue from this bug`
	}, [errorGroup])

	const isLoading =
		isLoadingLinear ||
		jiraSettings.loading ||
		gitlabSettings.loading ||
		isLoadingClickUp ||
		isLoadingHeight ||
		githubSettings.loading ||
		isLoadingErrorIssues

	const [forceIssueCreationMenu, setForceIssueCreationMenu] = useState(false)
	const hasIssue =
		!forceIssueCreationMenu &&
		!isLoading &&
		errorIssues?.error_issue &&
		errorIssues.error_issue.length > 0

	const newIssueMenu = useMemo(() => {
		const options = integrations
			.map(([isIntegrated, integration]) => {
				if (!isIntegrated) return null
				return (
					<Menu.Item
						key={integration?.name}
						onClick={() => setShowNewIssueModal(integration)}
					>
						<Box
							display="flex"
							alignItems="center"
							gap="4"
							style={{ width: '100%' }}
							color="n8"
						>
							<integration.Icon size={16} />
							<Box mr="auto" cssClass={style.menuOption}>
								<Text
									size="small"
									weight="medium"
									userSelect="none"
								>
									{integration?.name} issue
								</Text>
							</Box>
							<IconSolidCheveronRight size={16} />
						</Box>
					</Menu.Item>
				)
			})
			.filter(Boolean)
		return (
			<Menu placement="bottom-end">
				<Menu.Button
					kind="secondary"
					size="small"
					emphasis="high"
					disabled={!isLoggedIn || isLoading || !!showNewIssueModal}
					iconLeft={<IconSolidDocumentAdd />}
				>
					Create Issue
				</Menu.Button>
				<Menu.List>
					<Menu.Heading>
						<Text
							size="xxSmall"
							weight="medium"
							color="n11"
							userSelect="none"
						>
							Attach an issue
						</Text>
					</Menu.Heading>
					{options}
					{options.length > 0 && <Menu.Divider />}
					<Menu.Item>
						<Link to={`/${projectId}/integrations`}>
							<Box
								gap="4"
								display="flex"
								alignItems="center"
								cssClass={style.menuOption}
							>
								<IconSolidPlusSm
									size={16}
									color={vars.theme.static.content.weak}
								/>
								<Text size="small" weight="medium">
									Add new integration
								</Text>
							</Box>
						</Link>
					</Menu.Item>
				</Menu.List>
			</Menu>
		)
	}, [integrations, isLoading, isLoggedIn, projectId, showNewIssueModal])

	const openIssueMenu = useMemo(() => {
		const issue = errorIssues?.error_issue[0]
		if (!errorIssues?.error_issue || !issue) {
			return null
		}
		const Icon = integrations.find(
			(integration) => integration[1]?.name === issue.integration_type,
		)?.[1]?.Icon
		const url = getAttachmentUrl(issue as ExternalAttachment)

		return (
			<Menu placement="bottom-end">
				<Menu.Button
					kind="secondary"
					size="small"
					emphasis="medium"
					disabled={!isLoggedIn || isDeleting || isLoading}
					iconLeft={Icon ? <Icon /> : undefined}
					cssClass={style.issueButton}
				>
					<Text lines="1">{issue.title}</Text>
				</Menu.Button>
				<Menu.List>
					<Menu.Heading>
						<Text
							size="xxSmall"
							weight="medium"
							color="n11"
							userSelect="none"
						>
							Issue details
						</Text>
					</Menu.Heading>
					<Menu.Item
						onClick={() => {
							if (issue) {
								window.open(url, '_blank')
							}
						}}
					>
						<Box
							display="flex"
							alignItems="center"
							gap="4"
							style={{ width: '100%' }}
						>
							<IconSolidExternalLink
								size={16}
								color={vars.theme.static.content.weak}
							/>
							<Box mr="auto" cssClass={style.menuOption}>
								<Text
									size="small"
									weight="medium"
									userSelect="none"
								>
									View in {issue.integration_type}
								</Text>
							</Box>
						</Box>
					</Menu.Item>
					<Menu.Item
						onClick={() => {
							if (issue) {
								copyToClipboard(url, {
									onCopyText: `Copied ${issue.integration_type} issue link to clipboard!`,
								})
							}
						}}
					>
						<Box
							display="flex"
							alignItems="center"
							gap="4"
							style={{ width: '100%' }}
							color="n8"
						>
							<IconSolidClipboardCopy
								size={16}
								color={vars.theme.static.content.weak}
							/>
							<Box mr="auto" cssClass={style.menuOption}>
								<Text
									size="small"
									weight="medium"
									userSelect="none"
								>
									Copy issue link
								</Text>
							</Box>
						</Box>
					</Menu.Item>

					<Menu.Divider />

					<Menu.Item>
						<Box
							gap="4"
							display="flex"
							alignItems="center"
							cssClass={style.menuOption}
							onClick={() => {
								removeErrorIssue({
									variables: { error_issue_id: issue.id },
									onCompleted: () => {
										setForceIssueCreationMenu(true)
									},
								})
							}}
						>
							<IconSolidTrash
								size={16}
								color={vars.theme.static.content.weak}
							/>
							<Text size="small" weight="medium">
								Remove issue
							</Text>
						</Box>
					</Menu.Item>
				</Menu.List>
			</Menu>
		)
	}, [
		removeErrorIssue,
		errorIssues?.error_issue,
		integrations,
		isDeleting,
		isLoading,
		isLoggedIn,
	])

	return (
		<>
			{hasIssue ? openIssueMenu : newIssueMenu}
			<NewIssueModal
				selectedIntegration={showNewIssueModal ?? LINEAR_INTEGRATION}
				visible={!!showNewIssueModal}
				onClose={() => {
					setShowNewIssueModal(undefined)
					setForceIssueCreationMenu(false)
				}}
				commentType="ErrorComment"
				defaultIssueTitle={defaultIssueTitle}
			/>
		</>
	)
}

export default ErrorIssueButton
