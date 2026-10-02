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
	type IntegrationCategory,
	type Integration as IntegrationType,
} from '@pages/IntegrationsPage/Integrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import {
	Box,
	IconSolidSearch,
	IconSolidSwitchHorizontal,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam } from 'use-query-params'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'

import styles from './IntegrationsPage.module.css'

const CATEGORY_CONFIG: Record<
	IntegrationCategory,
	{ label: string; description: string }
> = {
	'Issue Tracker': {
		label: 'Issue Trackers',
		description:
			'Create and link issues from your Highlight comments and errors.',
	},
	Communication: {
		label: 'Communication',
		description:
			'Receive alerts and notifications in your team communication tools.',
	},
	Deployment: {
		label: 'Deployment & CI/CD',
		description:
			'Connect your deployment pipeline for enhanced tracing and visibility.',
	},
	Data: {
		label: 'Data & Analytics',
		description:
			'Enhance your monitoring stack with additional data sources.',
	},
	Automation: {
		label: 'Automation',
		description:
			'Automate workflows and connect Highlight with other tools.',
	},
}

const CATEGORY_TABS: Array<IntegrationCategory | 'all'> = [
	'all',
	'Issue Tracker',
	'Communication',
	'Deployment',
	'Data',
	'Automation',
]

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
						integration.allowlistWorkspaceIds?.includes(
							workspaceID,
						)
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
	const [activeCategory, setActiveCategory] = useState<
		IntegrationCategory | 'all'
	>('all')

	const filteredIntegrations = useMemo(() => {
		return integrations.filter((integration) => {
			const matchesSearch =
				!searchQuery ||
				integration.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase()) ||
				integration.description
					.toLowerCase()
					.includes(searchQuery.toLowerCase())

			const matchesCategory =
				activeCategory === 'all' ||
				integration.category === activeCategory

			return matchesSearch && matchesCategory
		})
	}, [integrations, searchQuery, activeCategory])

	const categorizedGroups = useMemo(() => {
		const filtered =
			activeCategory === 'all'
				? integrations
				: integrations.filter((i) => i.category === activeCategory)

		const keysByCategory: Record<IntegrationCategory, string[]> = {
			'Issue Tracker': [
				'linear',
				'github',
				'jira',
				'gitlab',
				'clickup',
				'height',
			],
			Communication: ['slack', 'discord', 'microsoft_teams'],
			Deployment: ['vercel', 'cloudflare', 'heroku'],
			Data: ['clearbit'],
			Automation: ['zapier'],
		}

		const integrationMap = new Map<string, IntegrationType>()
		for (const i of filtered) {
			integrationMap.set(i.key, i)
		}

		const catOrder: IntegrationCategory[] = [
			'Issue Tracker',
			'Communication',
			'Deployment',
			'Data',
			'Automation',
		]

		const seen = new Set<IntegrationCategory>()
		for (const i of filtered) {
			seen.add(i.category)
		}

		return catOrder
			.filter((cat) => seen.has(cat))
			.map((cat) => ({
				category: cat,
				label: CATEGORY_CONFIG[cat].label,
				description: CATEGORY_CONFIG[cat].description,
				items: keysByCategory[cat]
					.map((key) => integrationMap.get(key))
					.filter(
						(i): i is IntegrationType => i !== undefined,
					),
			}))
			.filter((group) => group.items.length > 0)
	}, [integrations, activeCategory])

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchQuery(e.target.value)
		},
		[],
	)

	const hasResults = filteredIntegrations.length > 0

	useEffect(() => analytics.page('Integrations'), [])

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<LeadAlignLayout>
				<Stack direction="column" gap="24" width="full">
					{/* Header */}
					<Box>
						<h2>Integrations</h2>
						<Text color="n11" size="small">
							Connect Highlight with the tools you use everyday.
						</Text>
					</Box>

					{/* Search bar */}
					<Box
						display="flex"
						alignItems="center"
						gap="8"
						p="8"
						px="12"
						border="dividerWeak"
						borderRadius="8"
						cssClass={styles.searchWrapper}
					>
						<IconSolidSearch size={16} />
						<Box
							as="input"
							type="text"
							placeholder="Search integrations..."
							value={searchQuery}
							onChange={handleSearchChange}
							cssClass={styles.searchInput}
						/>
					</Box>

					{/* Category tabs */}
					<Box display="flex" gap="8" flexWrap="wrap">
						{CATEGORY_TABS.map((tab) => {
							const isActive = tab === activeCategory
							return (
								<Box
									key={tab}
									as="button"
									onClick={() =>
										setActiveCategory(
											tab as
												| IntegrationCategory
												| 'all',
										)
									}
									p="6"
									px="12"
									borderRadius="6"
									cursor="pointer"
									cssClass={[
										styles.categoryTab,
										isActive && styles.categoryTabActive,
									]}
								>
									<Text
										size="small"
										color={isActive ? 'p11' : 'n11'}
										weight={
											isActive ? 'bold' : 'regular'
										}
									>
										{tab === 'all'
											? 'All'
											: CATEGORY_CONFIG[tab].label}
									</Text>
								</Box>
							)
						})}
					</Box>

					{/* Integration cards */}
					{hasResults ? (
						<Stack direction="column" gap="32">
							{categorizedGroups.map((group) => (
								<Box key={group.category}>
									<Box
										display="flex"
										flexDirection="column"
										gap="4"
										mb="12"
									>
										<Text
											size="small"
											weight="bold"
											color="strong"
										>
											{group.label}
										</Text>
										<Text size="xSmall" color="n11">
											{group.description}
										</Text>
									</Box>
									<div className={styles.integrationsGrid}>
										{group.items.map((integration) => (
											<Integration
												integration={integration}
												key={integration.key}
												showModalDefault={
													popUpModal ===
													integration.key
												}
												showSettingsDefault={
													configureIntegration ===
													integration.key
												}
												loading={loading}
											/>
										))}
									</div>
								</Box>
							))}
						</Stack>
					) : (
						<Stack
							direction="column"
							alignItems="center"
							gap="12"
							py="48"
						>
							<IconSolidSwitchHorizontal size={32} />
							<Text color="n11" size="small">
								No integrations found
							</Text>
							<Text color="n9" size="xSmall">
								Try adjusting your search or filter.
							</Text>
						</Stack>
					)}
				</Stack>
			</LeadAlignLayout>
		</>
	)
}

export default IntegrationsPage
