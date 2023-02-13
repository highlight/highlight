import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithDiscordQuery,
	useRemoveIntegrationFromProjectMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { useCallback } from 'react'

export const useDiscordIntegration = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { data, loading } = useGetWorkspaceIsIntegratedWithDiscordQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetWorkspaceIsIntegratedWithDiscord,
		],
	})

	const addDiscordIntegrationToProject = useCallback(
		(code: string, projectId?: string) =>
			addIntegrationToProject({
				variables: {
					integration_type: IntegrationType.Discord,
					code: code,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, addIntegrationToProject],
	)

	const [removeIntegrationFromProject] =
		useRemoveIntegrationFromProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetWorkspaceIsIntegratedWithDiscord,
			],
		})

	const removeDiscordIntegrationFromProject = useCallback(
		(projectId?: string) =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.Discord,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, removeIntegrationFromProject],
	)

	return {
		addDiscordIntegrationToProject,
		removeDiscordIntegrationFromProject,
		isDiscordIntegratedWithProject: data?.is_integrated_with_discord,
		loading,
	}
}
