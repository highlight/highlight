import {
	Box,
	IconSolidLogout,
	IconSolidMicrosoftTeams,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import { Button } from '@/components/Button'

import styles from './MicrosoftTeamsIntegrationConfig.module.css'
import { useMicrosoftTeamsBot } from './utils'

const MicrosoftTeamsIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const {
		microsoftTeamsAuthUrl,
		removeMicrosoftTeamsIntegrationFromProject,
	} = useMicrosoftTeamsBot()

	const isDisconnect = action === IntegrationAction.Disconnect

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				{isDisconnect
					? 'Disconnecting your Microsoft Teams workspace from Highlight will require you to reconfigure any alerts you have made.'
					: 'Connect Microsoft Teams to your Highlight workspace to set up alerts and tag teammates in comments.'}
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
							? 'IntegrationDisconnectCancel-MicrosoftTeams'
							: 'IntegrationConfigurationCancel-MicrosoftTeams'
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
						trackingId="IntegrationDisconnectSave-MicrosoftTeams"
						kind="danger"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLogout />}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeMicrosoftTeamsIntegrationFromProject(
								project_id,
							)
						}}
					>
						Disconnect Microsoft Teams
					</Button>
				) : (
					<Button
						trackingId="IntegrationConfigurationSave-MicrosoftTeams"
						kind="primary"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidMicrosoftTeams />}
						onClick={() => {
							if (microsoftTeamsAuthUrl) {
								window.location.assign(microsoftTeamsAuthUrl)
							}
						}}
					>
						Connect with Microsoft Teams
					</Button>
				)}
			</Box>
		</Stack>
	)
}

export default MicrosoftTeamsIntegrationConfig
