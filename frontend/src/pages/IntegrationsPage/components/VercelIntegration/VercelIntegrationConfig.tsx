import Button from '@components/Button/Button/Button'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration'
import { useVercelIntegration } from '@pages/IntegrationsPage/components/VercelIntegration/utils'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { message } from 'antd'
import React, { useEffect } from 'react'
import { StringParam, useQueryParams } from 'use-query-params'

import styles from './VercelIntegrationConfig.module.scss'

const FRONT_CLIENT_ID = import.meta.env.REACT_APP_FRONT_INTEGRATION_CLIENT_ID

const VercelIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModelOpen,
	setIntegrationEnabled,
	integrationEnabled,
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()

	const [{ code, configurationId, next }] = useQueryParams({
		code: StringParam,
		configurationId: StringParam,
		next: StringParam,
	})

	const {
		removeVercelIntegrationFromProject,
		isVercelIntegratedWithProject,
	} = useVercelIntegration()

	useEffect(() => {
		if (isVercelIntegratedWithProject && !integrationEnabled) {
			setIntegrationEnabled(true)
			setModelOpen(false)
			message.success('Front integration enabled')
		}
	}, [
		isVercelIntegratedWithProject,
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
						trackingId={`IntegrationDisconnectCancel-Vercel`}
						className={styles.modalBtn}
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId={`IntegrationDisconnectSave-Vercel`}
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(false)
							removeVercelIntegrationFromProject()
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
				Connect Highlight with your Vercel projects.
			</p>
			<footer>
				<Button
					trackingId={`IntegrationConfigurationCancel-Vercel`}
					className={styles.modalBtn}
					onClick={() => {
						setModelOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId={`IntegrationConfigurationSave-Vercel`}
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

export default VercelIntegrationConfig
