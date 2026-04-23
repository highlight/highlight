import { toast } from '@components/Toaster'
import {
	Box,
	IconSolidLightningBolt,
	IconSolidLogout,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils'
import React, { useEffect } from 'react'
import { coy as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism'

import { Button } from '@/components/Button'
import { CodeBlock } from '@/pages/Connect/CodeBlock'

import styles from './ZapierIntegrationConfig.module.css'

const ZapierIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled, action }) => {
	const {
		generatedJwtToken,
		removeZapierIntegrationFromProject,
		isZapierIntegratedWithProject,
	} = useZapierIntegration()

	useEffect(() => {
		if (isZapierIntegratedWithProject) {
			setIntegrationEnabled(true)
			setModalOpen(false)
			toast.success('Zapier integration enabled')
		}
	}, [isZapierIntegratedWithProject, setIntegrationEnabled, setModalOpen])

	if (action === IntegrationAction.Disconnect) {
		return (
			<Stack gap="16" cssClass={styles.container}>
				<Text color="moderate" size="small">
					Disconnecting Zapier from Highlight will cause your Zaps to
					stop working.
				</Text>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="flex-end"
					gap="8"
				>
					<Button
						trackingId="IntegrationDisconnectCancel-Zapier"
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
						trackingId="IntegrationDisconnectSave-Zapier"
						kind="danger"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLogout />}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeZapierIntegrationFromProject()
						}}
					>
						Disconnect Zapier
					</Button>
				</Box>
			</Stack>
		)
	}

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Connect Highlight with Zapier to use alerts as triggers for your
				Zaps.
			</Text>
			<Text color="moderate" size="small">
				In order to connect, you&apos;ll need to create a Zap in Zapier
				and, when prompted, enter the access token from the textbox
				below.
			</Text>
			<CodeBlock
				style={lightTheme}
				showLineNumbers={false}
				text={generatedJwtToken || ' '}
				language="text"
				numberOfLines={2}
			/>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationConfigurationCancel-Zapier"
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
					trackingId="IntegrationConfigurationSave-Zapier"
					kind="primary"
					size="medium"
					emphasis="high"
					iconLeft={<IconSolidLightningBolt />}
					onClick={() => {
						window.open(
							'https://zapier.com/app/zaps',
							'_blank',
							'noreferrer',
						)
					}}
				>
					Create a Zap
				</Button>
			</Box>
		</Stack>
	)
}

export default ZapierIntegrationConfig
