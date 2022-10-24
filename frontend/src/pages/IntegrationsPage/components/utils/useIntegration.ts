import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithClickUpQuery,
	useRemoveIntegrationFromProjectMutation,
	useUpdateVercelSettingsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useCallback } from 'react'

export function useAddIntegrationToProjectMutation(
	baseOptions?: Apollo.MutationHookOptions<
		Types.AddIntegrationToProjectMutation,
		Types.AddIntegrationToProjectMutationVariables
	>,
) {
	return Apollo.useMutation<
		Types.AddIntegrationToProjectMutation,
		Types.AddIntegrationToProjectMutationVariables
	>(AddIntegrationToProjectDocument, baseOptions)
}

export interface IntegrationHook<SettingsType> {
	addIntegration: (code: string) => void
	removeIntegration: () => void
	updateIntegration: ((settings: SettingsType) => void) | undefined
	isLoading: boolean
	isIntegrated: boolean
	settings: SettingsType
}

export const useIntegration = <SettingsType>(
	projectId: string,
): (() => IntegrationHook<SettingsType>) => {
	const { data, loading } = useGetWorkspaceIsIntegratedWithClickUpQuery({
		variables: { project_id: projectId },
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
					project_id: projectId,
				},
			}),
		[projectId, addIntegrationToProject],
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
					project_id: projectId,
				},
			}),
		[projectId, removeIntegrationFromProject],
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
		settings,
	}
}
