import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { analytics } from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

const SlackIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { slackUrl, removeSlackIntegrationFromProject } = useSlackBot()

	if (action === IntegrationAction.Disconnect) {
		return (
			<Stack gap="12">
				<Text color="moderate">
					Disconnecting your Slack workspace from Highlight will
					require you to reconfigure any alerts you have made!
				</Text>
				<Box display="flex" justifyContent="flex-end" gap="8">
					<Button
						kind="secondary"
						emphasis="medium"
						onClick={() => {
							analytics.track(
								'IntegrationDisconnectCancel-Slack',
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
								'IntegrationDisconnectSave-Slack',
							)
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeSlackIntegrationFromProject(project_id)
						}}
					>
						Disconnect Slack
					</Button>
				</Box>
			</Stack>
		)
	}

	return (
		<Stack gap="12">
			<Text color="moderate">
				Connect Slack to your Highlight workspace to setup alerts and
				tag teammates in comments
			</Text>
			<Box display="flex" justifyContent="flex-end" gap="8">
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track(
							'IntegrationConfigurationCancel-Slack',
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
					as="a"
					href={slackUrl}
					iconLeft={<AppsIcon />}
					onClick={() => {
						analytics.track(
							'IntegrationConfigurationSave-Slack',
						)
					}}
				>
					Connect Highlight with Slack
				</Button>
			</Box>
		</Stack>
	)
}

export default SlackIntegrationConfig
