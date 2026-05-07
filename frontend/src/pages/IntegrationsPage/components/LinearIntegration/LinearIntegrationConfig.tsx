import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
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
import { analytics } from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React, { useMemo } from 'react'

const LinearIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { removeLinearIntegrationFromProject } = useLinearIntegration()
	const authUrl = useMemo(() => getLinearOAuthUrl(project_id!), [project_id])
	if (action === IntegrationAction.Disconnect) {
		return (
			<Stack gap="12">
				<Box paddingY="8">
					<Text color="moderate">
						Disconnecting your Linear workspace from Highlight will
						prevent you from linking issues to future comments
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
							analytics.track('IntegrationDisconnectCancel-Linear')
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
							analytics.track('IntegrationDisconnectSave-Linear')
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeLinearIntegrationFromProject(project_id)
						}}
					>
						Disconnect Linear
					</Button>
				</Box>
			</Stack>
		)
	}

	return (
		<Stack gap="12">
			<Box paddingY="8">
				<Text color="moderate">
					Connect Linear to your Highlight workspace to create issues
					from comments.
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
						analytics.track('IntegrationConfigurationCancel-Linear')
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					emphasis="high"
					href={authUrl}
					as="a"
					iconLeft={<AppsIcon />}
					onClick={() => {
						analytics.track('IntegrationConfigurationSave-Linear')
					}}
				>
					Connect Highlight with Linear
				</Button>
			</Box>
		</Stack>
	)
}


export default LinearIntegrationConfig

