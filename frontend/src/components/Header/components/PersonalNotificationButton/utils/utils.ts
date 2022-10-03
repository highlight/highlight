import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { message } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithSlackQuery,
	useOpenSlackConversationMutation,
	useRemoveIntegrationFromProjectMutation,
} from '../../../../../graph/generated/hooks'

const SLACK_CLIENT_ID = import.meta.env.SLACK_CLIENT_ID

export interface UseSlackBotProps {
	type: 'Organization' | 'Personal'
}

const PersonalSlackScopes =
	'channels:manage,groups:write,im:write,mpim:write,chat:write'
const OrganizationSlackScopes =
	'channels:join,channels:manage,channels:read,chat:write,groups:read,groups:write,im:read,im:write,mpim:read,mpim:write,users:read,files:write,links:read,links:write,team:read'

export const useSlackBot = ({ type }: UseSlackBotProps) => {
	const [setupType] = useLocalStorage<'' | 'Personal' | 'Organization'>(
		'Highlight-slackBotSetupType',
		'',
	)
	const { project_id } = useParams<{ project_id: string }>()
	const [openSlackConversation] = useOpenSlackConversationMutation({
		refetchQueries: [namedOperations.Query.GetProject],
	})
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
					project_id: projectId || project_id,
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
					project_id: projectId || project_id,
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
		variables: { project_id },
		skip: !project_id,
	})

	useEffect(() => {
		if (!slackIntegResponse) return
		setIsSlackConnectedToWorkspace(
			slackIntegResponse.is_integrated_with_slack || false,
		)
	}, [slackIntegResponse, setIsSlackConnectedToWorkspace])

	const slackUrl = getSlackUrl(type, project_id)

	const addSlackToWorkspace = useCallback(
		async (code: string, projectId?: string) => {
			setLoading(true)
			if (setupType === 'Personal') {
				await openSlackConversation({
					variables: {
						project_id: projectId || project_id,
						code,
						redirect_path: '',
					},
				})
				message.success(
					'Personal Slack notifications have been setup!',
					5,
				)
			} else {
				await addSlackBotIntegrationToProject(
					code,
					projectId || project_id,
				)
				setIsSlackConnectedToWorkspace(true)
				message.success('Highlight is now synced with Slack!', 5)
			}
			setLoading(false)
		},
		[
			setLoading,
			setupType,
			project_id,
			openSlackConversation,
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

export const getSlackUrl = (
	type: 'Personal' | 'Organization',
	projectId: string,
) => {
	let redirectPath = window.location.pathname
	if (redirectPath.length > 3) {
		// remove project_id and prepended slash
		redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1)
	}

	const state = { next: redirectPath, project_id: projectId }

	const slackScopes =
		type === 'Personal' ? PersonalSlackScopes : OrganizationSlackScopes
	const redirectUri = `${GetBaseURL()}/callback/slack`

	const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=${encodeURIComponent(
		slackScopes,
	)}&state=${btoa(JSON.stringify(state))}&redirect_uri=${encodeURIComponent(
		redirectUri,
	)}`

	return slackUrl
}
