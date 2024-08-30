import * as Apollo from '@apollo/client'
import {
	useAddIntegrationToWorkspaceMutation,
	useRemoveIntegrationFromWorkspaceMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Exact, IntegrationType } from '@graph/schemas'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useCallback } from 'react'

type SettingsLoadingState = {
	loading: true
	isIntegrated: undefined
}

type SettingsLoadedState<SettingsQueryOutput> = {
	loading: false
	isIntegrated: boolean
} & SettingsQueryOutput

type Settings<SettingsQueryOutput> =
	| SettingsLoadingState
	| SettingsLoadedState<SettingsQueryOutput>

export interface IntegrationActions<SettingsQueryOutput, UpdateMutationInput> {
	addIntegration: (code: string) => Promise<unknown>
	updateIntegration: (settings: UpdateMutationInput) => Promise<unknown>
	removeIntegration: () => Promise<unknown>
	settings: Settings<SettingsQueryOutput>
	data?: SettingsQueryOutput
}

export const useIntegration = <SettingsQueryOutput, UpdateMutationInput>(
	integrationType: IntegrationType,
	settingsQuery: keyof typeof namedOperations.Query,
	getSettingsQuery: (
		opts: Apollo.QueryHookOptions<
			SettingsQueryOutput & { is_integrated: boolean },
			{ workspace_id: string }
		>,
	) => Apollo.QueryResult<
		SettingsQueryOutput & { is_integrated: boolean },
		Exact<{ workspace_id: string }>
	>,
	updateSettingsMutation: (
		opts?: Apollo.MutationHookOptions<
			any,
			UpdateMutationInput & { workspace_id: string }
		>,
	) => Apollo.MutationTuple<
		any,
		UpdateMutationInput & { workspace_id: string },
		Apollo.DefaultContext,
		Apollo.ApolloCache<unknown>
	>,
): IntegrationActions<SettingsQueryOutput, UpdateMutationInput> => {
	const { currentWorkspace } = useApplicationContext()
	const workspaceIdStr = currentWorkspace?.id ?? ''

	const { data, loading } = getSettingsQuery({
		variables: { workspace_id: workspaceIdStr },
		skip: !currentWorkspace,
	})

	const [addIntegrationImpl] = useAddIntegrationToWorkspaceMutation({
		refetchQueries: [settingsQuery],
	})

	const addIntegration = useCallback(
		(code: string) =>
			addIntegrationImpl({
				variables: {
					integration_type: integrationType,
					code,
					workspace_id: workspaceIdStr,
				},
			}),
		[addIntegrationImpl, integrationType, workspaceIdStr],
	)

	const [removeIntegrationImpl] = useRemoveIntegrationFromWorkspaceMutation({
		refetchQueries: [settingsQuery],
	})

	const removeIntegration = useCallback(
		() =>
			removeIntegrationImpl({
				variables: {
					integration_type: integrationType,
					workspace_id: workspaceIdStr,
				},
			}),
		[integrationType, removeIntegrationImpl, workspaceIdStr],
	)

	const [updateIntegrationImpl] = updateSettingsMutation({
		refetchQueries: [settingsQuery],
	})

	const updateIntegration = useCallback(
		(u: UpdateMutationInput) =>
			updateIntegrationImpl({
				variables: { ...u, workspace_id: workspaceIdStr },
			}),
		[updateIntegrationImpl, workspaceIdStr],
	)

	const settings: Settings<SettingsQueryOutput> = loading
		? {
				loading: true,
				isIntegrated: undefined,
			}
		: {
				loading: false,
				isIntegrated: data?.is_integrated ?? false,
				...data!,
			}

	return {
		addIntegration,
		removeIntegration,
		updateIntegration,
		settings,
		data,
	}
}
