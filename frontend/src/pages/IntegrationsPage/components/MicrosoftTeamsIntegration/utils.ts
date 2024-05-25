import { toast } from '@components/Toaster'
import { namedOperations } from '@graph/operations'
import { IntegrationType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { useCallback, useEffect, useState } from 'react'

import {
	useAddIntegrationToProjectMutation,
	useGetWorkspaceIsIntegratedWithMicrosoftTeamsQuery,
	useRemoveIntegrationFromProjectMutation,
} from '@/graph/generated/hooks'

const MICROSOFT_TEAMS_BOT_ID = import.meta.env.MICROSOFT_TEAMS_BOT_ID
const MICROSOFT_SCOPES = ['offline_access', 'openid', 'profile']

export const useMicrosoftTeamsBot = (next?: string) => {
	const { project_id } = useParams<{ project_id: string }>()
	const [addIntegrationToProject] = useAddIntegrationToProjectMutation({
		refetchQueries: [
			namedOperations.Query.GetAlertsPagePayload,
			namedOperations.Query.GetWorkspaceIsIntegratedWithMicrosoftTeams,
		],
	})
	const addMicrosoftTeamsBotIntegrationToProject = useCallback(
		(code: string, projectId?: string) =>
			addIntegrationToProject({
				variables: {
					project_id: projectId || project_id!,
					code,
					integration_type: IntegrationType.MicrosoftTeams,
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

	const removeMicrosoftTeamsIntegrationFromProject = useCallback(
		(projectId?: string) =>
			removeIntegrationFromProject({
				variables: {
					integration_type: IntegrationType.MicrosoftTeams,
					project_id: projectId || project_id!,
				},
			}),
		[project_id, removeIntegrationFromProject],
	)

	const [loading, setLoading] = useState<boolean>(false)
	const [
		isMicrosoftTeamsConnectedToWorkspace,
		setIsMicrosoftTeamsConnectedToWorkspace,
	] = useState<boolean>(false)

	const {
		data: microsoftTeamsIntegResponse,
		loading: microsoftTeamsIntegLoading,
		refetch,
	} = useGetWorkspaceIsIntegratedWithMicrosoftTeamsQuery({
		variables: { project_id: project_id! },
		skip: !project_id,
	})

	useEffect(() => {
		if (!microsoftTeamsIntegResponse) return
		setIsMicrosoftTeamsConnectedToWorkspace(
			microsoftTeamsIntegResponse.is_integrated_with_microsoft_teams ||
				false,
		)
	}, [microsoftTeamsIntegResponse, setIsMicrosoftTeamsConnectedToWorkspace])

	const microsoftTeamsAuthUrl = getMicrosoftTeamsUrl(project_id!, next)

	const addMicrosoftTeamsToWorkspace = useCallback(
		async (code: string, projectId?: string) => {
			setLoading(true)
			await addMicrosoftTeamsBotIntegrationToProject(code, projectId)
			setIsMicrosoftTeamsConnectedToWorkspace(true)
			toast.success('Highlight is now synced with Microsoft Teams!', {
				duration: 5000,
			})
			setLoading(false)
		},
		[
			setLoading,
			addMicrosoftTeamsBotIntegrationToProject,
			setIsMicrosoftTeamsConnectedToWorkspace,
		],
	)

	return {
		loading: loading || microsoftTeamsIntegLoading,
		microsoftTeamsAuthUrl,
		isMicrosoftTeamsConnectedToWorkspace,
		refetch,
		addMicrosoftTeamsToWorkspace,
		removeMicrosoftTeamsIntegrationFromProject,
	}
}

export const getMicrosoftTeamsUrl = (projectId: string, next?: string) => {
	let redirectPath = window.location.pathname
	if (redirectPath.length > 3) {
		// remove project_id and prepended slash
		redirectPath = redirectPath.substring(redirectPath.indexOf('/', 1) + 1)
	}

	const state = { next: next ?? redirectPath, project_id: projectId }
	const redirectUri = `${GetBaseURL()}/callback/microsoft_teams`

	const authUrl =
		`https://login.microsoftonline.com/common/adminconsent` +
		`?client_id=${MICROSOFT_TEAMS_BOT_ID}` +
		`&scope=${encodeURIComponent(MICROSOFT_SCOPES.join(' '))}` +
		`&redirect_uri=${encodeURIComponent(redirectUri)}` +
		`&state=${btoa(JSON.stringify(state))}` +
		`&response_type=code` +
		`&prompt=consent`

	return authUrl
}
