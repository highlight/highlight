import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithVercelQuery,
	useRemoveIntegrationFromProjectMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { useCallback } from 'react'

export const useVercelIntegration = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading } = useGetWorkspaceIsIntegratedWithVercelQuery({
		variables: { project_id: project_id },
		skip: !project_id,
	})

	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetWorkspaceIsIntegratedWithVercel,
		],
	})

	const addVercelIntegrationToProject = useCallback(
		(code: string, projectId?: string) =>
			addIntegrationToProject({
				variables: {
					integration_type: IntegrationType.Vercel,
					code: code,
					project_id: projectId || project_id,
				},
			}),
		[project_id, addIntegrationToProject],
	)

	const [removeIntegrationFromProject] =
		useRemoveIntegrationFromProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetWorkspaceIsIntegratedWithVercel,
			],
		})

	const removeVercelIntegrationFromProject = useCallback(
		(projectId?: string) =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.Vercel,
					project_id: projectId || project_id,
				},
			}),
		[project_id, removeIntegrationFromProject],
	)

	return {
		addVercelIntegrationToProject,
		removeVercelIntegrationFromProject,
		isVercelIntegratedWithProject: data?.is_integrated_with_vercel,
		vercelProjects: data?.vercel_projects,
		loading,
	}
}
