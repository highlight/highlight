import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithClickUpQuery,
	useRemoveIntegrationFromProjectMutation,
	useUpdateVercelSettingsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { useCallback } from 'react'

export const useClickUpIntegration = (projectId?: string) => {
	let { project_id } = useParams<{ project_id: string }>()
	if (projectId !== undefined) {
		project_id = projectId
	}

	const { data, loading } = useGetWorkspaceIsIntegratedWithClickUpQuery({
		variables: { project_id: project_id },
		skip: !project_id || project_id === '0',
	})

	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetWorkspaceIsIntegratedWithClickUp,
		],
	})

	const addClickUpIntegrationToProject = useCallback(
		(code: string) =>
			addIntegrationToProject({
				variables: {
					integration_type: IntegrationType.ClickUp,
					code,
					project_id,
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
		() =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.Vercel,
					project_id,
				},
			}),
		[project_id, removeIntegrationFromProject],
	)

	const [updateVercelSettings] = useUpdateVercelSettingsMutation({
		refetchQueries: [
			namedOperations.Query.GetWorkspaceIsIntegratedWithVercel,
		],
	})

	return {
		addClickUpIntegrationToProject,
		removeClickUpIntegrationFromProject,
		updateClickUpSettings,
		isVercelIntegratedWithProject: data?.is_integrated_with_vercel,
		allVercelProjects: data?.vercel_projects,
		vercelProjectMappings: data?.vercel_project_mappings,
		loading,
	}
}
