import {
	useGetGitHubIntegrationSettingsQuery,
	useUpdateIntegrationProjectSettingsMutation,
} from '@graph/hooks'
import {
	GetGitHubIntegrationSettingsQuery,
	namedOperations,
	UpdateIntegrationProjectSettingsMutationVariables,
} from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useIntegration } from '@pages/IntegrationsPage/components/common/useIntegration'
import { GetBaseURL } from '@util/window'

const GITHUB_SCOPES = ['repo']
const GITHUB_CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID

export const useGitHubIntegration = () =>
	useIntegration<
		GetGitHubIntegrationSettingsQuery,
		Omit<UpdateIntegrationProjectSettingsMutationVariables, 'workspace_id'>
	>(
		IntegrationType.GitHub,
		namedOperations.Query.GetGitHubIntegrationSettings,
		useGetGitHubIntegrationSettingsQuery,
		useUpdateIntegrationProjectSettingsMutation,
	)

export const getGitHubOAuthUrl = (projectId: string, workspaceId: string) => {
	let redirectPath = window.location.pathname
	if (redirectPath.length > 3) {
		// remove project_id and prepended slash
		redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1)
	}

	const state = {
		next: redirectPath,
		project_id: projectId,
		workspace_id: workspaceId,
	}

	const redirectUri = `${GetBaseURL()}/callback/github`

	return (
		`https://github.com/login/oauth/authorize` +
		`?client_id=${GITHUB_CLIENT_ID}&` +
		`redirect_uri=${encodeURIComponent(redirectUri)}&` +
		`scope=${encodeURIComponent(GITHUB_SCOPES.join(','))}&` +
		`state=${btoa(JSON.stringify(state))}&`
	)
}

export const getGitHubInstallationOAuthUrl = (
	projectId: string,
	workspaceId: string,
) => {
	let redirectPath = window.location.pathname
	if (redirectPath.length > 3) {
		// remove project_id and prepended slash
		redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1)
	}

	const state = {
		next: redirectPath,
		project_id: projectId,
		workspace_id: workspaceId,
	}

	return (
		`https://github.com/apps/highlight-io/installations/new` +
		`?state=${btoa(JSON.stringify(state))}&`
	)
}
