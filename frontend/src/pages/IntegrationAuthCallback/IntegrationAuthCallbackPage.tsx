import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectsAndWorkspacesQuery } from '@graph/hooks'
import { useClickUpIntegration } from '@pages/IntegrationsPage/components/ClickUpIntegration/utils'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import { useFrontIntegration } from '@pages/IntegrationsPage/components/FrontIntegration/utils'
import { useGitHubIntegration } from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import { useHeightIntegration } from '@pages/IntegrationsPage/components/HeightIntegration/utils'
import { IntegrationAction } from '@pages/IntegrationsPage/components/Integration'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { VercelIntegrationSettings } from '@pages/IntegrationsPage/components/VercelIntegration/VercelIntegrationConfig'
import { Landing } from '@pages/Landing/Landing'
import { ApplicationContextProvider } from '@routers/AppRouter/context/ApplicationContext'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { H } from 'highlight.run'
import { useEffect, useMemo } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { StringParam, useQueryParams } from 'use-query-params'

interface Props {
	code: string
	projectId?: string
	next?: string
}

export const VercelSettingsModalWidth = 672

const WorkspaceIntegrations = new Set<string>(['clickup', 'github', 'height'])

const logError = (e: any) => {
	H.consumeError(e)
	message
		.error('Failed to add integration to project. Please try again.')
		?.then(console.error)
}

const SlackIntegrationCallback = ({ code, projectId, next }: Props) => {
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()

	const { addSlackToWorkspace } = useSlackBot()
	useEffect(() => {
		let nextUrl = '/integrations'
		;(async () => {
			try {
				if (!projectId || !code) return

				if (next) {
					nextUrl = `/${projectId}/${next}`
				} else {
					nextUrl = `/${projectId}/integrations`
				}

				await addSlackToWorkspace(code, projectId)
			} catch (e: any) {
				logError(e)
			} finally {
				navigate(nextUrl)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [code, projectId, next, addSlackToWorkspace, setLoadingState, navigate])

	return null
}
const LinearIntegrationCallback = ({ code, projectId, next }: Props) => {
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()

	const { addLinearIntegrationToProject } = useLinearIntegration()

	useEffect(() => {
		let nextUrl = '/integrations'
		;(async () => {
			try {
				if (!projectId || !code) return

				if (next) {
					nextUrl = `/${projectId}/${next}`
				} else {
					nextUrl = `/${projectId}/integrations`
				}

				await addLinearIntegrationToProject(code, projectId)
				message.success('Highlight is now synced with Linear!', 5)
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
	])
	return null
}
const FrontIntegrationCallback = ({ code, projectId }: Props) => {
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()
	const { addFrontIntegrationToProject } = useFrontIntegration()

	useEffect(() => {
		if (!projectId || !code) return
		const next = `/${projectId}/integrations`
		;(async () => {
			try {
				await addFrontIntegrationToProject(code, projectId)
				message.success('Highlight is now synced with Front!', 5)
			} catch (e: any) {
				H.consumeError(e)
				console.error(e)
				message.error(
					'Failed to add integration to project. Please try again.',
				)
			} finally {
				navigate(next)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [
		setLoadingState,
		addFrontIntegrationToProject,
		code,
		projectId,
		navigate,
	])

	return null
}

const VercelIntegrationCallback = ({ code }: Props) => {
	const navigate = useNavigate()

	const [{ next }] = useQueryParams({
		configurationId: StringParam,
		next: StringParam,
	})

	const { data } = useGetProjectsAndWorkspacesQuery()

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

	const { search } = useLocation()

	// If there are no projects, redirect to create one
	if (data?.projects?.length === 0) {
		return (
			<Navigate
				to={`/new?next=${encodeURIComponent(
					`/callback/vercel${search}`,
				)}`}
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
				workspaces: [],
			}}
		>
			<Landing>
				<div className="w-[672px] rounded-md bg-white px-8 py-6">
					<div className="m-4">
						<h3>Configuring Vercel Integration</h3>
						<VercelIntegrationSettings
							onSuccess={() => {
								if (next) {
									window.location.href = next
								} else {
									navigate(`/${projectId}/integrations`)
								}
							}}
							onCancel={() => {
								if (next) {
									window.close()
								} else {
									navigate(`/${projectId}/integrations`)
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

const DiscordIntegrationCallback = ({ code, projectId, next }: Props) => {
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()
	const { addDiscordIntegrationToProject } = useDiscordIntegration()

	useEffect(() => {
		if (!projectId || !code) return
		;(async () => {
			try {
				await addDiscordIntegrationToProject(code, projectId)
				message.success('Highlight is now synced with Discord!', 5)
			} catch (e: any) {
				H.consumeError(e)
				console.error(e)
				message.error(
					'Failed to add integration to project. Please try again.',
				)
			} finally {
				navigate(next ?? `/${projectId}/integrations`)
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
}: Props & {
	name: string
	type: string
	addIntegration: (code: string) => Promise<unknown>
}) => {
	const navigate = useNavigate()
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		if (!addIntegration || !code) return
		const redirectUrl = next || `/${projectId}/integrations/${type}`
		;(async () => {
			try {
				await addIntegration(code)
				message.success(`Highlight is now synced with ${name}!`, 5)
			} catch (e: any) {
				H.consumeError(e)
				console.error(e)
				message.error(
					'Failed to add integration to project. Please try again.',
				)
			} finally {
				navigate(redirectUrl)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [
		setLoadingState,
		code,
		projectId,
		addIntegration,
		name,
		type,
		navigate,
		next,
	])

	return null
}

const ClickUpIntegrationCallback = ({ code, projectId }: Props) => {
	const { addIntegration } = useClickUpIntegration()
	return (
		<WorkspaceIntegrationCallback
			code={code}
			name="ClickUp"
			type="clickup"
			addIntegration={addIntegration}
			projectId={projectId}
		/>
	)
}

const HeightIntegrationCallback = ({ code, projectId }: Props) => {
	const { addIntegration } = useHeightIntegration()
	return (
		<WorkspaceIntegrationCallback
			code={code}
			name="Height"
			type="height"
			addIntegration={addIntegration}
			projectId={projectId}
		/>
	)
}

const GitHubIntegrationCallback = ({
	projectId,
	next,
	installationId,
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
		/>
	)
}

const IntegrationAuthCallbackPage = () => {
	const { integrationName } = useParams<{
		integrationName: string
	}>()
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		setLoadingState(AppLoadingState.EXTENDED_LOADING)
	}, [setLoadingState])

	const { code, projectId, workspaceId, next, installationId, setupAction } =
		useMemo(() => {
			const urlParams = new URLSearchParams(window.location.search)
			const code = urlParams.get('code')!
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
			}
		}, [])

	const name = integrationName?.toLowerCase() || ''

	if (WorkspaceIntegrations.has(name)) {
		let cb = null
		switch (name) {
			case 'clickup':
				cb = (
					<ClickUpIntegrationCallback
						code={code}
						projectId={projectId}
					/>
				)
				break
			case 'height':
				cb = (
					<HeightIntegrationCallback
						code={code}
						projectId={projectId}
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
					/>
				)
				break
		}
		return (
			<ApplicationContextProvider
				value={{
					loading: false,
					currentProject: undefined,
					allProjects: [],
					currentWorkspace: workspaceId
						? { id: workspaceId, name: '' }
						: undefined,
					workspaces: [],
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
				/>
			)
		case 'linear':
			return (
				<LinearIntegrationCallback
					code={code}
					projectId={projectId}
					next={next}
				/>
			)
		case 'front':
			return (
				<FrontIntegrationCallback code={code} projectId={projectId} />
			)
		case 'vercel':
			return <VercelIntegrationCallback code={code} />
		case 'discord':
			return (
				<DiscordIntegrationCallback
					code={code}
					projectId={projectId}
					next={next}
				/>
			)
	}

	return null
}

export default IntegrationAuthCallbackPage
