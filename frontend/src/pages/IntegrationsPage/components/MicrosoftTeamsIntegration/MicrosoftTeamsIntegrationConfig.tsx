import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { analytics } from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import { useMicrosoftTeamsBot } from './utils'

const MicrosoftTeamsIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const {
		microsoftTeamsAuthUrl,
		removeMicrosoftTeamsIntegrationFromProject,
	} = useMicrosoftTeamsBot()

	if (action === IntegrationAction.Disconnect) {
		return (
			<Stack gap="12">
				<Box paddingY="8">
					<Text color="moderate">
						Disconnecting your Microsoft Teams workspace from
						Highlight will require you to reconfigure any alerts
						you have made!
					</Text>
				</Box>
				<Box
					display="flex"
					justifyContent="flex-end"
					gap="8"
					paddingTop="16"
					borderTop="secondary"
				>
					<Button
						kind="secondary"
						emphasis="medium"
						onClick={() => {
							analytics.track(
								'IntegrationDisconnectCancel-MicrosoftTeams',
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
							analytics.track(
								'IntegrationDisconnectSave-MicrosoftTeams',
							)
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeMicrosoftTeamsIntegrationFromProject(
								project_id,
							)
						}}
					>
						Disconnect Microsoft Teams
					</Button>
				</Box>
			</Stack>
		)
	}

	return (
		<Stack gap="12">
			<Box paddingY="8">
				<Text color="moderate">
					Connect Microsoft Teams to your Highlight workspace to
					setup alerts and tag teammates in comments
				</Text>
			</Box>
			<Box
				display="flex"
				justifyContent="flex-end"
				gap="8"
				paddingTop="16"
				borderTop="secondary"
			>
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track(
							'IntegrationConfigurationCancel-MicrosoftTeams',
						)
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					emphasis="high"
					href={microsoftTeamsAuthUrl}
					as="a"
					iconLeft={<AppsIcon />}
					onClick={() => {
						analytics.track(
							'IntegrationConfigurationSave-MicrosoftTeams',
						)
					}}
				>
					Connect Highlight with Microsoft Teams
				</Button>
			</Box>
		</Stack>
	)
}

export default MicrosoftTeamsIntegrationConfig

