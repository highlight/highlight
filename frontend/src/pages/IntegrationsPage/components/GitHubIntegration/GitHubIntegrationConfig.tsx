import {
	Box,
	IconSolidGithub,
	IconSolidLogout,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import {
	getGitHubInstallationOAuthUrl,
	useGitHubIntegration,
} from '@pages/IntegrationsPage/components/GitHubIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import React, { useMemo } from 'react'

import { Button } from '@/components/Button'

import styles from './GitHubIntegrationConfig.module.css'

const GitHubIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled, action }) => {
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

	const isDisconnect = action === IntegrationAction.Disconnect

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				{isDisconnect
					? 'Disconnecting GitHub from Highlight will prevent you from linking issues to future comments and your stacktraces will no longer be enhanced.'
					: 'Connect GitHub to your Highlight workspace to enhance stacktraces and create issues from comments.'}
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
							? 'IntegrationDisconnectCancel-GitHub'
							: 'IntegrationConfigurationCancel-GitHub'
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
						trackingId="IntegrationDisconnectSave-GitHub"
						kind="danger"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLogout />}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeIntegration()
						}}
					>
						Disconnect GitHub
					</Button>
				) : (
					<Button
						trackingId="IntegrationConfigurationSave-GitHub"
						kind="primary"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidGithub />}
						onClick={() => {
							window.location.assign(authUrl)
						}}
					>
						Connect with GitHub
					</Button>
				)}
			</Box>
		</Stack>
	)
}

export default GitHubIntegrationConfig
