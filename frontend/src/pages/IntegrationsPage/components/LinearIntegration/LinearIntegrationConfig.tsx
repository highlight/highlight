import {
	Box,
	IconSolidLinear,
	IconSolidLogout,
	Stack,
	Text,
} from '@highlight-run/ui/components'
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

import { Button } from '@/components/Button'

import styles from './LinearIntegrationConfig.module.css'

const LinearIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { removeLinearIntegrationFromProject } = useLinearIntegration()
	const authUrl = useMemo(() => getLinearOAuthUrl(project_id!), [project_id])

	const isDisconnect = action === IntegrationAction.Disconnect

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				{isDisconnect
					? 'Disconnecting your Linear workspace from Highlight will prevent you from linking issues to future comments.'
					: 'Connect Linear to your Highlight workspace to create issues from comments.'}
			</Text>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId={
						isDisconnect
							? 'IntegrationDisconnectCancel-Linear'
							: 'IntegrationConfigurationCancel-Linear'
					}
					kind="secondary"
					size="medium"
					emphasis="medium"
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(isDisconnect)
					}}
				>
					Cancel
				</Button>
				{isDisconnect ? (
					<Button
						trackingId="IntegrationDisconnectSave-Linear"
						kind="danger"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLogout />}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeLinearIntegrationFromProject(project_id)
						}}
					>
						Disconnect Linear
					</Button>
				) : (
					<Button
						trackingId="IntegrationConfigurationSave-Linear"
						kind="primary"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLinear />}
						onClick={() => {
							window.location.assign(authUrl)
						}}
					>
						Connect with Linear
					</Button>
				)}
			</Box>
		</Stack>
	)
}

export default LinearIntegrationConfig
