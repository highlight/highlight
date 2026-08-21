import { useAuthContext } from '@authentication/AuthContext'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
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
import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam } from 'use-query-params'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'
import { Box, Text } from '@highlight-run/ui/components'

import styles from './IntegrationsPage.module.css'

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()

	const { integration_type: configureIntegration } = useParams<{
		integration_type: string
	}>()

	const [popUpModal] = useQueryParam('enable', StringParam)
	const [searchQuery, setSearchQuery] = useState('')

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

	// Split into connected vs available, with search filter
	const filteredIntegrations = useMemo(() => {
		if (!searchQuery.trim()) return integrations
		const q = searchQuery.toLowerCase()
		return integrations.filter(
			(i) =>
				i.name.toLowerCase().includes(q) ||
				i.description.toLowerCase().includes(q),
		)
	}, [integrations, searchQuery])

	const connectedIntegrations = filteredIntegrations.filter(
		(i) => i.defaultEnable,
	)
	const availableIntegrations = filteredIntegrations.filter(
		(i) => !i.defaultEnable,
	)

	useEffect(() => analytics.page('Integrations'), [])

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<LeadAlignLayout>
				<div className={styles.pageWrapper}>
					{/* Page header */}
					<div className={styles.pageHeader}>
						<Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap="8">
							<div>
								<h2>Integrations</h2>
								<Text color="n9" size="small">
									Supercharge your workflows by connecting Highlight with the tools you use every day.
								</Text>
							</div>
							{/* Search box */}
							<div className={styles.searchWrapper}>
								<input
									type="search"
									placeholder="Search integrations…"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									style={{
										width: '100%',
										padding: '6px 12px',
										borderRadius: 6,
										border: '1px solid var(--color-gray-300)',
										fontSize: 13,
										background: 'var(--color-background)',
										color: 'inherit',
										outline: 'none',
									}}
								/>
							</div>
						</Box>
					</div>

					{/* Connected integrations */}
					{connectedIntegrations.length > 0 && (
						<div className={styles.connectedSection}>
							<span className={styles.sectionLabel}>
								✓ Connected ({connectedIntegrations.length})
							</span>
							<div className={styles.integrationsContainer}>
								{connectedIntegrations.map((integration) => (
									<Integration
										integration={integration}
										key={integration.key}
										showModalDefault={popUpModal === integration.key}
										showSettingsDefault={
											configureIntegration === integration.key
										}
										loading={loading}
									/>
								))}
							</div>
						</div>
					)}

					{/* Available integrations */}
					<div className={styles.connectedSection}>
						{connectedIntegrations.length > 0 && (
							<span className={styles.sectionLabel}>
								Available ({availableIntegrations.length})
							</span>
						)}
						<div className={styles.integrationsContainer}>
							{availableIntegrations.length === 0 && searchQuery ? (
								<div className={styles.emptyState}>
									No integrations match "{searchQuery}"
								</div>
							) : (
								availableIntegrations.map((integration) => (
									<Integration
										integration={integration}
										key={integration.key}
										showModalDefault={popUpModal === integration.key}
										showSettingsDefault={
											configureIntegration === integration.key
										}
										loading={loading}
									/>
								))
							)}
						</div>
					</div>
				</div>
			</LeadAlignLayout>
		</>
	)
}

export default IntegrationsPage
