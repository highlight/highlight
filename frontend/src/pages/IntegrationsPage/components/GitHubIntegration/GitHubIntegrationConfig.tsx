import Button from '@components/Button/Button/Button'
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
import React, { useMemo } from 'react'

import styles from './GitHubIntegrationConfig.module.css'

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
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting your GitHub workspace from Highlight will
					prevent you from linking issues to future comments and your
					stacktraces will not be enhanced.
				</p>
				<footer>
					<Button
						trackingId="IntegrationDisconnectCancel-GitHub"
						className={styles.modalBtn}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-GitHub"
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
						Disconnect GitHub
					</Button>
				</footer>
			</>
		)
	}

	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect GitHub to your Highlight workspace to enhance
				stacktraces and create issues from comments.
			</p>
			<footer>
				<Button
					trackingId="IntegrationConfigurationCancel-GitHub"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-GitHub"
					className={styles.modalBtn}
					type="primary"
					href={authUrl}
				>
					<AppsIcon className={styles.modalBtnIcon} /> Connect
					Highlight with GitHub
				</Button>
			</footer>
		</>
	)
}

export default GitHubIntegrationConfig
