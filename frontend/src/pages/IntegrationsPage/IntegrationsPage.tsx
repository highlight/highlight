import {
	Box,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
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
import React, { useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'
import { useAuthContext } from '@authentication/AuthContext'

import * as styles from './IntegrationsPage.css'
import { IntegrationDetail } from './components/IntegrationDetail'

const IntegrationsPage = () => {
	const navigate = useNavigate()
	const { project_id, '*': wildcardPath } = useParams<{
		project_id: string
		'*': string
	}>()
	// The route is `integrations/*`, so the sub-path (e.g. "slack") comes via the `*` key
	const integration_type = wildcardPath || undefined

	const { isHighlightAdmin } = useAuthContext()
	const { currentWorkspace } = useApplicationContext()

	// Hooks for integration states
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()
	const { isLinearIntegratedWithProject, loading: loadingLinear } = useLinearIntegration()
	const { isZapierIntegratedWithProject, loading: loadingZapier } = useZapierIntegration()
	const { isClearbitIntegratedWithWorkspace, loading: loadingClearbit } = useClearbitIntegration()
	const { isVercelIntegratedWithProject, loading: loadingVercel } = useVercelIntegration()
	const { isDiscordIntegratedWithProject, loading: loadingDiscord } = useDiscordIntegration()
	const { isHerokuConnectedToWorkspace, loading: loadingHeroku } = useHerokuIntegration()
	const { isCloudflareConnectedToWorkspace, loading: loadingCloudflare } = useCloudflareIntegration()
	const { isMicrosoftTeamsConnectedToWorkspace, loading: loadingMicrosoftTeams } = useMicrosoftTeamsBot()
	const { settings: { isIntegrated: isJiraIntegratedWithProject, loading: loadingJira } } = useJiraIntegration()
	const { settings: { isIntegrated: isGitlabIntegratedWithProject, loading: loadingGitlab } } = useGitlabIntegration()
	const { settings: { isIntegrated: isGitHubIntegratedWithProject, loading: loadingGitHub } } = useGitHubIntegration()
	const { settings: { isIntegrated: isClickUpIntegratedWithProject, loading: loadingClickUp } } = useClickUpIntegration()
	const { settings: { isIntegrated: isHeightIntegratedWithProject, loading: loadingHeight } } = useHeightIntegration()

	const integrations = useMemo(() => {
		return INTEGRATIONS.filter((integration) => {
			if (integration.allowlistWorkspaceIds || integration.onlyShowForHighlightAdmin) {
				let canSee = false
				const workspaceID = currentWorkspace?.id
				if (integration.allowlistWorkspaceIds && workspaceID) {
					canSee = canSee || integration.allowlistWorkspaceIds?.includes(workspaceID)
				}
				if (integration.onlyShowForHighlightAdmin) {
					canSee = canSee || isHighlightAdmin
				}
				return canSee
			}
			return true
		}).map((inter) => {
			const isSlack = inter.key === 'slack'
			const isLinear = inter.key === 'linear'
			const isZapier = inter.key === 'zapier'
			const isClearbit = inter.key === 'clearbit'
			const isVercel = inter.key === 'vercel'
			const isDiscord = inter.key === 'discord'
			const isGitHub = inter.key === 'github'
			const isClickUp = inter.key === 'clickup'
			const isHeight = inter.key === 'height'
			const isJira = inter.key === 'jira'
			const isMicrosoftTeams = inter.key === 'microsoft_teams'
			const isGitlab = inter.key === 'gitlab'
			const isHeroku = inter.key === 'heroku'
			const isCloudflare = inter.key === 'cloudflare'

			return {
				...inter,
				defaultEnable:
					(isSlack && isSlackConnectedToWorkspace) ||
					(isLinear && isLinearIntegratedWithProject) ||
					(isZapier && isZapierIntegratedWithProject) ||
					(isClearbit && isClearbitIntegratedWithWorkspace) ||
					(isVercel && isVercelIntegratedWithProject) ||
					(isDiscord && isDiscordIntegratedWithProject) ||
					(isGitHub && isGitHubIntegratedWithProject) ||
					(isClickUp && isClickUpIntegratedWithProject) ||
					(isHeight && isHeightIntegratedWithProject) ||
					(isJira && isJiraIntegratedWithProject) ||
					(isMicrosoftTeams && isMicrosoftTeamsConnectedToWorkspace) ||
					(isGitlab && isGitlabIntegratedWithProject) ||
					(isHeroku && isHerokuConnectedToWorkspace) ||
					(isCloudflare && isCloudflareConnectedToWorkspace),
				loading:
					(isSlack && loadingSlack) ||
					(isLinear && loadingLinear) ||
					(isZapier && loadingZapier) ||
					(isClearbit && loadingClearbit) ||
					(isVercel && loadingVercel) ||
					(isDiscord && loadingDiscord) ||
					(isGitHub && loadingGitHub) ||
					(isClickUp && loadingClickUp) ||
					(isHeight && loadingHeight) ||
					(isJira && loadingJira) ||
					(isMicrosoftTeams && loadingMicrosoftTeams) ||
					(isGitlab && loadingGitlab) ||
					(isHeroku && loadingHeroku) ||
					(isCloudflare && loadingCloudflare),
			}
		})
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
		loadingSlack,
		loadingLinear,
		loadingZapier,
		loadingClearbit,
		loadingVercel,
		loadingDiscord,
		loadingGitHub,
		loadingClickUp,
		loadingHeight,
		loadingJira,
		loadingMicrosoftTeams,
		loadingGitlab,
		loadingHeroku,
		loadingCloudflare,
	])

	const enabledIntegrations = integrations.filter((i) => i.defaultEnable)
	const availableIntegrations = integrations.filter((i) => !i.defaultEnable)

	const selectedIntegration = useMemo(() => {
		return integrations.find((i) => i.key === integration_type) || integrations[0]
	}, [integrations, integration_type])

	useEffect(() => {
		analytics.page('Integrations')
		if (!integration_type && integrations.length > 0) {
			navigate(`/${project_id}/integrations/${integrations[0].key}`, { replace: true })
		}
	}, [integration_type, integrations, navigate, project_id])

	return (
		<Box display="flex" flexDirection="row" flexGrow={1} backgroundColor="raised">
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<Box cssClass={styles.sidebarScroll}>
				<Stack gap="0" p="8">
					{enabledIntegrations.length > 0 && (
						<>
							<div className={styles.menuTitle}>
								Enabled integrations
							</div>
							{enabledIntegrations.map((inter) => (
								<NavLink
									key={inter.key}
									to={`/${project_id}/integrations/${inter.key}`}
									className={({ isActive }) =>
										clsx(styles.menuItem, {
											[styles.menuItemActive]: isActive,
										})
									}
								>
									<img src={inter.icon} alt="" style={{ height: 20, width: 20, borderRadius: 4 }} />
									<Text size="small" weight="medium">{inter.name}</Text>
								</NavLink>
							))}
						</>
					)}
					<div className={styles.menuTitle} style={enabledIntegrations.length > 0 ? { marginTop: 12 } : undefined}>
						Available integrations
					</div>
					{availableIntegrations.map((inter) => (
						<NavLink
							key={inter.key}
							to={`/${project_id}/integrations/${inter.key}`}
							className={({ isActive }) =>
								clsx(styles.menuItem, {
									[styles.menuItemActive]: isActive,
								})
							}
						>
							<img src={inter.icon} alt="" style={{ height: 20, width: 20, borderRadius: 4 }} />
							<Text size="small" weight="medium">{inter.name}</Text>
						</NavLink>
					))}
				</Stack>
			</Box>
			{selectedIntegration && (
				<IntegrationDetail integration={selectedIntegration} />
			)}
		</Box>
	)
}

export default IntegrationsPage
