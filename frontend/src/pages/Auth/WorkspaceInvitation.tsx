import { ApolloError } from '@apollo/client'
import { Button } from '@components/Button'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useAddAdminToWorkspaceMutation,
	useGetWorkspaceForInviteLinkQuery,
	useGetWorkspacesQuery,
} from '@graph/hooks'
import { Box, Callout, Stack, Text } from '@highlight-run/ui'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import { Landing } from '@pages/Landing/Landing'
import useLocalStorage from '@rehooks/local-storage'
import { message } from 'antd'
import { H } from 'highlight.run'
import React, { useEffect } from 'react'
import { Navigate, useMatch, useNavigate } from 'react-router-dom'

import { showSupportMessage } from '@/util/window'

import * as styles from './AuthRouter.css'

export const WorkspaceInvitation = () => {
	const [_, setInviteCode] = useLocalStorage('highlightInviteCode')
	const joinWorkspaceMatch = useMatch('/invite/:inviteCode')
	const inviteCode = joinWorkspaceMatch?.params.inviteCode
	const { setLoadingState } = useAppLoadingContext()
	const navigate = useNavigate()
	const { data, error, loading } = useGetWorkspaceForInviteLinkQuery({
		variables: {
			secret: inviteCode!,
		},
	})
	const [
		addAdminToWorkspace,
		{ loading: addAdminLoading, error: addAdminError },
	] = useAddAdminToWorkspaceMutation()
	const { data: workspacesData, loading: workspacesLoading } =
		useGetWorkspacesQuery()
	const workspaceId = data?.workspace_for_invite_link?.workspace_id
	const workspaceName = data?.workspace_for_invite_link?.workspace_name
	const alreadyInWorkspace = workspacesData?.workspaces?.some(
		(w) => w?.id && w.id === workspaceId,
	)

	const clearInviteAndRedirect = () => {
		setInviteCode('')
		navigate('/')
	}

	useEffect(() => {
		setLoadingState(AppLoadingState.LOADED)
	}, [setLoadingState])

	useEffect(() => {
		if (error) {
			clearInviteAndRedirect()

			if (error.message.indexOf('expired') > -1) {
				message.error(
					'This invite link has expired. Please ask your admin for a new one.',
				)
			} else {
				message.error('Invalid invite code.')
			}
		}

		if (alreadyInWorkspace) {
			clearInviteAndRedirect()
			message.success('You are already a member of this workspace.')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [alreadyInWorkspace, error])

	if (loading || workspacesLoading) {
		return null
	}

	if (!workspaceId) {
		return <Navigate replace to="/" />
	}

	return (
		<Landing>
			<Box cssClass={styles.container}>
				<AuthHeader>
					<Text color="moderate">Accept Invitation?</Text>
				</AuthHeader>
				<AuthBody>
					<Stack gap="20">
						<Text align="center">
							Do you want to accept the invitation to join "
							{workspaceName}"?
						</Text>
						{!!addAdminError && (
							<Callout
								kind="error"
								title={getAlertMessage(addAdminError).title}
							>
								{getAlertMessage(addAdminError).description}
							</Callout>
						)}
					</Stack>
				</AuthBody>
				<AuthFooter>
					<Stack gap="8">
						<Button
							trackingId="join-workspace-accept"
							kind="primary"
							loading={addAdminLoading}
							onClick={async () => {
								try {
									await addAdminToWorkspace({
										variables: {
											workspace_id: workspaceId,
											invite_id: inviteCode!,
										},
									})

									message.success(
										`Successfully joined workspace "${workspaceName}"!`,
									)

									clearInviteAndRedirect()
								} catch (_e) {
									message.error(
										'Failed to join the workspace. Please try again.',
									)
									showSupportMessage(
										`I'm having trouble joining the "${workspaceName}" workspace....`,
									)
								}
							}}
						>
							Join
						</Button>
						<Button
							kind="secondary"
							trackingId="join-workspace-ignore"
							onClick={() => {
								setInviteCode('ignored')
								navigate('/')
							}}
						>
							Ignore invitation
						</Button>
					</Stack>
				</AuthFooter>
			</Box>
		</Landing>
	)
}

const getAlertMessage = (
	error: ApolloError,
): { title: string; description: string } => {
	const { message } = error
	const defaultAlertProps = {
		title: 'A problem occurred while trying to join the project.',
		description:
			'This is usually an intermittent issue. If this keeps happening please reach out to us. We are probably already looking into it!',
	}
	const proxyError = new Error(
		'A 500 occurred when an admin tried joining a workspace.',
	)

	if (message.includes('403')) {
		return {
			title: defaultAlertProps.title,
			description:
				"It doesn't look like this is a valid invite link. Ask the person that shared this link with you to double check.",
		}
	}

	if (message.includes('404')) {
		return {
			title: "This invite doesn't exist",
			description:
				'Ask the person that shared this link with you to re-invite you. An invite link expires after it is used.',
		}
	}

	if (message.includes('405')) {
		return {
			title: 'The invite link has expired',
			description:
				'Ask the person that shared with you the invite to create a new invite for you.',
		}
	}

	H.consumeError(proxyError)
	return defaultAlertProps
}
