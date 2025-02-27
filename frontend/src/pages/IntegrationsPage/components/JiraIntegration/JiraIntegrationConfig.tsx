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
import React, { useMemo } from 'react'

import styles from './JiraIntegrationConfig.module.css'
import ProjectSelection, {
	useIntergationProjectConfig,
} from '../common/ProjectSelection'
import { Box } from '@highlight-run/ui/components'

const JiraIntegrationSetup: React.FC<IntegrationConfigProps> = ({
	setModalOpen,
	setIntegrationEnabled,
	isV2,
}) => {
	const { currentWorkspace, selectedProject, options, setSelectedProject } =
		useIntergationProjectConfig()
	const authUrl = useMemo(
		() =>
			getJiraOAuthUrl(selectedProject.value!, currentWorkspace?.id || ''),
		[selectedProject, currentWorkspace],
	)

	return (
		<>
			<Box
				cssClass={`${isV2 ? 'flex justify-between items-center' : ''}`}
			>
				<p className={styles.modalSubTitle}>
					{!isV2
						? 'Connect Jira to your Highlight workspace to create issues from comments.'
						: 'Configure Jira Integration'}
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
							trackingId="IntegrationConfigurationCancel-Jira"
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
						trackingId="IntegrationConfigurationSave-Jira"
						className={styles.modalBtn}
						type="primary"
						href={authUrl}
					>
						<AppsIcon className={styles.modalBtnIcon} /> Connect
						Highlight with Jira
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
	isV2,
}) => {
	switch (action) {
		case IntegrationAction.Setup:
			return (
				<JiraIntegrationSetup
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
					isV2={isV2}
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
		case IntegrationAction.Settings:
			return (
				<JiraIntegrationSetup
					setModalOpen={setModalOpen}
					setIntegrationEnabled={setIntegrationEnabled}
					action={action}
					isV2={isV2}
				/>
			)
		default:
			throw new Error('Unknown integration action')
	}
}

export default JiraIntegrationConfig
