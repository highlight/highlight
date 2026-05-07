import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	getGitHubInstallationOAuthUrl,
	useGitHubIntegration,
} from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { analytics } from '@util/analytics'
import React, { useMemo } from 'react'

const GitHubIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { projectId } = useProjectId()
	const { currentWorkspace } = useApplicationContext()
	const { removeIntegration } = useGitHubIntegration()
	const authUrl = useMemo(
		() =>
			getGitHubInstallationOAuthUrl(
				projectId!,
				currentWorkspace?.id || '',
			),
		[currentWorkspace?.id, projectId],
	)
	if (action === IntegrationAction.Disconnect) {
		return (
			<Stack gap="12">
				<Box paddingY="8">
					<Text color="moderate">
						Disconnecting your GitHub workspace from Highlight will
						prevent you from linking issues to future comments and
						your stacktraces will not be enhanced.
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
								'IntegrationDisconnectCancel-GitHub',
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
								'IntegrationDisconnectSave-GitHub',
							)
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeIntegration()
						}}
					>
						Disconnect GitHub
					</Button>
				</Box>
			</Stack>
		)
	}

	return (
		<Stack gap="12">
			<Box paddingY="8">
				<Text color="moderate">
					Connect GitHub to your Highlight workspace to enhance
					stacktraces and create issues from comments.
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
							'IntegrationConfigurationCancel-GitHub',
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
					href={authUrl}
					iconLeft={<AppsIcon />}
					onClick={() => {
						analytics.track(
							'IntegrationConfigurationSave-GitHub',
						)
					}}
				>
					Connect Highlight with GitHub
				</Button>
			</Box>
		</Stack>
	)
}

export default GitHubIntegrationConfig
