import { Button } from '@components/Button'
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
						kind="danger"
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
				<a href={microsoftTeamsAuthUrl}>
					<Button
						trackingId="IntegrationConfigurationSave-MicrosoftTeams"
						className={styles.modalBtn}
					>
						<AppsIcon className={styles.modalBtnIcon} /> Connect
						Highlight with Microsoft Teams
					</Button>
				</a>
			</footer>
		</>
	)
}

export default MicrosoftTeamsIntegrationConfig
