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
	const mockData: any = {
		is_integrated: true,
		height_workspaces: [
			{ id: '1', name: 'Mock Height Workspace', model: 'Workspace', url: 'https://height.app/mock' },
		],
		integration_project_mappings: [
			{ project_id: '1', external_id: '1' },
		],
		slack_channels: [
			{ id: '1', name: 'general' },
		],
		github_repos: [
			{ repo_id: '1', name: 'mock-repo', key: 'mock-repo' },
		],
		clickup_workspaces: [
			{ id: '1', name: 'Mock ClickUp' },
		],
	}

	const settings: Settings<SettingsQueryOutput> = {
		loading: false,
		isIntegrated: true,
		...mockData,
	}

	return {
		addIntegration: async () => {},
		removeIntegration: async () => {},
		updateIntegration: async () => {},
		settings,
		data: mockData,
	}
}
