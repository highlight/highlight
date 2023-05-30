import { useGetProjectIntegratedWithQuery } from '@graph/hooks'
import { IntegrationType } from '@graph/schemas'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'

const useIsProjectIntegratedWith = (integrationType: IntegrationType) => {
	const { currentProject } = useApplicationContext()
	const projectIdStr = currentProject?.id ?? ''

	const { data, loading } = useGetProjectIntegratedWithQuery({
		variables: {
			project_id: projectIdStr,
			integration_type: integrationType,
		},
		skip: !currentProject,
	})

	if (loading) {
		return {
			loading: true,
			isIntegrated: undefined,
		}
	} else {
		return {
			loading: false,
			isIntegrated: data?.is_project_integrated_with ?? false,
		}
	}
}

export { useIsProjectIntegratedWith }
