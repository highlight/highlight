import { toast } from '@components/Toaster'
import { PlanType } from '@graph/schemas'
import {
	Box,
	IconSolidLogout,
	IconSolidSparkles,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'

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
			<Stack gap="16" cssClass={styles.container}>
				<Text color="moderate" size="small">
					Disabling Clearbit will mean new sessions will not have
					enhanced metadata about identified users.
				</Text>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="flex-end"
					gap="8"
				>
					<Button
						trackingId="IntegrationDisconnectCancel-Clearbit"
						kind="secondary"
						size="medium"
						emphasis="medium"
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-Clearbit"
						kind="danger"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLogout />}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							modifyClearbit({ enabled: false })
						}}
					>
						Disable Clearbit
					</Button>
				</Box>
			</Stack>
		)
	}

	if (redirectToBilling) {
		return <Navigate replace to={`/w/${workspaceID}/current-plan`} />
	}

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Enable Clearbit to scrape enhanced user details.
			</Text>
			<Text color="moderate" size="small">
				After a user is identified, we will collect information about
				their online presence using Clearbit and display it in the
				session metadata pane.
			</Text>
			{mustUpgradeToIntegrate ? (
				<>
					<Text color="moderate" size="small">
						To enable Clearbit integration, please upgrade your
						workspace tier to <b>'{PlanType.Startup}'</b> or higher.
					</Text>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="flex-end"
						gap="8"
					>
						<Button
							trackingId="IntegrationConfigurationCancelUpgrade-Clearbit"
							kind="secondary"
							size="medium"
							emphasis="medium"
							onClick={() => {
								setModalOpen(false)
								setIntegrationEnabled(false)
							}}
						>
							Cancel
						</Button>
						<Button
							trackingId="IntegrationConfigurationViewUpgrade-Clearbit"
							kind="primary"
							size="medium"
							emphasis="high"
							onClick={() => {
								navigate(`/${projectID}/integrations`)
								setRedirectToBilling(true)
							}}
						>
							View upgrade options
						</Button>
					</Box>
				</>
			) : (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="flex-end"
					gap="8"
				>
					<Button
						trackingId="IntegrationConfigurationCancel-Clearbit"
						kind="secondary"
						size="medium"
						emphasis="medium"
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationConfigurationSave-Clearbit"
						kind="primary"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidSparkles />}
						onClick={() => {
							modifyClearbit({ enabled: true })
						}}
					>
						Enable Clearbit
					</Button>
				</Box>
			)}
		</Stack>
	)
}

export default ClearbitIntegrationConfig
