import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithLinearQuery,
	useRemoveIntegrationFromProjectMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { useCallback } from 'react'

const JIRA_SCOPES = ['read:jira-work', 'write:jira-work']
const JIRA_CLIENT_ID = import.meta.env.JIRA_CLIENT_ID

export const useJiraIntegration = () => {
	const { project_id } = useParams<{ project_id: string }>()

	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
		],
	})

	const addJiraIntegrationToProject = useCallback(
		(code: string, projectId?: string) =>
			addIntegrationToProject({
				variables: {
					integration_type: IntegrationType.Jira,
					code: code,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, addIntegrationToProject],
	)

	const [removeIntegrationFromProject] =
		useRemoveIntegrationFromProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
			],
		})

	const removeJiraIntegrationFromProject = useCallback(
		(projectId?: string) =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.Jira,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, removeIntegrationFromProject],
	)

	const { data, loading, error } = useGetWorkspaceIsIntegratedWithLinearQuery(
		{
			variables: { project_id: project_id! },
			skip: !project_id,
		},
	)

	return {
		addJiraIntegrationToProject,
		removeJiraIntegrationFromProject,
		isJiraIntegratedWithProject: data?.is_integrated_with_linear,
		teams: data?.linear_teams,
		loading,
		error,
	}
}

export const getJiraOAuthUrl = (projectId: string) => {
	let redirectPath = window.location.pathname
	if (redirectPath.length > 3) {
		// remove project_id and prepended slash
		redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1)
	}

	const state = { next: redirectPath, project_id: projectId }

	const redirectUri = `${GetBaseURL()}/callback/jira`

	const authUrl =
		`https://auth.atlassian.com/authorize` +
		`?audience=api.atlassian.com` +
		`&client_id=${JIRA_CLIENT_ID}` +
		`&scope=${encodeURIComponent(JIRA_SCOPES.join(' '))}` +
		`&redirect_uri=${encodeURIComponent(redirectUri)}` +
		`&state=${btoa(JSON.stringify(state))}` +
		`&response_type=code` +
		`&prompt=consent`

	return authUrl
}
