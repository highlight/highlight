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
import INTEGRATIONS, { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam } from 'use-query-params'
import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { Box, Stack, Text } from '@highlight-run/ui/components'
import clsx from 'clsx'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'

import * as styles from './IntegrationsPage.css'

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()

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

	const connectedIntegrations = integrations.filter((i) => i.defaultEnable)
	const availableIntegrations = integrations.filter((i) => !i.defaultEnable)

	const firstIntegration = connectedIntegrations[0] || availableIntegrations[0]

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<Box display="flex" flexDirection="row" flexGrow={1} backgroundColor="raised">

				{/* SIDEBAR */}
				<Box p="8" gap="12" display="flex" flexDirection="column"
					 borderRight="secondary" position="relative" cssClass={styles.sidebarScroll}>

					{loading ? (
						<Box p="8">
							<Text color="secondaryContentText" size="small">
								Loading integrations...
							</Text>
						</Box>
					) : (
						<>
							{connectedIntegrations.length > 0 && (
								<Stack gap="0">
									<Box mt="12" mb="4" ml="8">
										<Text size="xxSmall" color="secondaryContentText"
											  cssClass={styles.sectionLabel}>
											Connected
										</Text>
									</Box>
									{connectedIntegrations.map((integration) => (
										<NavLink
											key={integration.key}
											to={integration.configurationPath}
											className={({ isActive }) =>
												clsx(styles.menuItem, {
													[styles.menuItemActive]: isActive,
												})
											}
										>
											<Stack direction="row" align="center" gap="6">
												<img src={integration.icon} alt={integration.name}
													 style={{ width: 16, height: 16, objectFit: 'contain' }} />
												<Box
													style={{
														width: 6,
														height: 6,
														borderRadius: '50%',
														background: '#18794E',
													}}
												/>
												<Text>{integration.name}</Text>
											</Stack>
										</NavLink>
									))}
								</Stack>
							)}

							{availableIntegrations.length > 0 && (
								<Stack gap="0">
									<Box mt="12" mb="4" ml="8">
										<Text size="xxSmall" color="secondaryContentText"
											  cssClass={styles.sectionLabel}>
											Available
										</Text>
									</Box>
									{availableIntegrations.map((integration) => (
										<NavLink
											key={integration.key}
											to={integration.configurationPath}
											className={({ isActive }) =>
												clsx(styles.menuItem, {
													[styles.menuItemActive]: isActive,
												})
											}
										>
											<Stack direction="row" align="center" gap="6">
												<img src={integration.icon} alt={integration.name}
													 style={{ width: 16, height: 16, objectFit: 'contain' }} />
												<Text>{integration.name}</Text>
											</Stack>
										</NavLink>
									))}
								</Stack>
							)}
						</>
					)}
				</Box>

				{/* DETAIL PANEL */}
				<Box m="8" backgroundColor="white" flexGrow={1} position="relative" overflow="hidden">
					<Box overflowY="scroll" height="full" p="16">
						<Routes>
							<Route
								path=":integration_type"
								element={
									<IntegrationDetailPanel
										integrations={integrations}
										loading={loading}
										popUpModal={popUpModal}
									/>
								}
							/>
							<Route
								index
								element={
									loading ? null : firstIntegration ? (
										<Navigate
											to={firstIntegration.configurationPath}
											replace
										/>
									) : null
								}
							/>
						</Routes>
					</Box>
				</Box>
			</Box>
		</>
	)
}

const IntegrationDetailPanel = ({
	integrations,
	loading,
	popUpModal,
}: {
	integrations: (IntegrationType & { defaultEnable?: boolean })[]
	loading: boolean
	popUpModal: string | null | undefined
}) => {
	const { integration_type } = useParams<{
		integration_type: string
	}>()
	const match = integrations.find(
		(i) => i.configurationPath === integration_type,
	)
	if (!match) return null
	return (
		<Integration
			integration={match}
			showModalDefault={popUpModal === match.key}
			showSettingsDefault={false}
			loading={loading}
		/>
	)
}

export default IntegrationsPage
