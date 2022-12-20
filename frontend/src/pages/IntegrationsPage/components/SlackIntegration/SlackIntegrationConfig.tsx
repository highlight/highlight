import Button from '@components/Button/Button/Button'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import styles from './SlackIntegrationConfig.module.scss'

const SlackIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { slackUrl, removeSlackIntegrationFromProject } = useSlackBot()

	if (action === IntegrationAction.Disconnect) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting your Slack workspace from Highlight will
					require you to reconfigure any alerts you have made!
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
							removeSlackIntegrationFromProject(project_id)
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disconnect Slack
					</Button>
				</footer>
			</>
		)
	}

	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect Slack to your Highlight workspace to setup alerts and
				tag teammates in comments
			</p>
			<footer>
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
				<Button
					trackingId="IntegrationConfigurationSave-Slack"
					className={styles.modalBtn}
					type="primary"
					href={slackUrl}
				>
					<AppsIcon className={styles.modalBtnIcon} /> Connect
					Highlight with Slack
				</Button>
			</footer>
		</>
	)
}

export default SlackIntegrationConfig
