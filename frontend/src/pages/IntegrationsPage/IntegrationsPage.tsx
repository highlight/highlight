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
import INTEGRATIONS, {
		IntegrationCategory,
		INTEGRATION_CATEGORIES,
} from '@pages/IntegrationsPage/Integrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam } from 'use-query-params'
import { IconSolidSearch } from '@highlight-run/ui/components'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'
import styles from './IntegrationsPage.module.css'

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

		const [searchQuery, setSearchQuery] = useState('')
		const [activeCategory, setActiveCategory] = useState<IntegrationCategory | 'all'>('all')

		const filteredIntegrations = useMemo(() => {
				return integrations.filter((integration) => {
						const matchesSearch =
								!searchQuery ||
								integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
								integration.description.toLowerCase().includes(searchQuery.toLowerCase())

						const matchesCategory =
								activeCategory === 'all' ||
								integration.category === activeCategory

						return matchesSearch && matchesCategory
				})
		}, [integrations, searchQuery, activeCategory])

		const handleSearchChange = useCallback(
				(e: React.ChangeEvent<HTMLInputElement>) => {
						setSearchQuery(e.target.value)
				},
				[],
		)

		useEffect(() => analytics.page('Integrations'), [])

		return (
				<>
						<Helmet>
								<title>Integrations</title>
						</Helmet>
						<LeadAlignLayout fullWidth>
								<p className={layoutStyles.subTitle}>
										Supercharge your workflows and attach Highlight with the
										tools you use everyday.
								</p>
								<div className={styles.searchBar}>
										<div className={styles.searchWrapper}>
												<IconSolidSearch size={14} className={styles.searchIcon} />
												<input
														type="text"
														className={styles.searchInput}
														placeholder="Search integrations..."
														value={searchQuery}
														onChange={handleSearchChange}
												/>
										</div>
								</div>
								<div className={styles.categoryTabs}>
										<button
												className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.active : ''}`}
												onClick={() => setActiveCategory('all')}
										>
												All
										</button>
										{INTEGRATION_CATEGORIES.map((category) => (
												<button
														key={category}
														className={`${styles.categoryTab} ${activeCategory === category ? styles.active : ''}`}
														onClick={() => setActiveCategory(category)}
												>
														{category}
												</button>
										))}
								</div>
								<div className={styles.integrationsContainer}>
										{filteredIntegrations.length > 0 ? (
												filteredIntegrations.map((integration) => (
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
										) : (
												<div className={styles.noResults}>
														No integrations found matching your search.
												</div>
										)}
								</div>
						</LeadAlignLayout>
				</>
		)
}

export default IntegrationsPage
