import { useAuthContext } from '@authentication/AuthContext'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { IconSolidExternalLink, Stack, Text } from '@highlight-run/ui/components'
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
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'
import { IntegrationModal } from '@/pages/IntegrationsPage/components/IntegrationModal'
import { Button } from '@/components/Button'

import styles from './IntegrationsPage.module.css'

const IntegrationsPage = () => {
	const { isSlackConnectedToWorkspace, loading: loadingSlack } = useSlackBot()

	const { integration_type: selectedIntegrationKey } = useParams<{
		integration_type: string
	}>()

	const [popUpModal] = useQueryParam('enable', StringParam)
	const navigate = useNavigate()
	const [modalOpen, setModalOpen] = useState(false)
	const [activeTab, setActiveTab] = useState<'description' | 'configure'>(
		'description',
	)

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
			}
			return true
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

	useEffect(() => {
		if (!selectedIntegrationKey && integrations.length > 0) {
			navigate(`/integrations/${integrations[0].key}`, { replace: true })
		}
	}, [selectedIntegrationKey, integrations, navigate])

	// Reset to description tab when switching integrations
	useEffect(() => {
		setActiveTab('description')
	}, [selectedIntegrationKey])

	useEffect(() => {
		if (popUpModal && popUpModal === selectedIntegrationKey) {
			setModalOpen(true)
		}
	}, [popUpModal, selectedIntegrationKey])

	const selectedIntegration = useMemo(
		() => integrations.find((i) => i.key === selectedIntegrationKey),
		[integrations, selectedIntegrationKey],
	)

	const enabledIntegrations = integrations.filter((i) => i.defaultEnable)
	const availableIntegrations = integrations.filter((i) => !i.defaultEnable)

	const handleSelect = (key: string) => {
		setModalOpen(false)
		navigate(`/integrations/${key}`)
	}

	const renderItem = (integration: typeof integrations[0]) => (
		<div
			key={integration.key}
			className={clsx(
				styles.integrationItem,
				selectedIntegrationKey === integration.key &&
					styles.activeIntegrationItem,
			)}
			onClick={() => handleSelect(integration.key)}
		>
			<img
				src={integration.icon}
				alt={integration.name}
				className={clsx(
					styles.integrationIcon,
					integration.noRoundedIcon && styles.noIconBorder,
				)}
			/>
			<Text size="small" color="default">
				{integration.name}
			</Text>
		</div>
	)

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<div className={styles.pageContainer}>
				{/* Middle: integrations list */}
				<div className={styles.listPanel}>
					{enabledIntegrations.length > 0 && (
						<div className={styles.listSection}>
							<div className={styles.listSectionLabel}>
								Enabled Integrations
							</div>
							{enabledIntegrations.map(renderItem)}
						</div>
					)}
					<div className={styles.listSection}>
						<div className={styles.listSectionLabel}>
							Available Integrations
						</div>
						{availableIntegrations.map(renderItem)}
					</div>
				</div>

				{/* Right: detail panel */}
				{selectedIntegration && (
					<div className={styles.detailPanel}>
						{/* Top bar: name label left, Open link right */}
						<div className={styles.detailTopBar}>
							<Text size="xSmall" color="n11">
								{selectedIntegration.name}
							</Text>
							{selectedIntegration.externalLink && (
								<a
									href={selectedIntegration.externalLink}
									target="_blank"
									rel="noreferrer"
									className={styles.openLink}
								>
									<Text size="small" color="default">
										Open {selectedIntegration.name}
									</Text>
									<IconSolidExternalLink size={12} />
								</a>
							)}
						</div>

						{/* Header: logo + name + Disconnect button */}
						<div className={styles.detailHeader}>
							<Stack
								direction="row"
								align="center"
								justify="space-between"
							>
								<Stack direction="row" align="center" gap="12">
									<img
										src={selectedIntegration.icon}
										alt={selectedIntegration.name}
										style={{
											width: 36,
											height: 36,
											borderRadius:
												selectedIntegration.noRoundedIcon
													? 0
													: 8,
											objectFit: 'contain',
										}}
									/>
									<Text
										size="large"
										weight="bold"
										color="default"
									>
										{selectedIntegration.name}
									</Text>
								</Stack>
								{selectedIntegration.defaultEnable && (
									<Button
										trackingId={`IntegrationDisconnect-${selectedIntegration.key}`}
										kind="secondary"
										size="small"
										onClick={() => setModalOpen(true)}
									>
										Disconnect
									</Button>
								)}
							</Stack>
						</div>

						{/* Tabs */}
						<div className={styles.tabs}>
							<button
								className={clsx(
									styles.tab,
									activeTab === 'description' &&
										styles.activeTab,
								)}
								onClick={() => setActiveTab('description')}
							>
								Description
							</button>
							{selectedIntegration.hasSettings && (
								<button
									className={clsx(
										styles.tab,
										activeTab === 'configure' &&
											styles.activeTab,
									)}
									onClick={() => setActiveTab('configure')}
								>
									Configure
								</button>
							)}
						</div>

						{/* Tab content */}
						<div className={styles.tabContent}>
							{activeTab === 'description' ? (
								<div className={styles.descriptionArea}>
									<Text size="small" color="n11">
										{selectedIntegration.description}
									</Text>
								</div>
							) : (
								<div className={styles.configureArea}>
									{selectedIntegration.configurationPage({
										integration: selectedIntegration,
										setModalOpen,
									})}
								</div>
							)}
						</div>

						{/* Modal for connect/disconnect */}
						<IntegrationModal
							title={selectedIntegration.name}
							visible={modalOpen}
							width={selectedIntegration.modalWidth}
							onCancel={() => setModalOpen(false)}
							configurationPage={() =>
								selectedIntegration.configurationPage({
									integration: selectedIntegration,
									setModalOpen,
								})
							}
						/>
					</div>
				)}
			</div>
		</>
	)
}

export default IntegrationsPage