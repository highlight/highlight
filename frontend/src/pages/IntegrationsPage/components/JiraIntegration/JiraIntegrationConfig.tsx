import {
	Box,
	IconSolidJira,
	IconSolidLogout,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import {
	getJiraOAuthUrl,
	useJiraIntegration,
} from '@pages/IntegrationsPage/components/JiraIntegration/utils'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

import { Button } from '@/components/Button'

import styles from './JiraIntegrationConfig.module.css'

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
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Connect Jira to your Highlight workspace to create issues from
				comments.
			</Text>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationConfigurationCancel-Jira"
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
					trackingId="IntegrationConfigurationSave-Jira"
					kind="primary"
					size="medium"
					emphasis="high"
					iconLeft={<IconSolidJira />}
					onClick={() => {
						window.location.assign(authUrl)
					}}
				>
					Connect with Jira
				</Button>
			</Box>
		</Stack>
	)
}

const JiraIntegrationDisconnect: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled }) => {
	const { removeIntegration } = useJiraIntegration()

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Disconnecting Jira from Highlight will prevent you from linking
				issues to future comments.
			</Text>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationDisconnectCancel-Jira"
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
					trackingId="IntegrationDisconnectSave-Jira"
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
