import Button from '@components/Button/Button/Button'
import { toast } from '@components/Toaster'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import React, { useEffect } from 'react'

import styles from './DiscordIntegrationConfig.module.css'

const DISCORD_CLIENT_ID = import.meta.env.DISCORD_CLIENT_ID

export const getDiscordOauthUrl = (
	project_id: string,
	next?: string,
): string => {
	const redirectURI = `${GetBaseURL()}/callback/discord`

	const state = encodeURIComponent(
		JSON.stringify({
			project_id: project_id,
			next: next ?? window.location.pathname,
		}),
	)
	const scope = ['bot']

	// If the bot needs more permissions,
	// visit https://discord.com/developers/applications/1024079182013149185/oauth2/url-generator
	// and use the generator to get a new value
	// Current bot permissions:
	// * Manage Channels
	// * Read Messages/View Channels
	// * Send Messages
	const botPermissions = '3088'

	return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=${botPermissions}&redirect_uri=${redirectURI}&state=${state}&response_type=code&scope=${scope}`
}

const DiscordIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	action,
}) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const {
		removeDiscordIntegrationFromProject,
		isDiscordIntegratedWithProject,
	} = useDiscordIntegration()

	useEffect(() => {
		if (
			isDiscordIntegratedWithProject &&
			action === IntegrationAction.Setup
		) {
			setIntegrationEnabled(true)
			setModalOpen(false)
			toast.success('Discord integration enabled')
		}
	}, [
		isDiscordIntegratedWithProject,
		setIntegrationEnabled,
		setModalOpen,
		action,
	])

	if (action === IntegrationAction.Disconnect) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting Discord from Highlight will prevent alerts
					from notifying Discord channels.
				</p>
				<footer>
					<Button
						trackingId="IntegrationDisconnectCancel-Discord"
						className={styles.modalBtn}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-Discord"
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModalOpen(false)
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

	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect Discord to your Highlight workspace to setup alerts.
			</p>
			<footer>
				<Button
					trackingId="IntegrationConfigurationCancel-Discord"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Discord"
					className={styles.modalBtn}
					type="primary"
					target="_blank"
					href={getDiscordOauthUrl(project_id!)}
				>
					<span className={styles.modalBtnText}>
						<Sparkles2Icon className={styles.modalBtnIcon} />
						<span className="mt-1">
							Connect Highlight with Discord
						</span>
					</span>
				</Button>
			</footer>
		</>
	)
}

export default DiscordIntegrationConfig
