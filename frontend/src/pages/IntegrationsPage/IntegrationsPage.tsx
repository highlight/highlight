import { useAuthContext } from '@authentication/AuthContext'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import Input from '@components/Input/Input'
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

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
import styles from './IntegrationsPage.module.css'

const CATEGORY_LABELS = {
	all: 'All integrations',
	alerting: 'Alerts & ChatOps',
	issues: 'Issue tracking',
	platform: 'Platform & data',
} as const

type CategoryKey = keyof typeof CATEGORY_LABELS

const CATEGORY_BY_INTEGRATION: Record<string, Exclude<CategoryKey, 'all'>> = {
	slack: 'alerting',
	discord: 'alerting',
	microsoft_teams: 'alerting',
	zapier: 'alerting',
	linear: 'issues',
	clickup: 'issues',
	height: 'issues',
	github: 'issues',
	gitlab: 'issues',
	jira: 'issues',
	clearbit: 'platform',
	vercel: 'platform',
	heroku: 'platform',
	cloudflare: 'platform',
}

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()
	const [searchQuery, setSearchQuery] = useState('')
	const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')

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

	const filteredIntegrations = useMemo(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase()

		return integrations.filter((integration) => {
			const category =
				CATEGORY_BY_INTEGRATION[integration.key] ?? 'platform'
			const matchesCategory =
				activeCategory === 'all' || category === activeCategory
			const matchesQuery =
				normalizedQuery.length === 0 ||
				integration.name.toLowerCase().includes(normalizedQuery) ||
				integration.description.toLowerCase().includes(normalizedQuery)

			return matchesCategory && matchesQuery
		})
	}, [activeCategory, integrations, searchQuery])

	const groupedIntegrations = useMemo(() => {
		return filteredIntegrations.reduce(
			(groups, integration) => {
				const category =
					CATEGORY_BY_INTEGRATION[integration.key] ?? 'platform'
				groups[category].push(integration)
				return groups
			},
			{
				alerting: [],
				issues: [],
				platform: [],
			} as Record<
				Exclude<CategoryKey, 'all'>,
				typeof filteredIntegrations
			>,
		)
	}, [filteredIntegrations])

	const connectedCount = useMemo(
		() =>
			integrations.filter((integration) => integration.defaultEnable)
				.length,
		[integrations],
	)

	useEffect(() => analytics.page('Integrations'), [])

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<LeadAlignLayout fullWidth maxWidth={1240}>
				<section className={styles.hero}>
					<div className={styles.heroCopy}>
						<span className={styles.eyebrow}>
							Workspace connections
						</span>
						<h1 className={styles.title}>
							Integrations that keep incidents moving.
						</h1>
						<p className={layoutStyles.subTitle}>
							Connect chat, issue tracking, and platform tooling
							without leaving Highlight. Filter the catalog, spot
							what is already live, and jump straight into
							configuration.
						</p>
					</div>
					<div className={styles.heroStats}>
						<div className={styles.statCard}>
							<span className={styles.statValue}>
								{integrations.length}
							</span>
							<span className={styles.statLabel}>Available</span>
						</div>
						<div className={styles.statCard}>
							<span className={styles.statValue}>
								{connectedCount}
							</span>
							<span className={styles.statLabel}>Connected</span>
						</div>
						<div className={styles.statCard}>
							<span className={styles.statValue}>3</span>
							<span className={styles.statLabel}>
								Curated lanes
							</span>
						</div>
					</div>
				</section>

				<section className={styles.controls}>
					<div className={styles.filterBar}>
						{(Object.keys(CATEGORY_LABELS) as CategoryKey[]).map(
							(category) => (
								<button
									type="button"
									key={category}
									className={styles.filterChip}
									data-active={activeCategory === category}
									onClick={() => setActiveCategory(category)}
								>
									{CATEGORY_LABELS[category]}
								</button>
							),
						)}
					</div>
					<Input
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Search integrations"
						className={styles.search}
					/>
				</section>

				{(['alerting', 'issues', 'platform'] as const).map(
					(category) => {
						const items = groupedIntegrations[category]
						if (items.length === 0) {
							return null
						}

						return (
							<section className={styles.section} key={category}>
								<div className={styles.sectionHeader}>
									<div>
										<h2>{CATEGORY_LABELS[category]}</h2>
										<p className={styles.sectionSubtitle}>
											{category === 'alerting' &&
												'Route alerts and operational updates into the channels your team already watches.'}
											{category === 'issues' &&
												'Turn comments into tickets and keep engineering follow-up anchored to the original context.'}
											{category === 'platform' &&
												'Wire deployment, edge, and enrichment services into the same workspace view.'}
										</p>
									</div>
									<span className={styles.sectionCount}>
										{items.length}
									</span>
								</div>
								<div className={styles.integrationsContainer}>
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
							</section>
						)
					},
				)}

				{filteredIntegrations.length === 0 && (
					<section className={styles.emptyState}>
						<h2>No integrations match this filter.</h2>
						<p>
							Try a different category or clear the search to see
							the full catalog again.
						</p>
					</section>
				)}
			</LeadAlignLayout>
		</>
	)
}

export default IntegrationsPage
