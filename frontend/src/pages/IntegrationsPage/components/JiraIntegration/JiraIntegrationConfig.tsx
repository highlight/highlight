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
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

import styles from './JiraIntegrationConfig.module.css'

const JiraIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { removeJiraIntegrationFromProject } = useJiraIntegration()
	const authUrl = useMemo(() => getJiraOAuthUrl(project_id!), [project_id])
	if (action === IntegrationAction.Disconnect) {
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
							removeJiraIntegrationFromProject(project_id)
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disconnect Jira
					</Button>
				</footer>
			</>
		)
	}

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

export default JiraIntegrationConfig
