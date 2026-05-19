import { Button } from '@highlight-run/ui/components'
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
import analytics from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

import styles from './LinearIntegrationConfig.module.css'

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
						kind="secondary"
						className={styles.modalBtn}
						onClick={() => {
							analytics.track('Button-IntegrationDisconnectCancel-Slack')
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						kind="danger"
						className={styles.modalBtn}
						iconLeft={<PlugIcon className={styles.modalBtnIcon} />}
						onClick={() => {
							analytics.track('Button-IntegrationDisconnectSave-Slack')
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeLinearIntegrationFromProject(project_id)
						}}
					>
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
					kind="secondary"
					className={styles.modalBtn}
					onClick={() => {
						analytics.track('Button-IntegrationConfigurationCancel-Slack')
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					className={styles.modalBtn}
					iconLeft={<AppsIcon className={styles.modalBtnIcon} />}
					onClick={() => {
						analytics.track('Button-IntegrationConfigurationSave-Slack')
					}}
					render={<a href={authUrl} />}
				>
					Connect Highlight with Linear
				</Button>
			</footer>
		</>
	)
}

export default LinearIntegrationConfig
