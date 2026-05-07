import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import { toast } from '@components/Toaster'
import { PlanType } from '@graph/schemas'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import { useClearbitIntegration } from '@pages/IntegrationsPage/components/ClearbitIntegration/utils'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import analytics from '@util/analytics'
import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

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
			<Stack gap="12">
				<Box py="8">
					<Text color="moderate">
						Disabling Clearbit will mean new sessions will not have
						enhanced metadata about identified users.
					</Text>
				</Box>
				<Box
					display="flex"
					justifyContent="flex-end"
					gap="8"
					paddingTop="16"
					borderTop="secondary"
				>
					<Button
						kind="secondary"
						emphasis="medium"
						onClick={() => {
							analytics.track('IntegrationDisconnectCancel-Clearbit')
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						kind="danger"
						emphasis="high"
						iconLeft={<PlugIcon />}
						onClick={() => {
							analytics.track('IntegrationDisconnectSave-Clearbit')
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
		<Stack gap="12">
			<Box py="8">
				<Stack gap="8">
					<Text color="moderate">
						Enable Clearbit to scrape enhanced user details.
					</Text>
					<Text color="moderate">
						After a user is identified, we will collect information
						about their online presence using Clearbit and display
						it in the session metadata pane.
					</Text>
				</Stack>
			</Box>
			{mustUpgradeToIntegrate ? (
				<>
					<Box py="4">
						<Text color="moderate">
							To enable Clearbit integration, please upgrade your
							workspace tier to <b>'{PlanType.Startup}'</b> or
							higher.
						</Text>
					</Box>
					<Box
						display="flex"
						justifyContent="flex-end"
						gap="8"
						paddingTop="16"
						borderTop="secondary"
					>
						<Button
							kind="secondary"
							emphasis="medium"
							onClick={() => {
								analytics.track(
									'IntegrationConfigurationCancelUpgrade-Clearbit',
								)
								setModalOpen(false)
								setIntegrationEnabled(false)
							}}
						>
							Cancel
						</Button>
						<Button
							kind="primary"
							emphasis="high"
							onClick={() => {
								analytics.track(
									'IntegrationConfigurationViewUpgrade-Clearbit',
								)
								navigate(`/${projectID}/integrations`)
								setRedirectToBilling(true)
							}}
						>
							View Upgrade Options
						</Button>
					</Box>
				</>
			) : (
				<Box
					display="flex"
					justifyContent="flex-end"
					gap="8"
					paddingTop="16"
					borderTop="secondary"
				>
					<Button
						kind="secondary"
						emphasis="medium"
						onClick={() => {
							analytics.track(
								'IntegrationConfigurationCancel-Clearbit',
							)
							setModalOpen(false)
							setIntegrationEnabled(false)
						}}
					>
						Cancel
					</Button>
					<Button
						kind="primary"
						emphasis="high"
						iconLeft={<Sparkles2Icon />}
						onClick={() => {
							analytics.track(
								'IntegrationConfigurationSave-Clearbit',
							)
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


