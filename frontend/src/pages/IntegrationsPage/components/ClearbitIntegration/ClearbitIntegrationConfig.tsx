import Button from '@components/Button/Button/Button'
import { PlanType } from '@graph/schemas'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils'
import { IntegrationConfigProps } from '@pages/IntegrationsPage/components/Integration'
import { message } from 'antd'
import React, { useEffect } from 'react'
import { Redirect, useHistory } from 'react-router-dom'

import styles from './ClearbitIntegrationConfig.module.scss'

const ClearbitIntegrationConfig: React.FC<
	React.PropsWithChildren<React.PropsWithChildren<IntegrationConfigProps>>
> = ({ setModelOpen, setIntegrationEnabled, integrationEnabled }) => {
	const [redirectToBilling, setRedirectToBilling] = React.useState(false)
	const {
		isClearbitIntegratedWithWorkspace,
		mustUpgradeToIntegrate,
		projectID,
		workspaceID,
		modifyClearbit,
	} = useClearbitIntegration()
	const history = useHistory()

	useEffect(() => {
		if (isClearbitIntegratedWithWorkspace && !integrationEnabled) {
			setIntegrationEnabled(true)
			setModelOpen(false)
			message.success('Clearbit integration enabled')
		}
	}, [
		isClearbitIntegratedWithWorkspace,
		setIntegrationEnabled,
		setModelOpen,
		integrationEnabled,
	])

	if (integrationEnabled) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disabling Clearbit will mean new sessions will not have
					enhanced metadata about identified users.
				</p>
				<footer>
					<Button
						trackingId={`IntegrationDisconnectCancel-Slack`}
						className={styles.modalBtn}
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId={`IntegrationDisconnectSave-Slack`}
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModelOpen(false)
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
		return <Redirect to={`/w/${workspaceID}/billing`} />
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
							trackingId={`IntegrationConfigurationCancelUpgrade-Clearbit`}
							className={styles.modalBtn}
							onClick={() => {
								setModelOpen(false)
								setIntegrationEnabled(false)
							}}
						>
							Cancel
						</Button>
						<Button
							trackingId={`IntegrationConfigurationViewUpgrade-Clearbit`}
							className={styles.modalBtn}
							type="primary"
							onClick={() => {
								history.push(`/${projectID}/integrations`)
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
						trackingId={`IntegrationConfigurationCancel-Clearbit`}
						className={styles.modalBtn}
						onClick={() => {
							setModelOpen(false)
							setIntegrationEnabled(false)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId={`IntegrationConfigurationSave-Clearbit`}
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
