import {
	Box,
	IconSolidGitlab,
	IconSolidLogout,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import {
	getGitlabOAuthUrl,
	useGitlabIntegration,
} from '@pages/IntegrationsPage/components/GitlabIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

import { Button } from '@/components/Button'

import styles from './GitlabIntegrationConfig.module.css'

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
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Connect GitLab to your Highlight workspace to create issues from
				comments.
			</Text>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationConfigurationCancel-GitLab"
					kind="secondary"
					size="medium"
					emphasis="medium"
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-GitLab"
					kind="primary"
					size="medium"
					emphasis="high"
					iconLeft={<IconSolidGitlab />}
					onClick={() => {
						window.location.assign(authUrl)
					}}
				>
					Connect with GitLab
				</Button>
			</Box>
		</Stack>
	)
}

const GitlabIntegrationDisconnect: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled }) => {
	const { removeIntegration } = useGitlabIntegration()

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Disconnecting GitLab from Highlight will prevent you from
				linking issues to future comments.
			</Text>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationDisconnectCancel-GitLab"
					kind="secondary"
					size="medium"
					emphasis="medium"
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(true)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationDisconnectSave-GitLab"
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
