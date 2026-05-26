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

import { IntegrationCategory } from '@pages/IntegrationsPage/Integrations'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
import styles from './IntegrationsPage.module.css'

const CATEGORY_LABELS: Record<IntegrationCategory, { label: string; icon: string }> = {
	issue_tracker: { label: 'Issue Trackers', icon: '🎯' },
	communication: { label: 'Communication', icon: '💬' },
	deployment: { label: 'Deployment', icon: '🚀' },
	automation: { label: 'Automation', icon: '⚡' },
	analytics: { label: 'Analytics', icon: '📊' },
}

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()

	const { integration_type: configureIntegration } = useParams<{
		integration_type: string
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

	const [searchQuery, setSearchQuery] = useState('')

	const integrations = useMemo(() => {
		const filtered = INTEGRATIONS.filter((integration) => {
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

		if (!searchQuery.trim()) return filtered

		const query = searchQuery.toLowerCase()
		return filtered.filter(
			(i) =>
				i.name.toLowerCase().includes(query) ||
				i.description.toLowerCase().includes(query) ||
				i.key.toLowerCase().includes(query),
		)
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
		searchQuery,
	])

	const groupedIntegrations = useMemo(() => {
		const groups: Record<string, typeof integrations> = {}
		const categories: IntegrationCategory[] = [
			'issue_tracker',
			'communication',
			'deployment',
			'automation',
			'analytics',
		]

		for (const cat of categories) {
			const items = integrations.filter((i) => i.category === cat)
			if (items.length > 0) {
				groups[cat] = items
			}
		}

		return groups
	}, [integrations])

	const categoryOrder: IntegrationCategory[] = [
		'issue_tracker',
		'communication',
		'deployment',
		'automation',
		'analytics',
	]

	useEffect(() => analytics.page('Integrations'), [])

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<LeadAlignLayout fullWidth className={styles.pageLayout}>
				<div className={styles.pageHeader}>
					<h2>Integrations</h2>
					<p className={styles.pageSubtitle}>
						Supercharge your workflows and connect Highlight with
						the tools you use everyday.
					</p>
					<p className={styles.integrationCount}>
						{integrations.length} integration
						{integrations.length !== 1 ? 's' : ''} available
					</p>
				</div>

				<div className={styles.searchContainer}>
					<input
						type="text"
						className={styles.searchInput}
						placeholder="Search integrations..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{searchQuery.trim() ? (
					<div className={styles.integrationsGrid}>
						{integrations.length > 0 ? (
							integrations.map((integration) => (
								<Integration
									integration={integration}
									key={integration.key}
									showModalDefault={
										popUpModal === integration.key
									}
									showSettingsDefault={
										configureIntegration ===
										integration.key
									}
									loading={loading}
								/>
							))
						) : (
							<div className={styles.noResults}>
								No integrations found for{' '}
								<strong>"{searchQuery}"</strong>
							</div>
						)}
					</div>
				) : (
					categoryOrder.map((cat) => {
						const items = groupedIntegrations[cat]
						if (!items) return null
						const info = CATEGORY_LABELS[cat]
						return (
							<div
								key={cat}
								className={styles.categorySection}
							>
								<div className={styles.categoryHeader}>
									<span className={styles.categoryIcon}>
										{info.icon}
									</span>
									<h3 className={styles.categoryTitle}>
										{info.label}
									</h3>
									<span className={styles.categoryCount}>
										{items.length}
									</span>
								</div>
								<div className={styles.integrationsGrid}>
									{items.map((integration) => (
										<Integration
											integration={integration}
											key={integration.key}
											showModalDefault={
												popUpModal === integration.key
											}
											showSettingsDefault={
												configureIntegration ===
												integration.key
											}
											loading={loading}
										/>
									))}
								</div>
							</div>
						)
					})
				)}
			</LeadAlignLayout>
		</>
	)
}

export default IntegrationsPage
