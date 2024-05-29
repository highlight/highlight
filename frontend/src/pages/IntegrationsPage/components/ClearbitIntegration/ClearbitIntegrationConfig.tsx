import Button from '@components/Button/Button/Button'
import { toast } from '@components/Toaster'
import { PlanType } from '@graph/schemas'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import styles from './ClearbitIntegrationConfig.module.css'

const ClearbitIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled, action }) => {
	const [redirectToBilling, setRedirectToBilling] = React.useState(false)
	const {
		isClearbitIntegratedWithWorkspace,
		mustUpgradeToIntegrate,
		projectID,
		workspaceID,
		modifyClearbit,
	} = useClearbitIntegration()
	const navigate = useNavigate()

	useEffect(() => {
		if (
			isClearbitIntegratedWithWorkspace &&
			action === IntegrationAction.Setup
		) {
			setIntegrationEnabled(true)
			setModalOpen(false)
			toast.success('Clearbit integration enabled')
		}
	}, [
		isClearbitIntegratedWithWorkspace,
		setIntegrationEnabled,
		setModalOpen,
		action,
	])

	if (action === IntegrationAction.Disconnect) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disabling Clearbit will mean new sessions will not have
					enhanced metadata about identified users.
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
							modifyClearbit({ enabled: false })
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disable Clearbit
					</Button>
				</footer>
			</>
		)
	}
	if (redirectToBilling) {
		return <Navigate replace to={`/w/${workspaceID}/current-plan`} />
	}

	return (
		<>
			<p className={styles.modalSubTitle}>
				Enable Clearbit to scrape enhanced user details.
			</p>
			<p className={styles.modalSubTitle}>
				After a user is identified, we will collect information about
				their online presence using Clearbit and display it in the
				session metadata pane.
			</p>
			{mustUpgradeToIntegrate ? (
				<>
					<p className={styles.modalSubTitle}>
						To enable Clearbit integration, please upgrade your
						workspace tier to <b>'{PlanType.Startup}'</b> or higher.
					</p>
					<footer>
						<Button
							trackingId="IntegrationConfigurationCancelUpgrade-Clearbit"
							className={styles.modalBtn}
							onClick={() => {
								setModalOpen(false)
								setIntegrationEnabled(false)
							}}
						>
							Cancel
						</Button>
						<Button
							trackingId="IntegrationConfigurationViewUpgrade-Clearbit"
							className={styles.modalBtn}
							type="primary"
							onClick={() => {
								navigate(`/${projectID}/integrations`)
								setRedirectToBilling(true)
							}}
						>
							View Upgrade Options
						</Button>
					</footer>
				</>
			) : (
				<footer>
					<Button
						trackingId="IntegrationConfigurationCancel-Clearbit"
						className={styles.modalBtn}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationConfigurationSave-Clearbit"
						className={styles.modalBtn}
						type="primary"
						onClick={() => {
							modifyClearbit({ enabled: true })
						}}
					>
						<Sparkles2Icon className={styles.modalBtnIcon} /> Enable
						Clearbit
					</Button>
				</footer>
			)}
		</>
	)
}

export default ClearbitIntegrationConfig
