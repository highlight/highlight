import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithVercelQuery,
	useRemoveIntegrationFromProjectMutation,
	useUpdateVercelSettingsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { useCallback } from 'react'

import { DEMO_PROJECT_ID } from '@/components/DemoWorkspaceButton/DemoWorkspaceButton'

export const useVercelIntegration = (projectId?: string) => {
	let { project_id } = useParams<{ project_id: string }>()
	if (projectId !== undefined) {
		project_id = projectId
	}

	const { data, loading } = useGetWorkspaceIsIntegratedWithVercelQuery({
		variables: { project_id: project_id! },
		skip: !project_id || project_id === DEMO_PROJECT_ID,
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
					project_id: projectId || project_id!,
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
					project_id: projectId || project_id!,
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
		addVercelIntegrationToProject,
		removeVercelIntegrationFromProject,
		updateVercelSettings,
		isVercelIntegratedWithProject: data?.is_integrated_with_vercel,
		allVercelProjects: data?.vercel_projects,
		vercelProjectMappings: data?.vercel_project_mappings,
		loading,
	}
}
