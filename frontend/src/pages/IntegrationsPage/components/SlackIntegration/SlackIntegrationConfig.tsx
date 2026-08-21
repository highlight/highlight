import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import {
	Box,
	IconSolidLogout,
	IconSolidSlack,
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

import styles from './SlackIntegrationConfig.module.css'

const SlackIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { slackUrl, removeSlackIntegrationFromProject } = useSlackBot()

	const isDisconnect = action === IntegrationAction.Disconnect

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				{isDisconnect
					? 'Disconnecting your Slack workspace from Highlight will require you to reconfigure any alerts you have made.'
					: 'Connect Slack to your Highlight workspace to set up alerts and tag teammates in comments.'}
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
							? 'IntegrationDisconnectCancel-Slack'
							: 'IntegrationConfigurationCancel-Slack'
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
						trackingId="IntegrationDisconnectSave-Slack"
						kind="danger"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLogout />}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeSlackIntegrationFromProject(project_id)
						}}
					>
						Disconnect Slack
					</Button>
				) : (
					<Button
						trackingId="IntegrationConfigurationSave-Slack"
						kind="primary"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidSlack />}
						onClick={() => {
							if (slackUrl) {
								window.location.assign(slackUrl)
							}
						}}
					>
						Connect with Slack
					</Button>
				)}
			</Box>
		</Stack>
	)
}

export default SlackIntegrationConfig
