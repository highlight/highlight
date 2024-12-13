import { Box, Stack, Text } from '@highlight-run/ui/components'
import { useAuthContext } from '@/authentication/AuthContext'
import { useSlackBot } from '@/components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { useEffect, useMemo } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useParams } from '@util/react-router/useParams'
import { useClearbitIntegration } from '../IntegrationsPage/components/ClearbitIntegration/utils'
import { useClickUpIntegration } from '../IntegrationsPage/components/ClickUpIntegration/utils'
import { useCloudflareIntegration } from '../IntegrationsPage/components/CloudflareIntegration/utils'
import { useDiscordIntegration } from '../IntegrationsPage/components/DiscordIntegration/utils'
import { useGitHubIntegration } from '../IntegrationsPage/components/GitHubIntegration/utils'
import { useGitlabIntegration } from '../IntegrationsPage/components/GitlabIntegration/utils'
import { useHeightIntegration } from '../IntegrationsPage/components/HeightIntegration/utils'
import { useHerokuIntegration } from '../IntegrationsPage/components/HerokuIntegration/utils'
import { useJiraIntegration } from '../IntegrationsPage/components/JiraIntegration/utils'
import { useLinearIntegration } from '../IntegrationsPage/components/LinearIntegration/utils'
import { useMicrosoftTeamsBot } from '../IntegrationsPage/components/MicrosoftTeamsIntegration/utils'
import { useVercelIntegration } from '../IntegrationsPage/components/VercelIntegration/utils'
import { useZapierIntegration } from '../IntegrationsPage/components/ZapierIntegration/utils'
import INTEGRATIONS from '../IntegrationsPage/Integrations'
import { Integration } from '../IntegrationsPage/Integrations'
import * as styles from './IntergationSettings.css'
import clsx from 'clsx'
import { Card } from 'antd'
import LoadingBox from '@/components/LoadingBox'
import SwitchIntergations from '../SwitchIntergation/SwitchIntergation'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'
import { useIntergationProjectConfig } from '../IntegrationsPage/components/common/ProjectSelection'

export default function IntergationSettings() {
	const { workspace_id, intergate_type } = useParams<{
		workspace_id: string
		intergate_type?: string
	}>()

	const { selectedProject } = useIntergationProjectConfig()

	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot(
		selectedProject.value,
	)
	const navigate = useNavigate()

	const { isHighlightAdmin } = useAuthContext()
	const { currentWorkspace } = useApplicationContext()
	const { isLinearIntegratedWithProject, loading: loadingLinear } =
		useLinearIntegration(selectedProject.value)

	const { isZapierIntegratedWithProject, loading: loadingZapier } =
		useZapierIntegration(selectedProject.value)

	const { isClearbitIntegratedWithWorkspace, loading: loadingClearbit } =
		useClearbitIntegration(selectedProject.value)

	const { isVercelIntegratedWithProject, loading: loadingVercel } =
		useVercelIntegration(selectedProject.value)

	const { isDiscordIntegratedWithProject, loading: loadingDiscord } =
		useDiscordIntegration(selectedProject.value)

	const { isHerokuConnectedToWorkspace, loading: loadingHeroku } =
		useHerokuIntegration(selectedProject.value)

	const { isCloudflareConnectedToWorkspace, loading: loadingCloudflare } =
		useCloudflareIntegration()

	const {
		isMicrosoftTeamsConnectedToWorkspace,
		loading: loadingMicrosoftTeams,
	} = useMicrosoftTeamsBot(null, selectedProject.value)

	const {
		settings: {
			isIntegrated: isJiraIntegratedWithProject,
			loading: loadingJira,
		},
	} = useJiraIntegration()

	const {
		settings: {
			isIntegrated: isGitlabIntegratedWithProject,
			loading: loadingGitlab,
		},
	} = useGitlabIntegration()

	const {
		settings: {
			isIntegrated: isGitHubIntegratedWithProject,
			loading: loadingGitHub,
		},
	} = useGitHubIntegration()

	const {
		settings: {
			isIntegrated: isClickUpIntegratedWithProject,
			loading: loadingClickUp,
		},
	} = useClickUpIntegration()

	const {
		settings: {
			isIntegrated: isHeightIntegratedWithProject,
			loading: loadingHeight,
		},
	} = useHeightIntegration()

	const loading =
		loadingLinear ||
		loadingSlack ||
		loadingZapier ||
		loadingClearbit ||
		loadingVercel ||
		loadingDiscord ||
		loadingClickUp ||
		loadingHeight ||
		loadingGitHub ||
		loadingJira ||
		loadingGitlab ||
		loadingMicrosoftTeams ||
		loadingHeroku ||
		loadingCloudflare

	const integrations = useMemo(() => {
		return INTEGRATIONS.filter((integration) => {
			if (
				integration.allowlistWorkspaceIds ||
				integration.onlyShowForHighlightAdmin
			) {
				let canSee = false

				const workspaceID = currentWorkspace?.id

				if (integration.allowlistWorkspaceIds && workspaceID) {
					canSee =
						canSee ||
						integration.allowlistWorkspaceIds?.includes(workspaceID)
				}

				if (integration.onlyShowForHighlightAdmin) {
					canSee = canSee || isHighlightAdmin
				}
				return canSee
			} else {
				return true
			}
		}).map((inter) => ({
			...inter,
			defaultEnable:
				(inter.key === 'slack' && isSlackConnectedToWorkspace) ||
				(inter.key === 'linear' && isLinearIntegratedWithProject) ||
				(inter.key === 'zapier' && isZapierIntegratedWithProject) ||
				(inter.key === 'clearbit' &&
					isClearbitIntegratedWithWorkspace) ||
				(inter.key === 'vercel' && isVercelIntegratedWithProject) ||
				(inter.key === 'discord' && isDiscordIntegratedWithProject) ||
				(inter.key === 'github' && isGitHubIntegratedWithProject) ||
				(inter.key === 'clickup' && isClickUpIntegratedWithProject) ||
				(inter.key === 'height' && isHeightIntegratedWithProject) ||
				(inter.key === 'jira' && isJiraIntegratedWithProject) ||
				(inter.key === 'microsoft_teams' &&
					isMicrosoftTeamsConnectedToWorkspace) ||
				(inter.key === 'gitlab' && isGitlabIntegratedWithProject) ||
				(inter.key === 'heroku' && isHerokuConnectedToWorkspace) ||
				(inter.key === 'cloudflare' &&
					isCloudflareConnectedToWorkspace),
		}))
	}, [
		currentWorkspace?.id,
		isHighlightAdmin,
		isSlackConnectedToWorkspace,
		isLinearIntegratedWithProject,
		isZapierIntegratedWithProject,
		isClearbitIntegratedWithWorkspace,
		isVercelIntegratedWithProject,
		isDiscordIntegratedWithProject,
		isGitHubIntegratedWithProject,
		isClickUpIntegratedWithProject,
		isHeightIntegratedWithProject,
		isJiraIntegratedWithProject,
		isMicrosoftTeamsConnectedToWorkspace,
		isGitlabIntegratedWithProject,
		isHerokuConnectedToWorkspace,
		isCloudflareConnectedToWorkspace,
	])

	const location = useLocation()

	const enabledIntergation = integrations?.filter((tab) => tab.defaultEnable)
	const availableIntergation = integrations?.filter(
		(tab) => !tab.defaultEnable,
	)

	const integration = integrations.find(
		(inter) => inter.key === intergate_type,
	) as Integration

	useEffect(() => {
		if (!intergate_type) {
			const tempIntergateType =
				enabledIntergation?.[0]?.key ||
				availableIntergation?.[0]?.key ||
				'vercel'
			navigate(`${location.pathname}/${tempIntergateType}`, {
				replace: true,
			})
		}
	}, [
		availableIntergation,
		enabledIntergation,
		intergate_type,
		location.pathname,
		navigate,
		workspace_id,
	])

	if (loading || !intergate_type) {
		return (
			<Card>
				<LoadingBox height={156} />
			</Card>
		)
	}

	return (
		<Box
			display="flex"
			flexDirection="row"
			flexGrow={1}
			backgroundColor="raised"
			height="full"
		>
			<Box
				p="8"
				gap="12"
				display="flex"
				flexDirection="column"
				borderRight="secondary"
				position="relative"
				cssClass={styles.sidebarScroll}
			>
				<Stack gap="0">
					<Box mt="12" mb="4" ml="8">
						<Text
							size="xxSmall"
							color="secondaryContentText"
							cssClass={styles.menuTitle}
						>
							Enabled Integrations
						</Text>
					</Box>
					{enabledIntergation.map((tab) => (
						<NavLink
							key={tab.key}
							to={`/w/${workspace_id}/integrations/${tab.key}`}
							className={({ isActive }) =>
								clsx(styles.menuItem, {
									[styles.menuItemActive]: isActive,
								})
							}
						>
							<Stack direction="row" align="center" gap="4">
								<img
									src={tab.icon}
									alt=""
									style={{
										borderRadius: '50%',
										height: '16px',
										width: '16px',
									}}
								/>
								<Text>{tab.name}</Text>
							</Stack>
						</NavLink>
					))}
				</Stack>
				<Stack gap="0">
					<Box mt="12" mb="4" ml="8">
						<Text
							size="xxSmall"
							color="secondaryContentText"
							cssClass={styles.menuTitle}
						>
							Available Integrations
						</Text>
					</Box>
					{availableIntergation.map((tab) => (
						<NavLink
							key={tab.key}
							to={`/w/${workspace_id}/integrations/${tab.key}`}
							className={({ isActive }) =>
								clsx(styles.menuItem, {
									[styles.menuItemActive]: isActive,
								})
							}
						>
							<Stack direction="row" align="center" gap="4">
								<img
									src={tab.icon}
									alt=""
									style={{
										borderRadius: '50%',
										height: '16px',
										width: '16px',
									}}
								/>
								<Text>{tab.name}</Text>
							</Stack>
						</NavLink>
					))}
				</Stack>
			</Box>
			{integration && (
				<Box
					flexGrow={1}
					display="flex"
					flexDirection="column"
					backgroundColor="white"
				>
					<SwitchIntergations integration={integration} />
				</Box>
			)}
		</Box>
	)
}
