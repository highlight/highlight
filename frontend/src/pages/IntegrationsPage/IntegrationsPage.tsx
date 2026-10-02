import { useAuthContext } from '@authentication/AuthContext'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils'
import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
import { useCloudflareIntegration } from '@pages/IntegrationsPage/components/CloudflareIntegration/utils'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
import { useHerokuIntegration } from '@pages/IntegrationsPage/components/HerokuIntegration/utils'
import Integration from '@pages/IntegrationsPage/components/Integration'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils'
import INTEGRATIONS from '@pages/IntegrationsPage/Integrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam } from 'use-query-params'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import * as settingsRouterStyles from '@/pages/SettingsRouter/SettingsRouter.css'
import clsx from 'clsx'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'


const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()
	const navigate = useNavigate()

	const { '*': configureIntegration } = useParams<{
		'*': string
	}>()

	const [popUpModal] = useQueryParam('enable', StringParam)

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

	useEffect(() => analytics.page('Integrations'), [])

	useEffect(() => {
		if (integrations.length > 0 && (!configureIntegration || configureIntegration === '')) {
			navigate(integrations[0].key, { replace: true })
		}
	}, [configureIntegration, navigate, integrations])

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<Box
				display="flex"
				flexDirection="row"
				flexGrow={1}
				backgroundColor="raised"
			>
				<Box
					p="8"
					gap="12"
					display="flex"
					flexDirection="column"
					borderRight="secondary"
					position="relative"
					cssClass={settingsRouterStyles.sidebarScroll}
				>
					<Stack gap="0">
						<Box mt="12" mb="4" ml="8">
							<Text
								size="xxSmall"
								color="secondaryContentText"
								cssClass={settingsRouterStyles.menuTitle}
							>
								Integrations
							</Text>
						</Box>
						{integrations.map((integration) => (
							<NavLink
								key={integration.key}
								to={integration.key}
								className={({ isActive }) =>
									clsx(settingsRouterStyles.menuItem, {
										[settingsRouterStyles.menuItemActive]: isActive,
									})
								}
							>
								<Stack direction="row" align="center" gap="4">
									<Box style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
										<img
											src={integration.icon}
											alt=""
											style={{
												maxWidth: '100%',
												maxHeight: '100%',
												borderRadius: integration.noRoundedIcon ? 0 : 4,
											}}
										/>
									</Box>
									<Text>{integration.name}</Text>
								</Stack>
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
						<Box overflowY="scroll" height="full" p="12">
							<Routes>
								{integrations.map((integration) => (
									<Route
										key={integration.key}
										path={integration.key}
										element={
											<Box style={{ maxWidth: 560 }} mx="auto" mt="40">
												<Integration
													integration={integration}
													showModalDefault={popUpModal === integration.key}
													showSettingsDefault={configureIntegration === integration.key}
													loading={loading}
												/>
											</Box>
										}
									/>
								))}
							</Routes>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default IntegrationsPage
