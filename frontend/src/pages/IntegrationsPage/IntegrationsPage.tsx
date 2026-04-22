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
import INTEGRATIONS, {
	Integration as IntegrationType,
} from '@pages/IntegrationsPage/Integrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import clsx from 'clsx'
import { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import {
	NavLink,
	Navigate,
	Route,
	Routes,
} from 'react-router-dom'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'

import { Box, Stack, Text } from '@highlight-run/ui/components'

import * as styles from './IntegrationsPage.css'

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()

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

	const enabledIntegrations = useMemo(
		() => integrations.filter((i: IntegrationType) => i.defaultEnable),
		[integrations],
	)
	const availableIntegrations = useMemo(
		() => integrations.filter((i: IntegrationType) => !i.defaultEnable),
		[integrations],
	)

	const firstIntegration =
		enabledIntegrations[0] || availableIntegrations[0] || integrations[0]

	useEffect(() => analytics.page('Integrations'), [])

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
									to={integration.key}
									className={({ isActive }) =>
										clsx(styles.menuItem, {
											[styles.menuItemActive]: isActive,
										})
									}
								>
									<img
										src={integration.icon}
										alt=""
										className={clsx(
											styles.integrationIcon,
											{
												[styles.integrationIconSquare]:
													integration.noRoundedIcon,
											},
										)}
									/>
									<Text size="small">
										{integration.name}
									</Text>
									<span className={styles.statusDot} />
								</NavLink>
							))}
						</Stack>
					)}
					{availableIntegrations.length > 0 && (
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
									to={integration.key}
									className={({ isActive }) =>
										clsx(styles.menuItem, {
											[styles.menuItemActive]: isActive,
										})
									}
								>
									<img
										src={integration.icon}
										alt=""
										className={clsx(
											styles.integrationIcon,
											{
												[styles.integrationIconSquare]:
													integration.noRoundedIcon,
											},
										)}
									/>
									<Text size="small">
										{integration.name}
									</Text>
								</NavLink>
							))}
						</Stack>
					)}
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
						<Box overflowY="scroll" height="full" p="24">
							<Routes>
								{integrations.map((integration) => (
									<Route
										key={integration.key}
										path={integration.key}
										element={
											<Stack gap="16">
												<Box
													cssClass={
														styles.detailHeader
													}
												>
													<img
														src={integration.icon}
														alt=""
														className={clsx(
															styles.detailIcon,
															{
																[styles.detailIconSquare]:
																	integration.noRoundedIcon,
															},
														)}
													/>
													<Text
														size="large"
														weight="bold"
													>
														{integration.name}
													</Text>
												</Box>
												<Integration
													integration={integration}
													showModalDefault={false}
													showSettingsDefault={false}
													loading={loading}
												/>
											</Stack>
										}
									/>
								))}
								{firstIntegration && (
									<Route
										path="*"
										element={
											<Navigate
												to={firstIntegration.key}
												replace
											/>
										}
									/>
								)}
							</Routes>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}

export default IntegrationsPage
