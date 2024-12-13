import { Button } from '@components/Button'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import { toast } from '@components/Toaster'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import {
	useGetProjectsAndWorkspacesQuery,
	useGetWorkspacesQuery,
	useHandleAwsMarketplaceMutation,
} from '@graph/hooks'
import { Form, Stack, Text } from '@highlight-run/ui/components'
import * as styles from '@pages/Auth/AdminForm.css'
import * as authRouterStyles from '@pages/Auth/AuthRouter.css'
import { AuthBody, AuthFooter, AuthHeader } from '@pages/Auth/Layout'
import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
import { IntegrationAction } from '@pages/IntegrationsPage/components/Integration'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { VercelIntegrationSettings } from '@pages/IntegrationsPage/components/VercelIntegration/VercelIntegrationConfig'
import { Landing } from '@pages/Landing/Landing'
import { ApplicationContextProvider } from '@routers/AppRouter/context/ApplicationContext'
import log from '@util/log'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import { useCallback, useEffect, useMemo } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { StringParam, useQueryParams } from 'use-query-params'

import { useAuthContext } from '@/authentication/AuthContext'
import { RetentionPeriod } from '@/graph/generated/schemas'
import { SIGN_IN_ROUTE } from '@/pages/Auth/AuthRouter'
import { authRedirect } from '@/pages/Auth/utils'
import { useGitlabIntegration } from '@/pages/IntegrationsPage/components/GitlabIntegration/utils'
import { useJiraIntegration } from '@/pages/IntegrationsPage/components/JiraIntegration/utils'
import { useMicrosoftTeamsBot } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'

interface Props {
	code: string
	projectId?: string
	next?: string
	workspaceId?: string
}

export const VercelSettingsModalWidth = 672

const WorkspaceIntegrations = new Set<string>([
	'clickup',
	'github',
	'height',
	'jira',
	'gitlab',
	'aws-mp',
])

const logError = (e: any) => {
	H.consumeError(e)
	toast
		.error('Failed to add integration to project. Please try again.')
		?.then(console.error)
}

const SlackIntegrationCallback = ({
	code,
	projectId,
	next,
	workspaceId,
}: Props) => {
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()

	const { addSlackToWorkspace } = useSlackBot(projectId)
	useEffect(() => {
		let nextUrl = `/w/${workspaceId}integrations`
		;(async () => {
			try {
				if (!projectId || !code) return

				if (next) {
					nextUrl = `/w/${next}`
				} else {
					nextUrl = workspaceId
						? `/w/${workspaceId}/integrations`
						: '/'
				}

				await addSlackToWorkspace(code, projectId)
			} catch (e: any) {
				logError(e)
			} finally {
				navigate(nextUrl)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [
		code,
		projectId,
		next,
		addSlackToWorkspace,
		setLoadingState,
		navigate,
		workspaceId,
	])

	return null
}

const MicrosoftTeamsIntegrationCallback = ({
	code,
	projectId,
	next,
	workspaceId,
}: Props) => {
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()
	const { addMicrosoftTeamsToWorkspace } = useMicrosoftTeamsBot()
	useEffect(() => {
		let nextUrl = `/w/${workspaceId}/integrations`
		;(async () => {
			try {
				if (!projectId || !code) return

				if (next) {
					nextUrl = `/w/${next}`
				} else {
					nextUrl = workspaceId
						? `/w/${workspaceId}/integrations`
						: '/'
				}

				await addMicrosoftTeamsToWorkspace(code, projectId)
			} catch (e: any) {
				logError(e)
			} finally {
				navigate(nextUrl)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [
		code,
		projectId,
		next,
		addMicrosoftTeamsToWorkspace,
		setLoadingState,
		navigate,
		workspaceId,
	])

	return null
}
const LinearIntegrationCallback = ({
	code,
	projectId,
	next,
	workspaceId,
}: Props) => {
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()

	const { addLinearIntegrationToProject } = useLinearIntegration(projectId!)

	useEffect(() => {
		let nextUrl = `/w/${workspaceId}/integrations/linear`
		;(async () => {
			try {
				if (!projectId || !code) return

				if (next) {
					nextUrl = `/w/${next}`
				} else {
					nextUrl = workspaceId
						? `/w/${workspaceId}/integrations/linear`
						: '/'
				}

				await addLinearIntegrationToProject(code, projectId)
				toast.success('Highlight is now synced with Linear!', {
					duration: 5000,
				})
			} catch (e: any) {
				logError(e)
			} finally {
				navigate(nextUrl)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [
		code,
		projectId,
		next,
		setLoadingState,
		addLinearIntegrationToProject,
		navigate,
		workspaceId,
	])
	return null
}

const VercelIntegrationCallback = ({ code, workspaceId }: Props) => {
	const navigate = useNavigate()

	const [{ next }] = useQueryParams({
		configurationId: StringParam,
		next: StringParam,
	})

	const { data, loading } = useGetProjectsAndWorkspacesQuery()

	let projectId = ''
	if (data?.projects && data.projects[0]) {
		projectId = data.projects[0].id
	}

	const { addVercelIntegrationToProject } = useVercelIntegration(projectId)

	useEffect(() => {
		if (code && projectId) {
			addVercelIntegrationToProject(code, projectId)
		}
	}, [addVercelIntegrationToProject, code, projectId])

	const { isLoggedIn } = useAuthContext()
	const { search } = useLocation()

	if (loading) {
		return null
	}

	// If there are no projects, redirect to create one
	if ((data?.projects?.length ?? 0) === 0) {
		const callbackPath = `/callback/vercel${search}`

		if (!isLoggedIn) {
			authRedirect.set(callbackPath)
			return <Navigate to={SIGN_IN_ROUTE} replace />
		}

		return (
			<Navigate
				to={`/new?next=${encodeURIComponent(callbackPath)}`}
				replace
			/>
		)
	}

	return (
		<ApplicationContextProvider
			value={{
				loading: false,
				currentProject: undefined,
				allProjects: data?.projects || [],
				currentWorkspace: undefined,
				joinableWorkspaces: [],
				workspaces: [],
			}}
		>
			<Landing>
				<div className="w-[672px] rounded-md bg-white px-8 py-6">
					<div className="m-4">
						<h3>Configuring Vercel Integration</h3>
						<VercelIntegrationSettings
							onSuccess={() => {
								authRedirect.clear()

								if (next) {
									window.location.href = next
								} else {
									navigate(
										`/${workspaceId}/integrations/vercel`,
									)
								}
							}}
							onCancel={() => {
								authRedirect.clear()

								if (next) {
									window.close()
								} else {
									navigate(
										`/${workspaceId}/integrations/vercel`,
									)
								}
							}}
							setIntegrationEnabled={() => {}}
							setModalOpen={() => {}}
							action={IntegrationAction.Settings}
						/>
					</div>
				</div>
			</Landing>
		</ApplicationContextProvider>
	)
}

const DiscordIntegrationCallback = ({
	code,
	projectId,
	next,
	workspaceId,
}: Props) => {
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()
	const { addDiscordIntegrationToProject } = useDiscordIntegration(projectId!)

	useEffect(() => {
		if (!projectId || !code) return
		;(async () => {
			try {
				await addDiscordIntegrationToProject(code, projectId)
				toast.success('Highlight is now synced with Discord!', {
					duration: 5000,
				})
			} catch (e: any) {
				H.consumeError(e)
				console.error(e)
				toast.error(
					'Failed to add integration to project. Please try again.',
				)
			} finally {
				navigate(next ?? `/w/${workspaceId}/integrations`)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [
		setLoadingState,
		addDiscordIntegrationToProject,
		code,
		projectId,
		navigate,
		next,
		workspaceId,
	])

	return null
}

const WorkspaceIntegrationCallback = ({
	code,
	projectId,
	name,
	type,
	addIntegration,
	next,
	workspaceId,
}: Props & {
	name: string
	type: string
	addIntegration: (code: string) => Promise<unknown>
}) => {
	const codeSessionStorageKey = 'integration-callback-code'
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()

	const add = useCallback(async () => {
		log('IntegrationAuthCallback.tsx', 'add', {
			setLoadingState,
			code,
			projectId,
			addIntegration,
			name,
			type,
			navigate,
			next,
		})

		if (!addIntegration || !code) return
		const usedCode = sessionStorage.getItem(codeSessionStorageKey) === code
		if (!!code && usedCode) return

		const redirectUrl =
			next ||
			(workspaceId ? `/w/${workspaceId}/integrations/${type}` : `/`)

		try {
			sessionStorage.setItem(codeSessionStorageKey, code)
			log('IntegrationAuthCallback.tsx', 'calling addIntegration')
			await addIntegration(code)
			toast.success(`Highlight is now synced with ${name}!`, {
				duration: 5000,
			})
		} catch (e: any) {
			H.consumeError(e)
			console.error(e)
			toast.error(
				'Failed to add integration to project. Please try again.',
			)
		} finally {
			navigate(redirectUrl)
			setLoadingState(AppLoadingState.LOADED)
			sessionStorage.removeItem(codeSessionStorageKey)
		}
	}, [
		setLoadingState,
		code,
		projectId,
		addIntegration,
		name,
		type,
		navigate,
		next,
		workspaceId,
	])
	useEffect(() => {
		add().then(() =>
			log('IntegrationAuthCallback.tsx', 'added integration'),
		)
	}, [add])

	return null
}

const ClickUpIntegrationCallback = ({
	code,
	projectId,
	workspaceId,
}: Props) => {
	const { addIntegration } = useClickUpIntegration()
	return (
		<WorkspaceIntegrationCallback
			code={code}
			name="ClickUp"
			type="clickup"
			addIntegration={addIntegration}
			projectId={projectId}
			workspaceId={workspaceId}
		/>
	)
}

const HeightIntegrationCallback = ({ code, projectId, workspaceId }: Props) => {
	const { addIntegration } = useHeightIntegration()
	return (
		<WorkspaceIntegrationCallback
			code={code}
			name="Height"
			type="height"
			addIntegration={addIntegration}
			projectId={projectId}
			workspaceId={workspaceId}
		/>
	)
}

const GitHubIntegrationCallback = ({
	projectId,
	next,
	installationId,
	workspaceId,
}: Omit<Props, 'code'> & { installationId?: string; setupAction?: string }) => {
	const { addIntegration } = useGitHubIntegration()
	return (
		<WorkspaceIntegrationCallback
			name="GitHub"
			type="github"
			addIntegration={addIntegration}
			code={installationId!}
			projectId={projectId}
			next={next}
			workspaceId={workspaceId}
		/>
	)
}

const AWSMPIntegrationCallback = ({ code }: { code: string }) => {
	const { isLoggedIn } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()
	const { data: workspacesData, loading: workspacesLoading } =
		useGetWorkspacesQuery({
			fetchPolicy: 'network-only',
		})
	const navigate = useNavigate()
	const [handle, { loading: handleLoading }] =
		useHandleAwsMarketplaceMutation()
	const formStore = Form.useStore({
		defaultValues: {
			workspaceId: '',
		},
	})
	const workspaceId = formStore.useValue('workspaceId')
	formStore.useSubmit(async (formState) => {
		const workspaceId = formState.values.workspaceId
		if (workspaceId && code) {
			handle({
				variables: {
					workspace_id: workspaceId,
					code,
				},
			})
				.then(() => {
					navigate(`/w/${workspaceId}/current-plan/success`)
				})
				.catch((e) => {
					toast.error(
						`Error connecting AWS Marketplace Subscription: ${e.message}`,
						{ duration: 5000 },
					)
				})
		}
	})
	useEffect(() => {
		if (workspacesLoading) {
			setLoadingState(AppLoadingState.LOADED)
		}
	}, [setLoadingState, workspacesLoading])

	// Require log in
	if (!isLoggedIn) {
		const callbackPath = `/callback/aws-mp?code=${code}`
		authRedirect.set(callbackPath)
		return <Navigate to={SIGN_IN_ROUTE} replace />
	}

	return (
		<Landing>
			<Form className={authRouterStyles.container} store={formStore}>
				<AuthHeader>
					<Text color="moderate">
						Connect AWS Marketplace Subscription
					</Text>
				</AuthHeader>
				<AuthBody>
					<Stack gap="16" direction="column">
						<select
							className={styles.select}
							onChange={(e) => {
								const selectedWorkspace =
									workspacesData?.workspaces?.find(
										(workspace) =>
											workspace?.id === e.target.value,
									)

								formStore.setValue(
									formStore.names.workspaceId,
									selectedWorkspace?.id,
								)
							}}
						>
							<option value="">Select a workspace</option>

							{workspacesData?.workspaces?.map((workspace) => (
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
						disabled={!workspaceId}
						onClick={() => null}
						trackingId="aws marketplace workspace connect"
						loading={handleLoading}
					>
						Connect
					</Button>
				</AuthFooter>
			</Form>
		</Landing>
	)
}

const JiraIntegrationCallback = ({ code, projectId, workspaceId }: Props) => {
	const { addIntegration } = useJiraIntegration()
	return (
		<WorkspaceIntegrationCallback
			code={code}
			name="Jira"
			type="jira"
			addIntegration={addIntegration}
			projectId={projectId}
			workspaceId={workspaceId}
		/>
	)
}

const GitlabIntegrationCallback = ({ code, projectId, workspaceId }: Props) => {
	const { addIntegration } = useGitlabIntegration()
	return (
		<WorkspaceIntegrationCallback
			code={code}
			name="GitLab"
			type="gitlab"
			addIntegration={addIntegration}
			projectId={projectId}
			workspaceId={workspaceId}
		/>
	)
}

const IntegrationAuthCallbackPage = () => {
	const { integrationName } = useParams<{
		integrationName: string
	}>()
	const { isAuthLoading } = useAuthContext()
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		if (isAuthLoading) {
			setLoadingState(AppLoadingState.EXTENDED_LOADING)
		}
	}, [isAuthLoading, setLoadingState])

	const {
		code,
		projectId,
		workspaceId,
		next,
		installationId,
		setupAction,
		tenantId,
	} = useMemo(() => {
		const urlParams = new URLSearchParams(window.location.search)
		const code = urlParams.get('code')!
		const tenantId = urlParams.get('tenant')!
		const state = urlParams.get('state') || ''
		const installationId = urlParams.get('installation_id') || ''
		const setupAction = urlParams.get('setup_action') || ''
		let projectId: string | undefined = undefined
		let next: string | undefined = undefined
		let workspaceId: string | undefined = undefined
		if (state) {
			let parsedState: any
			try {
				parsedState = JSON.parse(atob(state))
			} catch (e) {
				parsedState = JSON.parse(state)
			}
			projectId = parsedState['project_id']
			next = parsedState['next']
			workspaceId = parsedState['workspace_id']
		}
		return {
			code,
			projectId,
			next,
			workspaceId,
			installationId,
			setupAction,
			tenantId,
		}
	}, [])

	const name = integrationName?.toLowerCase() || ''

	const { data: workspacesData } = useGetWorkspacesQuery({
		variables: {},
		skip: !!workspaceId,
	})
	const currentWorkspaceId = workspacesData?.workspaces?.at(0)?.id ?? ''

	if (name === 'vercel') {
		return (
			<VercelIntegrationCallback code={code} workspaceId={workspaceId} />
		)
	}

	log('IntegrationAuthCallback.tsx', { workspaceId, currentWorkspaceId })
	if (!workspaceId && !currentWorkspaceId) {
		return null
	}

	if (WorkspaceIntegrations.has(name)) {
		let cb = null
		switch (name) {
			case 'clickup':
				cb = (
					<ClickUpIntegrationCallback
						code={code}
						projectId={projectId}
						workspaceId={workspaceId}
					/>
				)
				break
			case 'jira':
				cb = (
					<JiraIntegrationCallback
						code={code}
						projectId={projectId}
						workspaceId={workspaceId}
					/>
				)
				break
			case 'gitlab':
				cb = (
					<GitlabIntegrationCallback
						code={code}
						projectId={projectId}
						workspaceId={workspaceId}
					/>
				)
				break
			case 'height':
				cb = (
					<HeightIntegrationCallback
						code={code}
						projectId={projectId}
						workspaceId={workspaceId}
					/>
				)
				break
			case 'github':
				cb = (
					<GitHubIntegrationCallback
						projectId={projectId}
						installationId={installationId}
						setupAction={setupAction}
						next={next}
						workspaceId={workspaceId}
					/>
				)
				break
			case 'aws-mp':
				cb = <AWSMPIntegrationCallback code={code} />
				break
		}
		return (
			<ApplicationContextProvider
				value={{
					loading: false,
					currentProject: undefined,
					allProjects: [],
					currentWorkspace: {
						id: workspaceId ?? currentWorkspaceId,
						name: '',
						retention_period: RetentionPeriod.SixMonths,
						errors_retention_period: RetentionPeriod.SixMonths,
					},
					workspaces: [],
					joinableWorkspaces: [],
				}}
			>
				{' '}
				{cb}
			</ApplicationContextProvider>
		)
	}

	switch (integrationName?.toLowerCase()) {
		case 'slack':
			return (
				<SlackIntegrationCallback
					code={code}
					projectId={projectId}
					next={next}
					workspaceId={workspaceId}
				/>
			)
		case 'microsoft_teams':
			return (
				<MicrosoftTeamsIntegrationCallback
					code={tenantId}
					projectId={projectId}
					next={next}
					workspaceId={workspaceId}
				/>
			)
		case 'linear':
			return (
				<LinearIntegrationCallback
					code={code}
					projectId={projectId}
					next={next}
					workspaceId={workspaceId}
				/>
			)
		case 'discord':
			return (
				<DiscordIntegrationCallback
					code={code}
					projectId={projectId}
					next={next}
					workspaceId={workspaceId}
				/>
			)
	}

	return null
}

export default IntegrationAuthCallbackPage
