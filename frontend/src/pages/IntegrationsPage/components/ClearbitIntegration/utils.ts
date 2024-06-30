import {
	useGetProjectQuery,
	useGetWorkspaceQuery,
	useModifyClearbitIntegrationMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { mustUpgradeForClearbit } from '@util/billing/billing'
import { useParams } from '@util/react-router/useParams'

export const useClearbitIntegration = () => {
	const { project_id } = useParams<{ project_id: string }>()
	const { loading: loadingProject, data: project } = useGetProjectQuery({
		variables: { id: project_id! },
		skip: !project_id,
	})
	const workspaceID = project?.project?.workspace?.id
	const { loading: loadingWorkspace, data: workspace } = useGetWorkspaceQuery(
		{
			variables: { id: project?.project?.workspace?.id || '' },
			skip: !project?.project?.workspace?.id,
		},
	)
	const loading = loadingProject || loadingWorkspace
	const isEnabled = !!workspace?.workspace?.clearbit_enabled
	const tier = workspace?.workspace?.plan_tier

	const [modifyClearbit] = useModifyClearbitIntegrationMutation({
		refetchQueries: [namedOperations.Query.GetWorkspace],
	})

	return {
		loading: loading,
		isClearbitIntegratedWithWorkspace: isEnabled,
		mustUpgradeToIntegrate: mustUpgradeForClearbit(tier),
		projectID: project_id,
		workspaceID: workspaceID,
		modifyClearbit: ({ enabled }: { enabled: boolean }) => {
			if (workspaceID) {
				modifyClearbit({
					variables: {
						workspace_id: workspaceID,
						enabled: enabled,
					},
				})
			}
		},
	}
}
