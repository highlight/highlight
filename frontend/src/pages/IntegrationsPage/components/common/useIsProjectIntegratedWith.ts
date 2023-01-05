import { useGetProjectIntegratedWithQuery } from '@graph/hooks'
import { IntegrationType } from '@graph/schemas'

const useIsProjectIntegratedWith = (projectId: string, integrationType: IntegrationType) => {
    const { data, loading }  = useGetProjectIntegratedWithQuery({
		variables: {
			project_id: projectId,
			integration_type: integrationType
		},
	})

    if (loading) {
        return {
            loading: true,
            isIntegrated: undefined
        }
    } else {
        return {
            loading: false,
            isIntegrated: data?.is_project_integrated_with ?? false
        }

    }
}

export { useIsProjectIntegratedWith }