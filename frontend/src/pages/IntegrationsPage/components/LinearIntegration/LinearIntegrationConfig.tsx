import Button from '@components/Button/Button/Button'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import {
	getLinearOAuthUrl,
	useLinearIntegration,
} from '@pages/IntegrationsPage/components/LinearIntegration/utils'
import React, { useMemo } from 'react'

import styles from './LinearIntegrationConfig.module.css'
import ProjectSelection, {
	useIntergationProjectConfig,
} from '../common/ProjectSelection'
import { Box } from '@highlight-run/ui/components'
import { useParams } from '@/util/react-router/useParams'

const LinearIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action, isV2 }) => {
	const { workspace_id } = useParams<{ workspace_id: string }>()
	const { options, selectedProject, setSelectedProject } =
		useIntergationProjectConfig()
	const { removeLinearIntegrationFromProject } = useLinearIntegration(
		selectedProject.value!,
	)
	const authUrl = useMemo(
		() => getLinearOAuthUrl(selectedProject.value!, workspace_id!),
		[selectedProject, workspace_id],
	)
	if (action === IntegrationAction.Disconnect) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting your Linear workspace from Highlight will
					prevent you from linking issues to future comments
				</p>
				<footer>
					<Button
						trackingId="IntegrationDisconnectCancel-Slack"
						className={styles.modalBtn}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-Slack"
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeLinearIntegrationFromProject(
								selectedProject.value,
							)
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disconnect Linear
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
						? 'Connect Linear to your Highlight workspace to create issues from comments.'
						: 'Configure Linear Intergation'}
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
							trackingId="IntegrationConfigurationCancel-Slack"
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
						trackingId="IntegrationConfigurationSave-Slack"
						className={styles.modalBtn}
						type="primary"
						href={authUrl}
					>
						<AppsIcon className={styles.modalBtnIcon} /> Connect
						Highlight with Linear
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

export default LinearIntegrationConfig
