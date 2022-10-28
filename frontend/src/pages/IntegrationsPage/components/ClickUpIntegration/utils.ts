import {
	useGetClickUpIntegrationSettingsQuery,
	useUpdateClickUpSettingsMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useIntegration } from '@pages/IntegrationsPage/components/common/useIntegration'

export const useClickUpIntegration = (workspaceId: string | undefined) =>
	useIntegration(
		workspaceId,
		IntegrationType.ClickUp,
		namedOperations.Query.GetClickUpIntegrationSettings,
		useGetClickUpIntegrationSettingsQuery,
		useUpdateClickUpSettingsMutation,
	)
