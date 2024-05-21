import { toast } from '@components/Toaster'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { useCallback, useEffect, useState } from 'react'

import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithSlackQuery,
	useRemoveIntegrationFromProjectMutation,
} from '../../../../../graph/generated/hooks'

const SLACK_CLIENT_ID = import.meta.env.SLACK_CLIENT_ID

export const useSlackBot = (next?: string) => {
	const { project_id } = useParams<{ project_id: string }>()
	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetAlertsPagePayload,
			namedOperations.Query.GetWorkspaceIsIntegratedWithSlack,
		],
	})
	const addSlackBotIntegrationToProject = useCallback(
		(code: string, projectId?: string) =>
			addIntegrationToProject({
				variables: {
					project_id: projectId || project_id!,
					code,
					integration_type: IntegrationType.Slack,
				},
			}),
		[addIntegrationToProject, project_id],
	)
	const [removeIntegrationFromProject] =
		useRemoveIntegrationFromProjectMutation({
			refetchQueries: [
				namedOperations.Query.GetWorkspaceIsIntegratedWithLinear,
			],
		})

	const removeSlackIntegrationFromProject = useCallback(
		(projectId?: string) =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.Slack,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, removeIntegrationFromProject],
	)

	const [loading, setLoading] = useState<boolean>(false)
	const [isSlackConnectedToWorkspace, setIsSlackConnectedToWorkspace] =
		useState<boolean>(false)

	const {
		data: slackIntegResponse,
		loading: slackIntegLoading,
		refetch,
	} = useGetWorkspaceIsIntegratedWithSlackQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	useEffect(() => {
		if (!slackIntegResponse) return
		setIsSlackConnectedToWorkspace(
			slackIntegResponse.is_integrated_with_slack || false,
		)
	}, [slackIntegResponse, setIsSlackConnectedToWorkspace])

	const slackUrl = getSlackUrl(project_id!, next)

	const addSlackToWorkspace = useCallback(
		async (code: string, projectId?: string) => {
			setLoading(true)
			await addSlackBotIntegrationToProject(code, projectId)
			setIsSlackConnectedToWorkspace(true)
			toast.success('Highlight is now synced with Slack!', {
				duration: 5000,
			})
			setLoading(false)
		},
		[
			setLoading,
			addSlackBotIntegrationToProject,
			setIsSlackConnectedToWorkspace,
		],
	)

	return {
		loading: loading || slackIntegLoading,
		slackUrl,
		isSlackConnectedToWorkspace,
		refetch,
		addSlackToWorkspace,
		removeSlackIntegrationFromProject,
	}
}

export const getSlackUrl = (projectId: string, next?: string) => {
	let redirectPath = window.location.pathname
	if (redirectPath.length > 3) {
		// remove project_id and prepended slash
		redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1)
	}

	const state = { next: next ?? redirectPath, project_id: projectId }

	const slackScopes =
		'channels:join,channels:manage,channels:read,chat:write,groups:read,groups:write,im:read,im:write,mpim:read,mpim:write,users:read,files:write,links:read,links:write,team:read'
	const redirectUri = `${GetBaseURL()}/callback/slack`

	const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${encodeURIComponent(
		slackScopes,
	)}&state=${btoa(JSON.stringify(state))}&redirect_uri=${encodeURIComponent(
		redirectUri,
	)}`

	return slackUrl
}
