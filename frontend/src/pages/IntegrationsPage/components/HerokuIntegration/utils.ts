import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithHerokuQuery,
	useRemoveIntegrationFromProjectMutation,
} from '@/graph/generated/hooks'

export const useHerokuIntegration = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetAlertsPagePayload,
			namedOperations.Query.GetWorkspaceIsIntegratedWithHeroku,
		],
	})
	const addHerokuIntegrationToProject = useCallback(
		(code: string, projectId?: string) =>
			addIntegrationToProject({
				variables: {
					project_id: projectId || project_id!,
					code,
					integration_type: IntegrationType.Heroku,
				},
			}),
		[addIntegrationToProject, project_id],
	)
	const [removeIntegrationFromProject] =
		useRemoveIntegrationFromProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
			],
		})

	const removeHerokuIntegrationFromProject = useCallback(
		(projectId?: string) =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.Heroku,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, removeIntegrationFromProject],
	)

	const [loading, setLoading] = useState<boolean>(false)
	const [isHerokuConnectedToProject, setIsHerokuConnectedToProject] =
		useState<boolean>(false)

	const {
		data: HerokuIntegResponse,
		loading: HerokuIntegLoading,
		refetch,
	} = useGetWorkspaceIsIntegratedWithHerokuQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	useEffect(() => {
		if (!HerokuIntegResponse) return
		setIsHerokuConnectedToProject(
			HerokuIntegResponse.is_integrated_with_heroku || false,
		)
	}, [HerokuIntegResponse, setIsHerokuConnectedToProject])

	const addHerokuToProject = useCallback(
		async (token: string, projectId?: string) => {
			setLoading(true)
			await addHerokuIntegrationToProject(token, projectId)
			setIsHerokuConnectedToProject(true)
			message.success('Highlight is now synced with Heroku!', 5)
			setLoading(false)
		},
		[
			setLoading,
			addHerokuIntegrationToProject,
			setIsHerokuConnectedToProject,
		],
	)

	return {
		loading: loading || HerokuIntegLoading,
		isHerokuConnectedToWorkspace: isHerokuConnectedToProject,
		refetch,
		addHerokuToProject,
		removeHerokuIntegrationFromProject,
	}
}
