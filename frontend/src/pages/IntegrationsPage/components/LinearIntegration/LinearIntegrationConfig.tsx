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
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

import styles from './LinearIntegrationConfig.module.scss'

const LinearIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { removeLinearIntegrationFromProject } = useLinearIntegration()
	const authUrl = useMemo(() => getLinearOAuthUrl(project_id!), [project_id])
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
							removeLinearIntegrationFromProject(project_id)
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
			<p className={styles.modalSubTitle}>
				Connect Linear to your Highlight workspace to create issues from
				comments.
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
					href={authUrl}
				>
					<AppsIcon className={styles.modalBtnIcon} /> Connect
					Highlight with Linear
				</Button>
			</footer>
		</>
	)
}

export default LinearIntegrationConfig
