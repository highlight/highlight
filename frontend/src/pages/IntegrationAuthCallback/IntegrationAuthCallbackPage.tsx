import { useSlackBot } from '@components/Header/components/PersonalNotificationButton/utils/utils'
import {
	AppLoadingState,
	useAppLoadingContext,
} from '@context/AppLoadingContext'
import { useFrontIntegration } from '@pages/IntegrationsPage/components/FrontIntegration/utils'
import { useLinearIntegration } from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { H } from 'highlight.run'
import { useEffect, useMemo } from 'react'
import { useHistory } from 'react-router-dom'

interface Props {
	code: string
	projectId?: string
	next?: string
}

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

const VercelIntegrationCallback = ({ code, projectId }: Props) => {
	const history = useHistory()
	const { setLoadingState } = useAppLoadingContext()
	const { addFrontIntegrationToProject } = useFrontIntegration()

	useEffect(() => {
		if (!code) return
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
		return <FrontIntegrationCallback code={code} projectId={projectId} />
	}

	return null
}

export default IntegrationAuthCallbackPage
