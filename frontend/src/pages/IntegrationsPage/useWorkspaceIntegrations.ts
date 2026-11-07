import { useAuthContext } from '@authentication/AuthContext'
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
import INTEGRATIONS, {
	Integration,
} from '@pages/IntegrationsPage/Integrations'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useMemo } from 'react'

import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'

interface VisibilityContext {
	workspaceId?: string
	isHighlightAdmin: boolean
}

/**
 * Determines whether a workspace integration should be visible to the current user
 * based on workspace allowlists and Highlight admin restrictions.
 */
export const isIntegrationVisibleForWorkspace = (
	integration: Integration,
	ctx: VisibilityContext,
): boolean => {
	const hasAllowlist = Boolean(integration.allowlistWorkspaceIds)
	const requiresAdmin = Boolean(integration.onlyShowForHighlightAdmin)
	if (!hasAllowlist && !requiresAdmin) {
		return true
	}

	const matchesAllowlist = Boolean(
		ctx.workspaceId &&
			integration.allowlistWorkspaceIds?.includes(ctx.workspaceId),
	)
	const matchesAdmin = Boolean(requiresAdmin && ctx.isHighlightAdmin)
	return matchesAllowlist || matchesAdmin
}

const useIssueTrackerConnectionStates = () => {
	const { settings: jiraSettings } = useJiraIntegration()
	const { settings: gitlabSettings } = useGitlabIntegration()
	const { settings: githubSettings } = useGitHubIntegration()
	const { settings: clickUpSettings } = useClickUpIntegration()
	const { settings: heightSettings } = useHeightIntegration()

	const loadingFlags = [
		jiraSettings.loading,
		gitlabSettings.loading,
		githubSettings.loading,
		clickUpSettings.loading,
		heightSettings.loading,
	]

	return {
		loading: loadingFlags.some(Boolean),
		enabledMap: {
			jira: Boolean(jiraSettings.isIntegrated),
			gitlab: Boolean(gitlabSettings.isIntegrated),
			github: Boolean(githubSettings.isIntegrated),
			clickup: Boolean(clickUpSettings.isIntegrated),
			height: Boolean(heightSettings.isIntegrated),
		} as Record<string, boolean>,
	}
}

const useDirectConnectionStates = () => {
	const slack = useSlackBot()
	const linear = useLinearIntegration()
	const zapier = useZapierIntegration()
	const clearbit = useClearbitIntegration()
	const vercel = useVercelIntegration()
	const discord = useDiscordIntegration()
	const heroku = useHerokuIntegration()
	const cloudflare = useCloudflareIntegration()
	const microsoftTeams = useMicrosoftTeamsBot()

	const loadingFlags = [
		slack.loading,
		linear.loading,
		zapier.loading,
		clearbit.loading,
		vercel.loading,
		discord.loading,
		heroku.loading,
		cloudflare.loading,
		microsoftTeams.loading,
	]

	return {
		loading: loadingFlags.some(Boolean),
		enabledMap: {
			slack: Boolean(slack.isSlackConnectedToWorkspace),
			linear: Boolean(linear.isLinearIntegratedWithProject),
			zapier: Boolean(zapier.isZapierIntegratedWithProject),
			clearbit: Boolean(clearbit.isClearbitIntegratedWithWorkspace),
			vercel: Boolean(vercel.isVercelIntegratedWithProject),
			discord: Boolean(discord.isDiscordIntegratedWithProject),
			heroku: Boolean(heroku.isHerokuConnectedToWorkspace),
			cloudflare: Boolean(cloudflare.isCloudflareConnectedToWorkspace),
			microsoft_teams: Boolean(
				microsoftTeams.isMicrosoftTeamsConnectedToWorkspace,
			),
		} as Record<string, boolean>,
	}
}

export interface WorkspaceIntegrationsResult {
	integrations: Integration[]
	enabledIntegrations: Integration[]
	availableIntegrations: Integration[]
	loading: boolean
}

/**
 * Aggregates connection statuses across all workspace and project integrations
 * and partitions them into Enabled and Available lists for the sidebar.
 */
export const useWorkspaceIntegrations = (): WorkspaceIntegrationsResult => {
	const { isHighlightAdmin } = useAuthContext()
	const { currentWorkspace } = useApplicationContext()
	const directStates = useDirectConnectionStates()
	const issueTrackerStates = useIssueTrackerConnectionStates()

	const loading = directStates.loading || issueTrackerStates.loading

	const integrations = useMemo(() => {
		const enabledLookup: Record<string, boolean> = {
			...directStates.enabledMap,
			...issueTrackerStates.enabledMap,
		}
		const visibilityCtx: VisibilityContext = {
			workspaceId: currentWorkspace?.id,
			isHighlightAdmin: Boolean(isHighlightAdmin),
		}

		return INTEGRATIONS.filter((item) =>
			isIntegrationVisibleForWorkspace(item, visibilityCtx),
		).map((item) => ({
			...item,
			defaultEnable: Boolean(enabledLookup[item.key]),
		}))
	}, [
		currentWorkspace?.id,
		directStates.enabledMap,
		 isHighlightAdmin,
		issueTrackerStates.enabledMap,
	])

	const enabledIntegrations = useMemo(
		() => integrations.filter((item) => item.defaultEnable),
		[integrations],
	)
	const availableIntegrations = useMemo(
		() => integrations.filter((item) => !item.defaultEnable),
		[integrations],
	)

	return {
		integrations,
		enabledIntegrations,
		availableIntegrations,
		loading,
	}
}
