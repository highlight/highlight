import Button from '@components/Button/Button/Button'
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
import React, { useMemo } from 'react'

import styles from './GitHubIntegrationConfig.module.css'
import { Box } from '@highlight-run/ui/components'
import ProjectSelection, {
	useIntergationProjectConfig,
} from '../common/ProjectSelection'
const GitHubIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action, isV2 }) => {
	const { options, selectedProject, setSelectedProject, currentWorkspace } =
		useIntergationProjectConfig()

	const { removeIntegration } = useGitHubIntegration()
	const authUrl = useMemo(
		() =>
			getGitHubInstallationOAuthUrl(
				selectedProject.value!,
				currentWorkspace?.id || '',
			),
		[selectedProject, currentWorkspace?.id],
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
			<Box
				cssClass={`${isV2 ? 'flex justify-between items-center' : ''}`}
			>
				<p className={styles.modalSubTitle}>
					{isV2
						? 'Connect GitHub to your Highlight workspace to enhance stacktraces and create issues from comments.'
						: 'Configure Github Integration'}
				</p>
				{!isV2 && (
					<ProjectSelection
						options={options}
						selectedProject={selectedProject}
						setSelectedProject={setSelectedProject}
					/>
				)}
				<footer>
					{!isV2 && (
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
					)}
					<Button
						trackingId="IntegrationConfigurationSave-GitHub"
						className={styles.modalBtn}
						type="primary"
						disabled={!selectedProject}
						href={authUrl}
					>
						<AppsIcon className={styles.modalBtnIcon} /> Connect
						Highlight with GitHub
					</Button>
				</footer>
			</Box>
			{isV2 && (
				<ProjectSelection
					options={options}
					selectedProject={selectedProject}
					setSelectedProject={setSelectedProject}
				/>
			)}
		</>
	)
}

export default GitHubIntegrationConfig
