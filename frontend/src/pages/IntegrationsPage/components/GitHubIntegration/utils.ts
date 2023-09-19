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
import useLocalStorage from '@rehooks/local-storage'

export const GitHubRepoSelectionKey = 'highlight-github-default-repo'

export const useGitHubIntegration = () => {
	const [, , removeGitHubRepoId] = useLocalStorage(GitHubRepoSelectionKey, '')
	const hook = useIntegration<
		GetGitHubIntegrationSettingsQuery,
		Omit<UpdateIntegrationProjectSettingsMutationVariables, 'workspace_id'>
	>(
		IntegrationType.GitHub,
		namedOperations.Query.GetGitHubIntegrationSettings,
		useGetGitHubIntegrationSettingsQuery,
		useUpdateIntegrationProjectSettingsMutation,
	)
	return {
		...hook,
		removeIntegration: () => {
			// clear selected repo on integration uninstall
			removeGitHubRepoId()
			return hook.removeIntegration()
		},
	}
}

export const getGitHubInstallationOAuthUrl = (
	projectId: string,
	workspaceId: string,
) => {
	const state = {
		next: window.location.pathname,
		project_id: projectId,
		workspace_id: workspaceId,
	}

	return (
		`https://github.com/apps/highlight-io/installations/new` +
		`?state=${btoa(JSON.stringify(state))}&`
	)
}
