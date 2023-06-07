import { Form, Stack, Text, useFormState } from '@highlight-run/ui'
import { message } from 'antd'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from 'react-use'

import { getEmailDomain } from '@/components/AutoJoinEmailsInput'
import { Button } from '@/components/Button'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@/context/AppLoadingContext'
import {
	useGetAdminQuery,
	useGetWorkspacesQuery,
	useJoinWorkspaceMutation,
} from '@/graph/generated/hooks'
import { AuthBody, AuthFooter, AuthHeader } from '@/pages/Auth/Layout'
import { Landing } from '@/pages/Landing/Landing'
import { ABOUT_YOU_ROUTE } from '@/routers/AppRouter/AppRouter'

import * as styles from './AdminForm.css'
import * as authRouterStyles from './AuthRouter.css'

export const DISMISS_JOIN_WORKSPACE_LOCAL_STORAGE_KEY =
	'highlightDismissedJoinWorkspace'

export const JoinWorkspace = () => {
	const { data, loading } = useGetWorkspacesQuery()
	const { data: adminData } = useGetAdminQuery()
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()
	const [joinWorkspace, { loading: joinLoading }] = useJoinWorkspaceMutation()
	const [_, setDismissedJoinWorkspace] = useLocalStorage(
		DISMISS_JOIN_WORKSPACE_LOCAL_STORAGE_KEY,
		false,
	)

	const form = useFormState({
		defaultValues: {
			workspaceId: '',
		},
	})

	form.useSubmit(async () => {
		const response = await joinWorkspace({
			variables: {
				workspace_id: form.values.workspaceId,
			},
		})

		if (!!response.data?.joinWorkspace) {
			setDismissedJoinWorkspace(true)
			message.success('Successfuly joined workspace!', 1)
			navigate(ABOUT_YOU_ROUTE, { replace: true })
		}
	})

	useEffect(() => {
		if (!loading) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [loading, setLoadingState])

	useEffect(() => {
		if (data && !data?.joinable_workspaces?.length) {
			navigate(ABOUT_YOU_ROUTE, { replace: true })
		}
	}, [data, navigate])

	if (loading) {
		return null
	}

	const emailDomain = getEmailDomain(adminData?.admin?.email)

	return (
		<Landing>
			<Form className={authRouterStyles.container} state={form}>
				<AuthHeader>
					<Text color="moderate">Join Workspace</Text>
				</AuthHeader>
				<AuthBody>
					<Stack gap="16" direction="column">
						<Text>
							Based on your <b>@{emailDomain}</b> email address
							you are able to join the following workspaces.
						</Text>

						<select
							className={styles.select}
							value={form.values.workspaceId}
							onChange={(e) => {
								const selectedWorkspace =
									data?.joinable_workspaces?.find(
										(workspace) =>
											workspace?.id === e.target.value,
									)

								form.setValue(
									form.names.workspaceId,
									selectedWorkspace?.id,
								)
							}}
						>
							<option value="" disabled>
								Select a workspace
							</option>

							{/* TODO: Clean up the select UI */}
							{data?.joinable_workspaces?.map((workspace) => (
								<option
									key={workspace?.id}
									value={workspace?.id}
								>
									{workspace?.name}
								</option>
							))}
						</select>
					</Stack>
				</AuthBody>
				<AuthFooter>
					<Button
						type="submit"
						kind="primary"
						disabled={!form.values.workspaceId}
						onClick={() => null}
						trackingId="join-workspace_submit"
						loading={joinLoading}
					>
						Join Workspace
					</Button>
					<Button
						kind="secondary"
						trackingId="join-workspace_skip"
						onClick={() => {
							setDismissedJoinWorkspace(true)
							navigate(ABOUT_YOU_ROUTE, { replace: true })
						}}
					>
						<Text color="moderate">Cancel</Text>
					</Button>
				</AuthFooter>
			</Form>
		</Landing>
	)
}
