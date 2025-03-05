import {
	GetGitlabIntegrationSettingsQuery,
	namedOperations,
	UpdateIntegrationProjectSettingsMutationVariables,
} from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import {
	useGetGitlabIntegrationSettingsQuery,
	useUpdateIntegrationProjectSettingsMutation,
} from '@/graph/generated/hooks'
import { useIntegration } from '@/pages/IntegrationsPage/components/common/useIntegration'
import { GetBaseURL } from '@/util/window'
import { btoaSafe } from '@/util/string'

const GITLAB_SCOPES = ['api', 'read_api']
const GITLAB_CLIENT_ID = import.meta.env.GITLAB_CLIENT_ID

export const useGitlabIntegration = () =>
	useIntegration<
		GetGitlabIntegrationSettingsQuery,
		Omit<UpdateIntegrationProjectSettingsMutationVariables, 'workspace_id'>
	>(
		IntegrationType.GitLab,
		namedOperations.Query.GetGitlabIntegrationSettings,
		useGetGitlabIntegrationSettingsQuery,
		useUpdateIntegrationProjectSettingsMutation,
	)

export const getGitlabOAuthUrl = (projectId: string, workspaceId: string) => {
	let redirectPath = window.location.pathname
	if (redirectPath.length > 3) {
		redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1)
	}

	const state = {
		next: redirectPath,
		project_id: projectId,
		workspace_id: workspaceId,
	}

	const redirectUri = `${GetBaseURL()}/callback/gitlab`

	const authUrl =
		`https://gitlab.com/oauth/authorize?` +
		`client_id=${GITLAB_CLIENT_ID}` +
		`&scope=${GITLAB_SCOPES.join('+')}` +
		`&redirect_uri=${encodeURIComponent(redirectUri)}` +
		`&state=${btoaSafe(JSON.stringify(state))}` +
		`&response_type=code`

	return authUrl
}
