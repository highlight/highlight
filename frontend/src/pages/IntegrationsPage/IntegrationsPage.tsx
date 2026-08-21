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
	Integration as IntegrationType,
} from '@pages/IntegrationsPage/Integrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam } from 'use-query-params'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'

import styles from './IntegrationsPage.module.css'

const getIntegrationRouteKey = (routePath?: string) =>
	routePath?.split('/').filter(Boolean)[0]

const IntegrationNavItem = ({
	integration,
	isSelected,
	onSelect,
}: {
	integration: IntegrationType
	isSelected: boolean
	onSelect: (key: string) => void
}) => (
	<button
		type="button"
		className={clsx(styles.integrationNavItem, {
			[styles.integrationNavItemSelected]: isSelected,
		})}
		onClick={() => onSelect(integration.key)}
		aria-pressed={isSelected}
	>
		<span className={styles.integrationNavIconWrap}>
			<img
				src={integration.icon}
				alt=""
				className={clsx(styles.integrationNavIcon, {
					['rounded-none']: integration.noRoundedIcon,
				})}
			/>
		</span>
		<span className={styles.integrationNavCopy}>
			<span className={styles.integrationNavName}>{integration.name}</span>
			<span className={styles.integrationNavDescription}>
				{integration.description}
			</span>
		</span>
		{integration.defaultEnable && (
			<span className={styles.integrationNavStatus}>Connected</span>
		)}
	</button>
)

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()

	const { '*': integrationRoutePath } = useParams<{
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

	const connectedIntegrations = useMemo(
		() => integrations.filter((integration) => integration.defaultEnable),
		[integrations],
	)

	const availableIntegrations = useMemo(
		() => integrations.filter((integration) => !integration.defaultEnable),
		[integrations],
	)

	const routedIntegrationKey = getIntegrationRouteKey(integrationRoutePath)
	const defaultIntegrationKey =
		routedIntegrationKey ||
		popUpModal ||
		connectedIntegrations[0]?.key ||
		integrations[0]?.key

	const [selectedIntegrationKey, setSelectedIntegrationKey] = useState<
		string | undefined
	>(defaultIntegrationKey ?? undefined)

	useEffect(() => {
		if (defaultIntegrationKey) {
			setSelectedIntegrationKey(defaultIntegrationKey)
		}
	}, [defaultIntegrationKey])

	const selectedIntegration =
		integrations.find(
			(integration) => integration.key === selectedIntegrationKey,
		) ?? integrations[0]
	const handleSelectIntegration = (key: string) => {
		setSelectedIntegrationKey(key)
	}

	useEffect(() => analytics.page('Integrations'), [])

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<LeadAlignLayout fullWidth className={styles.page}>
				<div className={styles.header}>
					<div>
						<h2 className={styles.title}>Integrations</h2>
						<p className={styles.subTitle}>
							Supercharge your workflows and attach Highlight with
							the tools you use everyday.
						</p>
					</div>
					<div className={styles.summary}>
						<div className={styles.summaryItem}>
							<span className={styles.summaryValue}>
								{connectedIntegrations.length}
							</span>
							<span className={styles.summaryLabel}>
								Connected
							</span>
						</div>
						<div className={styles.summaryItem}>
							<span className={styles.summaryValue}>
								{availableIntegrations.length}
							</span>
							<span className={styles.summaryLabel}>
								Available
							</span>
						</div>
					</div>
				</div>
				<div className={styles.layout}>
					<aside
						className={styles.sidebar}
						aria-label="Integrations"
					>
						{connectedIntegrations.length > 0 && (
							<section className={styles.integrationNavSection}>
								<h3 className={styles.integrationNavHeading}>
									Connected
								</h3>
								{connectedIntegrations.map((integration) => (
									<IntegrationNavItem
										key={integration.key}
										integration={integration}
										isSelected={
											selectedIntegration?.key ===
											integration.key
										}
										onSelect={handleSelectIntegration}
									/>
								))}
							</section>
						)}
						{availableIntegrations.length > 0 && (
							<section className={styles.integrationNavSection}>
								<h3 className={styles.integrationNavHeading}>
									Available
								</h3>
								{availableIntegrations.map((integration) => (
									<IntegrationNavItem
										key={integration.key}
										integration={integration}
										isSelected={
											selectedIntegration?.key ===
											integration.key
										}
										onSelect={handleSelectIntegration}
									/>
								))}
							</section>
						)}
					</aside>
					<section className={styles.detailPanel}>
						{selectedIntegration && (
							<>
								<div className={styles.detailHeader}>
									<div
										className={styles.detailIconWrap}
										aria-hidden="true"
									>
										<img
											src={selectedIntegration.icon}
											alt=""
											className={clsx(
												styles.detailIcon,
												{
													['rounded-none']:
														selectedIntegration.noRoundedIcon,
												},
											)}
										/>
									</div>
									<div>
										<h3 className={styles.detailTitle}>
											{selectedIntegration.name}
										</h3>
										<p
											className={
												styles.detailDescription
											}
										>
											{selectedIntegration.description}
										</p>
									</div>
								</div>
								<Integration
									integration={selectedIntegration}
									key={selectedIntegration.key}
									showModalDefault={
										popUpModal === selectedIntegration.key
									}
									showSettingsDefault={
										routedIntegrationKey ===
										selectedIntegration.key
									}
									loading={loading}
								/>
							</>
						)}
					</section>
				</div>
			</LeadAlignLayout>
		</>
	)
}

export default IntegrationsPage
