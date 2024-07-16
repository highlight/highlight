import { toast } from '@components/Toaster'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useCallback, useEffect, useState } from 'react'

import {
	useAddIntegrationToProjectMutation,
	useCreateCloudflareProxyMutation,
	useGetWorkspaceIsIntegratedWithCloudflareQuery,
	useRemoveIntegrationFromProjectMutation,
} from '@/graph/generated/hooks'

export const useCloudflareIntegration = () => {
	const { currentWorkspace } = useApplicationContext()
	const workspaceIdStr = currentWorkspace?.id ?? ''
	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetWorkspaceIsIntegratedWithCloudflare,
		],
	})
	const [createCloudflareProxy] = useCreateCloudflareProxyMutation({
		refetchQueries: [namedOperations.Query.GetDropdownOptions],
	})
	const addCloudflareIntegrationToProject = useCallback(
		(code: string) =>
			addIntegrationToProject({
				variables: {
					project_id: workspaceIdStr!,
					code,
					integration_type: IntegrationType.Cloudflare,
				},
			}),
		[addIntegrationToProject, workspaceIdStr],
	)
	const createCloudflareProxyInWorkspace = useCallback(
		(proxySubdomain: string) =>
			createCloudflareProxy({
				variables: {
					workspace_id: workspaceIdStr,
					proxy_subdomain: proxySubdomain,
				},
			}),
		[createCloudflareProxy, workspaceIdStr],
	)
	const [removeIntegrationFromProject] =
		useRemoveIntegrationFromProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
			],
		})

	const removeCloudflareIntegrationFromProject = useCallback(
		() =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.Cloudflare,
					project_id: workspaceIdStr!,
				},
			}),
		[removeIntegrationFromProject, workspaceIdStr],
	)

	const [loading, setLoading] = useState<boolean>(false)
	const [isCloudflareConnectedToProject, setIsCloudflareConnectedToProject] =
		useState<boolean>(false)

	const {
		data: CloudflareIntegResponse,
		loading: CloudflareIntegLoading,
		refetch,
	} = useGetWorkspaceIsIntegratedWithCloudflareQuery({
		variables: { workspace_id: workspaceIdStr! },
		skip: !workspaceIdStr,
	})

	useEffect(() => {
		if (!CloudflareIntegResponse) return
		setIsCloudflareConnectedToProject(
			CloudflareIntegResponse.is_integrated_with_cloudflare || false,
		)
	}, [CloudflareIntegResponse, setIsCloudflareConnectedToProject])

	const addCloudflareToProject = useCallback(
		async (token: string, proxySubdomain: string) => {
			setLoading(true)
			await addCloudflareIntegrationToProject(token)
			await createCloudflareProxyInWorkspace(proxySubdomain)
			setIsCloudflareConnectedToProject(true)
			toast.success('Highlight is now synced with Cloudflare!', {
				duration: 5000,
			})
			setLoading(false)
		},
		[addCloudflareIntegrationToProject, createCloudflareProxyInWorkspace],
	)

	return {
		loading: loading || CloudflareIntegLoading,
		isCloudflareConnectedToWorkspace: isCloudflareConnectedToProject,
		refetch,
		addCloudflareToProject,
		removeCloudflareIntegrationFromProject,
	}
}
