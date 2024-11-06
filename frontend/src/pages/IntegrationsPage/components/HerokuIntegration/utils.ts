import { toast } from '@components/Toaster'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
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
		async (tokens: string[], projectId?: string) => {
			setLoading(true)
			await Promise.all(
				tokens.map((token) =>
					addHerokuIntegrationToProject(token, projectId),
				),
			)
			setIsHerokuConnectedToProject(true)
			toast.success('Highlight is now synced with Heroku!', {
				duration: 5000,
			})
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
