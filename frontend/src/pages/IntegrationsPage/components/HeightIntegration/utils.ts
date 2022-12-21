

import { useGetHeightIntegrationSettingsQuery, useUpdateIntegrationProjectSettingsMutation } from '@graph/hooks'
import {
	GetHeightIntegrationSettingsQuery,
	namedOperations,
	UpdateIntegrationProjectSettingsMutationVariables,
} from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useIntegration } from '@pages/IntegrationsPage/components/common/useIntegration'

export const useHeightIntegration = () =>
	useIntegration<
		GetHeightIntegrationSettingsQuery,
		Omit<UpdateIntegrationProjectSettingsMutationVariables, 'workspace_id'>
	>(
		IntegrationType.Height,
		namedOperations.Query.GetHeightIntegrationSettings,
		useGetHeightIntegrationSettingsQuery,
		useUpdateIntegrationProjectSettingsMutation,
	)
