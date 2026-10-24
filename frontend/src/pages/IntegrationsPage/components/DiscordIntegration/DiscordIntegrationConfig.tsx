import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import { toast } from '@components/Toaster'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useDiscordIntegration } from '@pages/IntegrationsPage/components/DiscordIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import { GetBaseURL } from '@util/window'
import React, { useEffect } from 'react'

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
			<Stack gap="12">
				<Text color="moderate">
					Disconnecting Discord from Highlight will prevent alerts
					from notifying Discord channels.
				</Text>
				<Box display="flex" justifyContent="flex-end" gap="8">
					<Button
						kind="secondary"
						emphasis="medium"
						onClick={() => {
							analytics.track(
								'IntegrationDisconnectCancel-Discord',
							)
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						kind="danger"
						emphasis="high"
						iconLeft={<PlugIcon />}
						onClick={() => {
							analytics.track('IntegrationDisconnectSave-Discord')
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeDiscordIntegrationFromProject()
						}}
					>
						Disconnect Discord
					</Button>
				</Box>
			</Stack>
		)
	}

	return (
		<Stack gap="12">
			<Text color="moderate">
				Connect Discord to your Highlight workspace to setup alerts.
			</Text>
			<Box display="flex" justifyContent="flex-end" gap="8">
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationConfigurationCancel-Discord')
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					emphasis="high"
					iconLeft={<Sparkles2Icon />}
					onClick={() => {
						analytics.track('IntegrationConfigurationSave-Discord')
					window.open(getDiscordOauthUrl(project_id!), '_blank')
					}}
				>
					Connect Highlight with Discord
				</Button>
			</Box>
		</Stack>
	)
}

export default DiscordIntegrationConfig

