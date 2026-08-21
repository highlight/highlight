import { toast } from '@components/Toaster'
import {
	Box,
	IconSolidDiscord,
	IconSolidLogout,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import React, { useEffect } from 'react'

import { Button } from '@/components/Button'

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

	const botPermissions = '3088'

	return `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=${botPermissions}&redirect_uri=${redirectURI}&state=${state}&response_type=code&scope=${scope}`
}

const DiscordIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	action,
}) => {
	const { project_id } = useParams<{ project_id: string }>()
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

	const isDisconnect = action === IntegrationAction.Disconnect

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				{isDisconnect
					? 'Disconnecting Discord from Highlight will prevent alerts from notifying Discord channels.'
					: 'Connect Discord to your Highlight workspace to set up alerts.'}
			</Text>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId={
						isDisconnect
							? 'IntegrationDisconnectCancel-Discord'
							: 'IntegrationConfigurationCancel-Discord'
					}
					kind="secondary"
					size="medium"
					emphasis="medium"
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(isDisconnect)
					}}
				>
					Cancel
				</Button>
				{isDisconnect ? (
					<Button
						trackingId="IntegrationDisconnectSave-Discord"
						kind="danger"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLogout />}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeDiscordIntegrationFromProject()
						}}
					>
						Disconnect Discord
					</Button>
				) : (
					<Button
						trackingId="IntegrationConfigurationSave-Discord"
						kind="primary"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidDiscord />}
						onClick={() => {
							window.open(
								getDiscordOauthUrl(project_id!),
								'_blank',
								'noreferrer',
							)
						}}
					>
						Connect with Discord
					</Button>
				)}
			</Box>
		</Stack>
	)
}

export default DiscordIntegrationConfig
