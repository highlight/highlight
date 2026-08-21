import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import {
	getJiraOAuthUrl,
	useJiraIntegration,
} from '@pages/IntegrationsPage/components/JiraIntegration/utils'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

const JiraIntegrationSetup: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { currentWorkspace } = useApplicationContext()
	const authUrl = useMemo(
		() => getJiraOAuthUrl(project_id!, currentWorkspace?.id || ''),
		[project_id, currentWorkspace],
	)

	return (
		<Stack gap="12">
			<Text color="moderate">
				Connect Jira to your Highlight workspace to create issues from
				comments.
			</Text>
			<Box display="flex" justifyContent="flex-end" gap="8">
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationConfigurationCancel-Jira')
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					emphasis="high"
					iconLeft={<AppsIcon />}
					onClick={() => {
						analytics.track('IntegrationConfigurationSave-Jira')
					window.open(authUrl, '_blank')
					}}
				>
					Connect Highlight with Jira
				</Button>
			</Box>
		</Stack>
	)
}

const JiraIntegrationDisconnect: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled }) => {
	const { removeIntegration } = useJiraIntegration()

	return (
		<Stack gap="12">
			<Text color="moderate">
				Disconnecting your Jira from Highlight will prevent you from
				linking issues to future comments
			</Text>
			<Box display="flex" justifyContent="flex-end" gap="8">
				<Button
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						analytics.track('IntegrationDisconnectCancel-Jira')
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
						analytics.track('IntegrationDisconnectSave-Jira')
						setModalOpen(false)
						setIntegrationEnabled(false)
						removeIntegration()
					}}
				>
					Disconnect Jira
				</Button>
			</Box>
		</Stack>
	)
}

const JiraIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	action,
}) => {
	switch (action) {
		case IntegrationAction.Setup:
			return (
				<JiraIntegrationSetup
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Disconnect:
			return (
				<JiraIntegrationDisconnect
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		default:
			throw new Error('Unknown integration action')
	}
}

export default JiraIntegrationConfig
