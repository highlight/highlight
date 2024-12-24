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
import ProjectSelection, {
	useIntergationProjectConfig,
} from '../common/ProjectSelection'
import { Box, Stack } from '@highlight-run/ui/components'

const ClearbitIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled, action, isV2 }) => {
	const [redirectToBilling, setRedirectToBilling] = React.useState(false)
	const { selectedProject, options, setSelectedProject } =
		useIntergationProjectConfig()
	const {
		isClearbitIntegratedWithWorkspace,
		mustUpgradeToIntegrate,
		workspaceID,
		modifyClearbit,
	} = useClearbitIntegration(selectedProject.value)
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
			<Box
				cssClass={`${isV2 ? 'flex justify-between items-center' : ''}`}
			>
				<Stack cssClass="max-w-[650px]">
					<p className={styles.modalSubTitle}>
						Enable Clearbit to scrape enhanced user details.
					</p>
					<p className={styles.modalSubTitle}>
						After a user is identified, we will collect information
						about their online presence using Clearbit and display
						it in the session metadata pane.
					</p>
					{mustUpgradeToIntegrate && (
						<p className={styles.modalSubTitle}>
							To enable Clearbit integration, please upgrade your
							workspace tier to <b>'{PlanType.Startup}'</b> or
							higher.
						</p>
					)}
				</Stack>
				{!isV2 && (
					<ProjectSelection
						options={options}
						selectedProject={selectedProject}
						setSelectedProject={setSelectedProject}
					/>
				)}
				{mustUpgradeToIntegrate ? (
					<>
						<footer className={`${isV2 ? 'self-start' : ''}`}>
							{!isV2 && (
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
							)}
							<Button
								trackingId="IntegrationConfigurationViewUpgrade-Clearbit"
								className={styles.modalBtn}
								type="primary"
								onClick={() => {
									navigate(
										`/w/${selectedProject.value}/integrations`,
									)
									setRedirectToBilling(true)
								}}
							>
								View Upgrade Options
							</Button>
						</footer>
					</>
				) : (
					<footer className={`${isV2 ? 'self-start' : ''}`}>
						{!isV2 && (
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
						)}
						<Button
							trackingId="IntegrationConfigurationSave-Clearbit"
							className={styles.modalBtn}
							type="primary"
							onClick={() => {
								modifyClearbit({ enabled: true })
							}}
						>
							<Sparkles2Icon className={styles.modalBtnIcon} />{' '}
							Enable Clearbit
						</Button>
					</footer>
				)}
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

export default ClearbitIntegrationConfig
