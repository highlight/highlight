import { Box, Button, Stack, Text } from '@highlight-run/ui/components'
import { toast } from '@components/Toaster'
import PlugIcon from '@icons/PlugIcon'
import Sparkles2Icon from '@icons/Sparkles2Icon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useZapierIntegration } from '@pages/IntegrationsPage/components/ZapierIntegration/utils'
import { CodeBlock } from '@/pages/Connect/CodeBlock'
import { analytics } from '@util/analytics'
import React, { useEffect } from 'react'
import { coy as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism'

const ZapierIntegrationConfig: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
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
			<Stack gap="12">
				<Box paddingY="8">
					<Text color="moderate">
						Disconnecting Zapier from Highlight will cause your
						Zaps to stop working.
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
							analytics.track('IntegrationDisconnectCancel-Zapier')
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
							analytics.track('IntegrationDisconnectSave-Zapier')
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
		<Stack gap="12">
			<Box paddingY="8">
				<Stack gap="8">
					<Text color="moderate">
						Connect Highlight with Zapier to use alerts as triggers
						for your Zaps.
					</Text>
					<Text color="moderate">
						In order to connect, you'll need to create a Zap in
						Zapier and when prompted, enter the access token from
						the textbox below.
					</Text>
				</Stack>
			</Box>
			<CodeBlock
				style={lightTheme}
				showLineNumbers={false}
				text={generatedJwtToken || ' '}
				language="text"
				numberOfLines={2}
			/>
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
						analytics.track('IntegrationConfigurationCancel-Zapier')
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					emphasis="high"
					target="_blank"
					href="https://zapier.com/app/zaps" // TODO: change to Highlight Zap URL
					iconLeft={<Sparkles2Icon />}
					onClick={() => {
						analytics.track('IntegrationConfigurationSave-Zapier')
					}}
				>
					Create a Zap
				</Button>
			</Box>
		</Stack>
	)
}

export default ZapierIntegrationConfig
