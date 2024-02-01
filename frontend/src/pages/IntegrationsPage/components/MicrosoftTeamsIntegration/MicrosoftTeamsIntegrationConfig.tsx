import Button from '@components/Button/Button/Button'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import styles from './MicrosoftTeamsIntegrationConfig.module.css'
import { useMicrosoftTeamsBot } from './utils'

const MicrosoftTeamsIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const {
		microsoftTeamsAuthUrl,
		removeMicrosoftTeamsIntegrationFromProject,
	} = useMicrosoftTeamsBot()

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
			<p className={styles.modalSubTitle}>
				Connect Microsoft Teams to your Highlight workspace to setup
				alerts and tag teammates in comments
			</p>
			<footer>
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
		</>
	)
}

export default MicrosoftTeamsIntegrationConfig
