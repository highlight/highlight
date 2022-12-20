

import {
	GetHeightIntegrationSettingsQuery,
	namedOperations,
} from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useIntegration } from '@pages/IntegrationsPage/components/common/useIntegration'

export const useHeightIntegration = () =>
	useIntegration<
		GetHeightIntegrationSettingsQuery,
		Omit<UpdateHeightSettingsMutationVariables, 'workspace_id'>
	>(
		IntegrationType.Height,
		namedOperations.Query.GetHeightIntegrationSettings,
		useGetHeightIntegrationSettingsQuery,
		useUpdateHeightSettingsMutation,
	)
