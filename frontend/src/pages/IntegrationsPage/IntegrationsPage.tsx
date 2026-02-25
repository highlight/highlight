import { useAuthContext } from '@authentication/AuthContext'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import LoadingBox from '@components/LoadingBox'
import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils'
import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
import { useCloudflareIntegration } from '@pages/IntegrationsPage/components/CloudflareIntegration/utils'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
import { useHerokuIntegration } from '@pages/IntegrationsPage/components/HerokuIntegration/utils'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils'
import INTEGRATIONS from '@pages/IntegrationsPage/Integrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import { Box, Stack, Text } from '@highlight-run/ui/components'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'

import IntegrationDetail from './components/IntegrationDetail'
import * as styles from './IntegrationsPage.css'

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()

	const { integration_type: integrationKey } = useParams<{
		integration_type: string
	}>()

	const navigate = useNavigate()
	const location = useLocation()

	const { isHighlightAdmin } = useAuthContext()
	const { currentWorkspace } = useApplicationContext()

	const { isLinearIntegratedWithProject, loading: loadingLinear } =
		useLinearIntegration()

	const { isZapierIntegratedWithProject, loading: loadingZapier } =
		useZapierIntegration()

	const { isClearbitIntegratedWithWorkspace, loading: loadingClearbit } =
		useClearbitIntegration()

	const { isVercelIntegratedWithProject, loading: loadingVercel } =
		useVercelIntegration()

	const { isDiscordIntegratedWithProject, loading: loadingDiscord } =
		useDiscordIntegration()

	const { isHerokuConnectedToWorkspace, loading: loadingHeroku } =
		useHerokuIntegration()

	const { isCloudflareConnectedToWorkspace, loading: loadingCloudflare } =
		useCloudflareIntegration()

	const {
		isMicrosoftTeamsConnectedToWorkspace,
		loading: loadingMicrosoftTeams,
	} = useMicrosoftTeamsBot()

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

	const enabledIntegrations = integrations.filter(
		(i) => i.defaultEnable,
	)
	const availableIntegrations = integrations.filter(
		(i) => !i.defaultEnable,
	)

	const selectedIntegration = integrations.find(
		(i) => i.key === integrationKey,
	)

	useEffect(() => analytics.page('Integrations'), [])

	useEffect(() => {
		if (!integrationKey && integrations.length > 0) {
			const firstKey =
				enabledIntegrations[0]?.key ||
				availableIntegrations[0]?.key
			if (firstKey) {
				navigate(`${location.pathname}/${firstKey}`, {
					replace: true,
				})
			}
		}
	}, [
		integrationKey,
		integrations.length,
		enabledIntegrations,
		availableIntegrations,
		navigate,
		location.pathname,
	])

	if (loading) {
		return <LoadingBox />
	}

	const basePath = location.pathname.replace(
		new RegExp(`/${integrationKey}$`),
		'',
	)

	return (
		<>
			<Helmet>
				<title>
					{selectedIntegration
						? `${selectedIntegration.name} Integration`
						: 'Integrations'}
				</title>
			</Helmet>
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
					{enabledIntegrations.length > 0 && (
						<Stack gap="0">
							<Box mt="12" mb="4" ml="8">
								<Text
									size="xxSmall"
									color="secondaryContentText"
									cssClass={styles.menuTitle}
								>
									Enabled
								</Text>
							</Box>
							{enabledIntegrations.map((integration) => (
								<NavLink
									key={integration.key}
									to={`${basePath}/${integration.key}`}
									className={({ isActive }) =>
										clsx(styles.menuItem, {
											[styles.menuItemActive]: isActive,
										})
									}
								>
									<img
										src={integration.icon}
										alt=""
										className={styles.integrationIcon}
									/>
									<Text>{integration.name}</Text>
								</NavLink>
							))}
						</Stack>
					)}
					<Stack gap="0">
						<Box mt="12" mb="4" ml="8">
							<Text
								size="xxSmall"
								color="secondaryContentText"
								cssClass={styles.menuTitle}
							>
								Available
							</Text>
						</Box>
						{availableIntegrations.map((integration) => (
							<NavLink
								key={integration.key}
								to={`${basePath}/${integration.key}`}
								className={({ isActive }) =>
									clsx(styles.menuItem, {
										[styles.menuItemActive]: isActive,
									})
								}
							>
								<img
									src={integration.icon}
									alt=""
									className={styles.integrationIcon}
								/>
								<Text>{integration.name}</Text>
							</NavLink>
						))}
					</Stack>
				</Box>
				<Box flexGrow={1} display="flex" flexDirection="column">
					<Box
						m="8"
						backgroundColor="white"
						border="secondary"
						borderRadius="6"
						boxShadow="medium"
						flexGrow={1}
						position="relative"
						overflow="hidden"
					>
						<Box overflowY="scroll" height="full">
							{selectedIntegration ? (
								<IntegrationDetail
									key={selectedIntegration.key}
									integration={selectedIntegration}
								/>
							) : (
								<Box padding="24">
									<Text color="secondaryContentText">
										Select an integration from the sidebar.
									</Text>
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default IntegrationsPage
