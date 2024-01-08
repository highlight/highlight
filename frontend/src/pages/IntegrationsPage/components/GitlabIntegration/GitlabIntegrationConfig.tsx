import Button from '@components/Button/Button/Button'
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
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

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
		<>
			<p className={styles.modalSubTitle}>
				Connect GitLab to your Highlight workspace to create issues from
				comments.
			</p>
			<footer>
				<Button
					trackingId="IntegrationConfigurationCancel-GitLab"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-GitLab"
					className={styles.modalBtn}
					type="primary"
					href={authUrl}
				>
					<AppsIcon className={styles.modalBtnIcon} /> Connect
					Highlight with GitLab
				</Button>
			</footer>
		</>
	)
}

const GitlabIntegrationDisconnect: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled }) => {
	const { removeIntegration } = useGitlabIntegration()

	return (
		<>
			<p className={styles.modalSubTitle}>
				Disconnecting your GitLab from Highlight will prevent you from
				linking issues to future comments
			</p>
			<footer>
				<Button
					trackingId="IntegrationDisconnectCancel-GitLab"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(true)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationDisconnectSave-GitLab"
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
					Disconnect GitLab
				</Button>
			</footer>
		</>
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
