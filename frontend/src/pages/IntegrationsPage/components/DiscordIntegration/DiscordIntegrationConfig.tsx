import Button from '@components/Button/Button/Button'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import { message } from 'antd'
import React, { useEffect } from 'react'

import styles from './DiscordIntegrationConfig.module.scss'

const DiscordIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModelOpen,
	setIntegrationEnabled,
	integrationEnabled,
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const {
		removeDiscordIntegrationFromProject,
		isDiscordIntegratedWithProject,
	} = useDiscordIntegration()

	useEffect(() => {
		if (isDiscordIntegratedWithProject && !integrationEnabled) {
			setIntegrationEnabled(true)
			setModelOpen(false)
			message.success('Discord integration enabled')
		}
	}, [
		isDiscordIntegratedWithProject,
		setIntegrationEnabled,
		setModelOpen,
		integrationEnabled,
	])

	if (integrationEnabled) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting Discord from Highlight will stop enhancing
					your customer interactions.
				</p>
				<footer>
					<Button
						trackingId={`IntegrationDisconnectCancel-Discord`}
						className={styles.modalBtn}
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId={`IntegrationDisconnectSave-Discord`}
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(false)
							removeDiscordIntegrationFromProject()
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disconnect Discord
					</Button>
				</footer>
			</>
		)
	}

	const redirectURI = `${GetBaseURL()}/callback/discord`
	const state = encodeURIComponent(JSON.stringify({ project_id: project_id }))
	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect Discord to your Highlight workspace to setup alerts.
			</p>
			<footer>
				<Button
					trackingId={`IntegrationConfigurationCancel-Discord`}
					className={styles.modalBtn}
					onClick={() => {
						setModelOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId={`IntegrationConfigurationSave-Discord`}
					className={styles.modalBtn}
					type="primary"
					target="_blank"
					href={`https://discord.com/api/oauth2/authorize?client_id=1024079182013149185&permissions=2048&redirect_uri=${redirectURI}&state=${state}&response_type=code&scope=guilds%20guilds.join%20guilds.members.read%20bot`}
				>
					<span className={styles.modalBtnText}>
						<Sparkles2Icon className={styles.modalBtnIcon} />
						<span style={{ marginTop: 4 }}>
							Connect Highlight with Discord
						</span>
					</span>
				</Button>
			</footer>
		</>
	)
}

export default DiscordIntegrationConfig
