import Button from '@components/Button/Button/Button'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import React from 'react'

import styles from './MicrosoftTeamsIntegrationConfig.module.css'
import { useMicrosoftTeamsBot } from './utils'
import ProjectSelection, {
	useIntergationProjectConfig,
} from '../common/ProjectSelection'
import { Box } from '@highlight-run/ui/components'

const MicrosoftTeamsIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action, isV2 }) => {
	const { options, selectedProject, setSelectedProject } =
		useIntergationProjectConfig()
	const { value: project_id } = selectedProject
	const {
		microsoftTeamsAuthUrl,
		removeMicrosoftTeamsIntegrationFromProject,
	} = useMicrosoftTeamsBot(null, project_id)

	if (action === IntegrationAction.Disconnect) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting your Microsoft Teams workspace from Highlight
					will require you to reconfigure any alerts you have made!
				</p>
				<footer>
					<Button
						trackingId="IntegrationDisconnectCancel-MicrosoftTeams"
						className={styles.modalBtn}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-MicrosoftTeams"
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeMicrosoftTeamsIntegrationFromProject(
								project_id,
							)
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disconnect Microsoft Teams
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
					{!isV2
						? 'Connect Microsoft Teams to your Highlight workspace to setup alerts and tag teammates in comments'
						: 'Configure Microsoft Teams workspace'}
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
							trackingId="IntegrationConfigurationCancel-MicrosoftTeams"
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
						trackingId="IntegrationConfigurationSave-MicrosoftTeams"
						className={styles.modalBtn}
						type="primary"
						href={microsoftTeamsAuthUrl}
					>
						<AppsIcon className={styles.modalBtnIcon} /> Connect
						Highlight with Microsoft Teams
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

export default MicrosoftTeamsIntegrationConfig
