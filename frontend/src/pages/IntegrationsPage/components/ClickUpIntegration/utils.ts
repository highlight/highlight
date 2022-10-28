import {
	useGetClickUpIntegrationSettingsQuery,
	useUpdateClickUpSettingsMutation,
} from '@graph/hooks'
import {
	GetClickUpIntegrationSettingsQuery,
	namedOperations,
	UpdateClickUpSettingsMutationVariables,
} from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useIntegration } from '@pages/IntegrationsPage/components/common/useIntegration'

export const useClickUpIntegration = () =>
	useIntegration<
		GetClickUpIntegrationSettingsQuery,
		Omit<UpdateClickUpSettingsMutationVariables, 'workspace_id'>
	>(
		IntegrationType.ClickUp,
		namedOperations.Query.GetClickUpIntegrationSettings,
		useGetClickUpIntegrationSettingsQuery,
		useUpdateClickUpSettingsMutation,
	)
