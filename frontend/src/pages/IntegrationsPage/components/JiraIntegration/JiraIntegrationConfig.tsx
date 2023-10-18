import Button from '@components/Button/Button/Button'
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
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

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
		<>
			<p className={styles.modalSubTitle}>
				Connect Jira to your Highlight workspace to create issues from
				comments.
			</p>
			<footer>
				<Button
					trackingId="IntegrationConfigurationCancel-Jira"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Jira"
					className={styles.modalBtn}
					type="primary"
					href={authUrl}
				>
					<AppsIcon className={styles.modalBtnIcon} /> Connect
					Highlight with Jira
				</Button>
			</footer>
		</>
	)
}

const JiraIntegrationDisconnect: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled }) => {
	const { removeIntegration } = useJiraIntegration()

	return (
		<>
			<p className={styles.modalSubTitle}>
				Disconnecting your Jira from Highlight will prevent you from
				linking issues to future comments
			</p>
			<footer>
				<Button
					trackingId="IntegrationDisconnectCancel-Jira"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(true)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationDisconnectSave-Jira"
					className={styles.modalBtn}
					type="primary"
					danger
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
						removeIntegration()
					}}
				>
					<PlugIcon className={styles.modalBtnIcon} />
					Disconnect Jira
				</Button>
			</footer>
		</>
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
