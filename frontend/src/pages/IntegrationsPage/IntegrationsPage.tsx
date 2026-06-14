import { useAuthContext } from '@authentication/AuthContext'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import {
	Box,
	IconSolidSearch,
	Stack,
	Tabs,
	Text,
} from '@highlight-run/ui/components'
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
} from '@pages/IntegrationsPage/Integrations'
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

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()

	const { integration_type: configureIntegration } = useParams<{
		integration_type: string
	}>()

	const [popUpModal] = useQueryParam('enable', StringParam)

	const { isHighlightAdmin } = useAuthContext()
	const { currentWorkspace } = useApplicationContext()

	const [searchTerm, setSearchTerm] = useState('')
	const [activeCategory, setActiveCategory] = useState<string>('All')

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
			const matchesSearch =
				integration.name
					.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				integration.description
					.toLowerCase()
					.includes(searchTerm.toLowerCase())

			const matchesCategory =
				activeCategory === 'All' || integration.category === activeCategory

			if (!matchesSearch || !matchesCategory) {
				return false
			}

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
		searchTerm,
		activeCategory,
	])

	useEffect(() => analytics.page('Integrations'), [])

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<LeadAlignLayout>
				<Stack gap="24">
					<Box>
						<h2>Integrations</h2>
						<p className={layoutStyles.subTitle}>
							Supercharge your workflows and attach Highlight
							with the tools you use everyday.
						</p>
					</Box>

					<Box
						display="flex"
						flexDirection={['column', 'row']}
						justifyContent="space-between"
						alignItems={['stretch', 'center']}
						gap="16"
					>
						<Box style={{ maxWidth: 400, flexGrow: 1 }}>
							<div className="relative">
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<IconSolidSearch
										className="text-gray-400"
										size={16}
									/>
								</div>
								<input
									type="text"
									className="block w-full rounded-md border-gray-300 py-2 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
									placeholder="Search integrations..."
									value={searchTerm}
									onChange={(e) =>
										setSearchTerm(e.target.value)
									}
								/>
							</div>
						</Box>

						<Tabs
							activeKey={activeCategory}
							onChange={setActiveCategory}
							noHeaderPadding
							noBorders
						>
							<Tabs.List>
								{['All', ...Object.values(IntegrationCategory)].map(
									(cat) => (
										<Tabs.Tab id={cat} key={cat}>
											{cat}
										</Tabs.Tab>
									),
								)}
							</Tabs.List>
						</Tabs>
					</Box>

					{integrations.length > 0 ? (
						<div className={styles.integrationsContainer}>
							{integrations.map((integration) => (
								<Integration
									integration={integration}
									key={integration.key}
									showModalDefault={
										popUpModal === integration.key
									}
									showSettingsDefault={
										configureIntegration === integration.key
									}
									loading={loading}
								/>
							))}
						</div>
					) : (
						<Box
							display="flex"
							flexDirection="column"
							alignItems="center"
							justifyContent="center"
							py="64"
							gap="12"
						>
							<Text color="weak" size="large">
								No integrations found matching your search.
							</Text>
						</Box>
					)}
				</Stack>
			</LeadAlignLayout>
		</>
	)
}

export default IntegrationsPage
