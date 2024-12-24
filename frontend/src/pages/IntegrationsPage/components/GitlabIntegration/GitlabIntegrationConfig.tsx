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
// import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

import styles from './GitlabIntegrationConfig.module.css'
import { Box } from '@highlight-run/ui/components'
import ProjectSelection, {
	useIntergationProjectConfig,
} from '../common/ProjectSelection'
import { useParams } from '@/util/react-router/useParams'

const GitlabIntegrationSetup: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	isV2,
}) => {
	const { workspace_id } = useParams<{ workspace_id: string }>()

	const { options, selectedProject, setSelectedProject } =
		useIntergationProjectConfig()

	const authUrl = useMemo(
		() => getGitlabOAuthUrl(selectedProject.value!, workspace_id!),
		[selectedProject, workspace_id],
	)

	return (
		<>
			<Box
				cssClass={`${isV2 ? 'flex justify-between items-center' : ''}`}
			>
				<p className={styles.modalSubTitle}>
					{!isV2
						? 'Connect GitLab to your Highlight workspace to create issues from comments.'
						: 'Configure Gitlab Intergation'}
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
							trackingId="IntegrationConfigurationCancel-GitLab"
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
						trackingId="IntegrationConfigurationSave-GitLab"
						className={styles.modalBtn}
						type="primary"
						href={authUrl}
					>
						<AppsIcon className={styles.modalBtnIcon} /> Connect
						Highlight with GitLab
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

const GitlabIntegrationDisconnect: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, isV2 }) => {
	const { removeIntegration } = useGitlabIntegration()

	return (
		<Box cssClass={`${isV2 ? 'flex justify-between' : ''}`}>
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
		</Box>
	)
}

const GitlabIntegrationConfig: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	action,
	isV2,
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
		case IntegrationAction.Settings:
			return (
				<GitlabIntegrationSetup
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={IntegrationAction.Setup}
					isV2={isV2}
				/>
			)
		default:
			throw new Error('Unknown integration action')
	}
}

export default GitlabIntegrationConfig
