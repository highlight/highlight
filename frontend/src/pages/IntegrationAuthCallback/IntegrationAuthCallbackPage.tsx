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
import { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

const IntegrationAuthCallbackPage = () => {
	const { integrationName } = useParams<{
		integrationName: string
	}>()
	const history = useHistory()
	const { setLoadingState } = useAppLoadingContext()

	const { addSlackToWorkspace } = useSlackBot({
		type: 'Organization',
	})

	const { addLinearIntegrationToProject } = useLinearIntegration()
	const { addFrontIntegrationToProject } = useFrontIntegration()

	useEffect(() => {
		setLoadingState(AppLoadingState.EXTENDED_LOADING)
		const urlParams = new URLSearchParams(window.location.search)
		const code = urlParams.get('code')
		const state = urlParams.get('state') || ''
		let next = '/integrations'
		;(async () => {
			try {
				const parsedState = JSON.parse(atob(state))
				const project_id = parsedState['project_id']

				if (!project_id) {
					throw new Error(
						'Error adding integration: no project_id in state query string',
					)
				}

				if (!parsedState['next']) {
					next = `/${project_id}/${parsedState['next']}`
				} else {
					next = `/${project_id}/integrations`
				}

				if (!code) {
					throw new Error(
						'Error adding integration: no code in url query string',
					)
				}

				if (integrationName.toLowerCase() === 'slack') {
					await addSlackToWorkspace(code, project_id)
				} else if (integrationName.toLocaleLowerCase() === 'linear') {
					await addLinearIntegrationToProject(code, project_id)
					message.success('Highlight is now synced with Linear!', 5)
				} else if (integrationName.toLowerCase() === 'front') {
					await addFrontIntegrationToProject(code, project_id)
					message.success('Highlight is now synced with Front!', 5)
				}
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
		addSlackToWorkspace,
		integrationName,
		history,
		setLoadingState,
		addLinearIntegrationToProject,
		addFrontIntegrationToProject,
	])

	return null
}

export default IntegrationAuthCallbackPage
