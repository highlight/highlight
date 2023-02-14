import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithFrontQuery,
	useRemoveIntegrationFromProjectMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { useCallback } from 'react'

export const useFrontIntegration = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading } = useGetWorkspaceIsIntegratedWithFrontQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetWorkspaceIsIntegratedWithFront,
		],
	})

	const addFrontIntegrationToProject = useCallback(
		(code: string, projectId?: string) =>
			addIntegrationToProject({
				variables: {
					integration_type: IntegrationType.Front,
					code: code,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, addIntegrationToProject],
	)

	const [removeIntegrationFromProject] =
		useRemoveIntegrationFromProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetWorkspaceIsIntegratedWithFront,
			],
		})

	const removeFrontIntegrationFromProject = useCallback(
		(projectId?: string) =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.Front,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, removeIntegrationFromProject],
	)

	return {
		addFrontIntegrationToProject,
		removeFrontIntegrationFromProject,
		isFrontIntegratedWithProject: data?.is_integrated_with_front,
		loading,
	}
}
