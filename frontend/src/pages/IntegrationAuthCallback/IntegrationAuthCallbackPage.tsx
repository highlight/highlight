import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useGetProjectsAndWorkspacesQuery } from '@graph/hooks'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import { useFrontIntegration } from '@pages/IntegrationsPage/components/FrontIntegration/utils'
import { IntegrationAction } from '@pages/IntegrationsPage/components/Integration'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { VercelIntegrationSettings } from '@pages/IntegrationsPage/components/VercelIntegration/VercelIntegrationConfig'
import { Landing } from '@pages/Landing/Landing'
import { ApplicationContextProvider } from '@routers/OrgRouter/ApplicationContext'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { H } from 'highlight.run'
import { useEffect, useMemo } from 'react'
import { Redirect, useHistory, useLocation } from 'react-router-dom'
import { StringParam, useQueryParams } from 'use-query-params'

interface Props {
	code: string
	projectId?: string
	next?: string
}

export const VercelSettingsModalWidth = 672

const logError = (e: any) => {
	H.consumeError(e)
	message
		.error('Failed to add integration to project. Please try again.')
		?.then(console.error)
}

const SlackIntegrationCallback = ({ code, projectId, next }: Props) => {
	const history = useHistory()
	const { setLoadingState } = useAppLoadingContext()

	const { addSlackToWorkspace } = useSlackBot({
		type: 'Organization',
	})
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
				history.push(nextUrl)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [code, projectId, next, addSlackToWorkspace, history, setLoadingState])

	return null
}
const LinearIntegrationCallback = ({ code, projectId, next }: Props) => {
	const history = useHistory()
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
				history.push(nextUrl)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [
		code,
		projectId,
		next,
		history,
		setLoadingState,
		addLinearIntegrationToProject,
	])
	return null
}
const FrontIntegrationCallback = ({ code, projectId }: Props) => {
	const history = useHistory()
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
				history.push(next)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [
		history,
		setLoadingState,
		addFrontIntegrationToProject,
		code,
		projectId,
	])

	return null
}

const VercelIntegrationCallback = ({ code }: Props) => {
	const history = useHistory()

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
			<Redirect
				to={`/new?next=${encodeURIComponent(
					`/callback/vercel${search}`,
				)}`}
			/>
		)
	}

	return (
		<ApplicationContextProvider
			value={{
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
									history.push(`/${projectId}/integrations`)
								}
							}}
							onCancel={() => {
								if (next) {
									window.close()
								} else {
									history.push(`/${projectId}/integrations`)
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

const DiscordIntegrationCallback = ({ code, projectId }: Props) => {
	const history = useHistory()
	const { setLoadingState } = useAppLoadingContext()
	const { addDiscordIntegrationToProject } = useDiscordIntegration()

	useEffect(() => {
		if (!projectId || !code) return
		const next = `/${projectId}/integrations`
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
				history.push(next)
				setLoadingState(AppLoadingState.LOADED)
			}
		})()
	}, [
		history,
		setLoadingState,
		addDiscordIntegrationToProject,
		code,
		projectId,
	])

	return null
}

const IntegrationAuthCallbackPage = () => {
	const { integrationName } = useParams<{
		integrationName: string
	}>()
	const { setLoadingState } = useAppLoadingContext()

	useEffect(() => {
		setLoadingState(AppLoadingState.EXTENDED_LOADING)
	}, [setLoadingState])

	const { code, projectId, next } = useMemo(() => {
		const urlParams = new URLSearchParams(window.location.search)
		const code = urlParams.get('code')!
		const state = urlParams.get('state') || ''
		let projectId: string | undefined = undefined
		let next: string | undefined = undefined
		if (state) {
			let parsedState: any
			try {
				parsedState = JSON.parse(atob(state))
			} catch (e) {
				parsedState = JSON.parse(state)
			}
			projectId = parsedState['project_id']
			next = parsedState['next']
		}
		return {
			code,
			projectId,
			next,
		}
	}, [])

	if (integrationName.toLowerCase() === 'slack') {
		return (
			<SlackIntegrationCallback
				code={code}
				projectId={projectId}
				next={next}
			/>
		)
	} else if (integrationName.toLowerCase() === 'linear') {
		return (
			<LinearIntegrationCallback
				code={code}
				projectId={projectId}
				next={next}
			/>
		)
	} else if (integrationName.toLowerCase() === 'front') {
		return <FrontIntegrationCallback code={code} projectId={projectId} />
	} else if (integrationName.toLowerCase() === 'vercel') {
		return <VercelIntegrationCallback code={code} />
	} else if (integrationName.toLowerCase() === 'discord') {
		return <DiscordIntegrationCallback code={code} projectId={projectId} />
	}

	return null
}

export default IntegrationAuthCallbackPage
