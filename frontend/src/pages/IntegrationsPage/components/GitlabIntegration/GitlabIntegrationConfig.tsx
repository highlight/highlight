import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	getGitlabOAuthUrl,
	useGitlabIntegration,
} from '@pages/IntegrationsPage/components/GitlabIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

const GitlabIntegrationSetup: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
}) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { currentWorkspace } = useApplicationContext()
	const authUrl = useMemo(
		() => getGitlabOAuthUrl(project_id!, currentWorkspace?.id || ''),
		[project_id, currentWorkspace],
	)

	return (
		<Stack gap="12">
			<Box py="8">
				<Text color="moderate">
					Connect GitLab to your Highlight workspace to create issues
					from comments.
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
						analytics.track('IntegrationConfigurationCancel-GitLab')
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
						analytics.track('IntegrationConfigurationSave-GitLab')
					window.open(authUrl, '_blank')
					}}
				>
					Connect Highlight with GitLab
				</Button>
			</Box>
		</Stack>
	)
}

const GitlabIntegrationDisconnect: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled }) => {
	const { removeIntegration } = useGitlabIntegration()

	return (
		<Stack gap="12">
			<Box py="8">
				<Text color="moderate">
					Disconnecting your GitLab from Highlight will prevent you
					from linking issues to future comments
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
						analytics.track('IntegrationDisconnectCancel-GitLab')
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
						analytics.track('IntegrationDisconnectSave-GitLab')
						setModalOpen(false)
						setIntegrationEnabled(false)
						removeIntegration()
					}}
				>
					Disconnect GitLab
				</Button>
			</Box>
		</Stack>
	)
}

const GitlabIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	action,
}) => {
	switch (action) {
		case IntegrationAction.Setup:
			return (
				<GitlabIntegrationSetup
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		case IntegrationAction.Disconnect:
			return (
				<GitlabIntegrationDisconnect
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
				/>
			)
		default:
			throw new Error('Unknown integration action')
	}
}

export default GitlabIntegrationConfig

