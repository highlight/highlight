import Button from '@components/Button/Button/Button'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useFrontIntegration } from '@pages/IntegrationsPage/components/FrontIntegration/utils'
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { message } from 'antd'
import React, { useEffect } from 'react'

import styles from './FrontIntegrationConfig.module.scss'

const FRONT_CLIENT_ID = 'e77eb8f15b02423c9525'

const FrontIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModelOpen,
	setIntegrationEnabled,
	integrationEnabled,
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { removeFrontIntegrationFromProject, isFrontIntegratedWithProject } =
		useFrontIntegration()

	useEffect(() => {
		if (isFrontIntegratedWithProject && !integrationEnabled) {
			setIntegrationEnabled(true)
			setModelOpen(false)
			message.success('Front integration enabled')
		}
	}, [
		isFrontIntegratedWithProject,
		setIntegrationEnabled,
		setModelOpen,
		integrationEnabled,
	])

	if (integrationEnabled) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting Front from Highlight will stop enhancing your
					customer interactions.
				</p>
				<footer>
					<Button
						trackingId={`IntegrationDisconnectCancel-Slack`}
						className={styles.modalBtn}
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId={`IntegrationDisconnectSave-Slack`}
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(false)
							removeFrontIntegrationFromProject()
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disconnect Front
					</Button>
				</footer>
			</>
		)
	}

	const redirectURI = `${GetBaseURL()}/callback/front`
	const state = encodeURIComponent(JSON.stringify({ project_id: project_id }))
	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect Highlight with Front to enhance your customer
				conversations with their recorded sessions from your app.
			</p>
			<footer>
				<Button
					trackingId={`IntegrationConfigurationCancel-Front`}
					className={styles.modalBtn}
					onClick={() => {
						setModelOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId={`IntegrationConfigurationSave-Front`}
					className={styles.modalBtn}
					type="primary"
					target="_blank"
					href={`https://app.frontapp.com/oauth/authorize?response_type=code&client_id=${FRONT_CLIENT_ID}&state=${state}&redirect_uri=${redirectURI}`}
				>
					<span className={styles.modalBtnText}>
						<Sparkles2Icon className={styles.modalBtnIcon} />
						<span style={{ marginTop: 4 }}>
							Connect Highlight with Front
						</span>
					</span>
				</Button>
			</footer>
		</>
	)
}

export default FrontIntegrationConfig
