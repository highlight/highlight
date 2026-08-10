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
						trackingId="Button-IntegrationDisconnectCancel-MicrosoftTeams"
						className={styles.modalBtn}
						kind="secondary"
						emphasis="medium"
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="Button-IntegrationDisconnectSave-MicrosoftTeams"
						className={styles.modalBtn}
						kind="danger"
						iconLeft={<PlugIcon />}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeMicrosoftTeamsIntegrationFromProject(
								project_id,
							)
						}}
					>
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
					trackingId="Button-IntegrationConfigurationCancel-MicrosoftTeams"
					className={styles.modalBtn}
					kind="secondary"
					emphasis="medium"
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="Button-IntegrationConfigurationSave-MicrosoftTeams"
					className={styles.modalBtn}
					kind="primary"
					emphasis="high"
					iconLeft={<AppsIcon />}
					href={microsoftTeamsAuthUrl}
				>
					Connect Highlight with Microsoft Teams
				</Button>
			</footer>
		</>
	)
}

export default MicrosoftTeamsIntegrationConfig
