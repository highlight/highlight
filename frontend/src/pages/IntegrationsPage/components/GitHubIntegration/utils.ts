import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithGitHubQuery,
	useRemoveIntegrationFromProjectMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { useCallback } from 'react'

const GITHUB_SCOPES = ['read', 'issues:create', 'comments:create']
const GITHUB_CLIENT_ID = import.meta.env.GITHUB_CLIENT_ID

export const useGitHubIntegration = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading } = useGetWorkspaceIsIntegratedWithGitHubQuery({
		variables: { project_id: project_id! },
	})

	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetWorkspaceIsIntegratedWithGitHub,
		],
	})

	const [removeIntegrationFromProject] =
		useRemoveIntegrationFromProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetWorkspaceIsIntegratedWithGitHub,
			],
		})

	const removeGitHubIntegrationFromProject = useCallback(
		(projectId?: string) =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.GitHub,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, removeIntegrationFromProject],
	)

	return {
		loading: loading,
		removeGitHubIntegrationFromProject,
		addIntegrationToProject,
		isGitHubIntegratedWithProject: data?.is_integrated_with_github,
	}
}

export const getGitHubOAuthUrl = (projectId: string) => {
	let redirectPath = window.location.pathname
	if (redirectPath.length > 3) {
		// remove project_id and prepended slash
		redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1)
	}

	const state = { next: redirectPath, project_id: projectId }

	const redirectUri = `${GetBaseURL()}/callback/github`

	return (
		`https://linear.app/oauth/authorize` +
		`?client_id=${GITHUB_CLIENT_ID}&prompt=consent&response_type=code&scope=${encodeURIComponent(
			GITHUB_SCOPES.join(','),
		)}&state=${btoa(
			JSON.stringify(state),
		)}&redirect_uri=${encodeURIComponent(redirectUri)}`
	)
}
