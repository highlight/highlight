import { useAuthContext } from '@authentication/AuthContext'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { Box, Heading, Stack, Tabs, Text } from '@highlight-run/ui/components'
import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils'
import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
import { useCloudflareIntegration } from '@pages/IntegrationsPage/components/CloudflareIntegration/utils'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
import { useHerokuIntegration } from '@pages/IntegrationsPage/components/HerokuIntegration/utils'
import Integration, { IntegrationAction } from '@pages/IntegrationsPage/components/Integration'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils'
import INTEGRATIONS, { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import clsx from 'clsx'
import React, { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet'
import { StringParam, useQueryParam } from 'use-query-params'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'

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

	const [selectedKey, setSelectedKey] = useState<string | null>(
		configureIntegration || popUpModal || (integrations.length > 0 ? integrations[0].key : null)
	)

	const selectedIntegration = useMemo(() => {
		return integrations.find((i) => i.key === selectedKey)
	}, [integrations, selectedKey])

	useEffect(() => {
		if (configureIntegration) {
			setSelectedKey(configureIntegration)
		} else if (popUpModal) {
			setSelectedKey(popUpModal)
		}
	}, [configureIntegration, popUpModal])

	useEffect(() => analytics.page('Integrations'), [])

	const issueTrackers = integrations.filter((i) =>
		['linear', 'jira', 'github', 'gitlab', 'clickup', 'height'].includes(i.key)
	)
	const communication = integrations.filter((i) =>
		['slack', 'microsoft_teams', 'discord'].includes(i.key)
	)
	const others = integrations.filter(
		(i) =>
			!['linear', 'jira', 'github', 'gitlab', 'clickup', 'height', 'slack', 'microsoft_teams', 'discord'].includes(
				i.key
			)
	)

	const renderSidebarItem = (i: IntegrationType & { defaultEnable?: boolean }) => (
		<div
			key={i.key}
			className={clsx(styles.integrationItem, {
				[styles.activeIntegrationItem]: selectedKey === i.key,
			})}
			onClick={() => setSelectedKey(i.key)}
		>
			<img src={i.icon} alt="" className={styles.integrationIcon} />
			<Text size="small" weight={selectedKey === i.key ? 'bold' : 'medium'} color={selectedKey === i.key ? 'primary' : 'secondary'}>
				{i.name}
			</Text>
			{i.defaultEnable && <div className={styles.connectedBadge} />}
		</div>
	)

	return (
		<>
			<Helmet>
				<title>Integrations</title>
			</Helmet>
			<div className={styles.pageContainer}>
				<div className={styles.sidebar}>
					<div className={styles.sidebarHeader}>
						<Heading level="h4">Integrations</Heading>
					</div>
					<div className={styles.sidebarContent}>
						<div className={styles.sidebarSection}>
							<div className={styles.sidebarSectionTitle}>Issue Trackers</div>
							{issueTrackers.map(renderSidebarItem)}
						</div>
						<div className={styles.sidebarSection}>
							<div className={styles.sidebarSectionTitle}>Communication</div>
							{communication.map(renderSidebarItem)}
						</div>
						<div className={styles.sidebarSection}>
							<div className={styles.sidebarSectionTitle}>Tools</div>
							{others.map(renderSidebarItem)}
						</div>
					</div>
				</div>

				<div className={styles.detailPanel}>
					{selectedIntegration ? (
						<Integration
							integration={selectedIntegration}
							key={selectedIntegration.key}
							showModalDefault={popUpModal === selectedIntegration.key}
							showSettingsDefault={configureIntegration === selectedIntegration.key}
							loading={loading}
							isDetailView
						/>
					) : (
						<div className={styles.emptyState}>
							<Text color="secondary">Select an integration to see details</Text>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default IntegrationsPage
