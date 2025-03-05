import {
	GetJiraIntegrationSettingsQuery,
	namedOperations,
	UpdateIntegrationProjectSettingsMutationVariables,
} from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import {
	useGetJiraIntegrationSettingsQuery,
	useUpdateIntegrationProjectSettingsMutation,
} from '@/graph/generated/hooks'
import { useIntegration } from '@/pages/IntegrationsPage/components/common/useIntegration'
import { GetBaseURL } from '@/util/window'
import { btoaSafe } from '@/util/string'

const JIRA_SCOPES = ['read:jira-work', 'write:jira-work', 'offline_access']
const JIRA_CLIENT_ID = import.meta.env.JIRA_CLIENT_ID

export const useJiraIntegration = () =>
	useIntegration<
		GetJiraIntegrationSettingsQuery,
		Omit<UpdateIntegrationProjectSettingsMutationVariables, 'workspace_id'>
	>(
		IntegrationType.Jira,
		namedOperations.Query.GetJiraIntegrationSettings,
		useGetJiraIntegrationSettingsQuery,
		useUpdateIntegrationProjectSettingsMutation,
	)

export const getJiraOAuthUrl = (projectId: string, workspaceId: string) => {
	let redirectPath = window.location.pathname
	if (redirectPath.length > 3) {
		redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1)
	}

	const state = {
		next: redirectPath,
		project_id: projectId,
		workspace_id: workspaceId,
	}

	const redirectUri = `${GetBaseURL()}/callback/jira`

	const authUrl =
		`https://auth.atlassian.com/authorize` +
		`?audience=api.atlassian.com` +
		`&client_id=${JIRA_CLIENT_ID}` +
		`&scope=${encodeURIComponent(JIRA_SCOPES.join(' '))}` +
		`&redirect_uri=${encodeURIComponent(redirectUri)}` +
		`&state=${btoaSafe(JSON.stringify(state))}` +
		`&response_type=code` +
		`&prompt=consent`

	return authUrl
}
