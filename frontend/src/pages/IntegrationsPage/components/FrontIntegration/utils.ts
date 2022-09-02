import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithFrontQuery,
	useRemoveIntegrationFromProjectMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { useCallback, useEffect } from 'react'

const REPOLL_INTERVAL = 2000

export const useFrontIntegration = (props?: { repoll?: boolean }) => {
	const { repoll } = props || {}
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading, stopPolling, startPolling } =
		useGetWorkspaceIsIntegratedWithFrontQuery({
			variables: { project_id: project_id },
		})

	useEffect(() => {
		if (repoll) {
			startPolling(REPOLL_INTERVAL)
		} else {
			stopPolling()
		}
	}, [repoll, startPolling, stopPolling])

	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
		],
	})

	const addFrontIntegrationToProject = useCallback(
		(code: string, projectId?: string) =>
			addIntegrationToProject({
				variables: {
					integration_type: IntegrationType.Linear,
					code: code,
					project_id: projectId || project_id,
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

	const removeFrontIntegrationFromProject = useCallback(
		(projectId?: string) =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.Front,
					project_id: projectId || project_id,
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
