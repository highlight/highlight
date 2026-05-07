import { Box, Button, Form, Stack, Text } from '@highlight-run/ui/components'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { analytics } from '@util/analytics'
import React from 'react'

import { useCloudflareIntegration } from './utils'

const CloudflareIntegration: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, action }) => {
	const { addCloudflareToProject, removeCloudflareIntegrationFromProject } =
		useCloudflareIntegration()
	const { currentWorkspace } = useApplicationContext()
	const formStore = Form.useStore<{ token: string; proxySubdomain: string }>({
		defaultValues: {
			token: '',
			proxySubdomain: '',
		},
	})
	const token = formStore.useValue(formStore.names.token)
	const proxySubdomain = formStore.useValue(formStore.names.proxySubdomain)

	if (action === IntegrationAction.Settings) {
		return (
			<Box paddingY="8">
				<Text color="moderate">
					Current proxy endpoint: {currentWorkspace?.cloudflare_proxy}
				</Text>
			</Box>
		)
	} else if (action === IntegrationAction.Disconnect) {
		return (
			<Stack gap="12">
				<Box paddingY="8">
					<Text color="moderate">
						Disconnecting your Cloudflare workspace from Highlight
						will disable highlight's access to your proxy workers!
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
							analytics.track('IntegrationDisconnectCancel-Cloudflare')
							setModalOpen(false)
						}}
					>
						Cancel
					</Button>
					<Button
						kind="danger"
						emphasis="high"
						iconLeft={<PlugIcon />}
						onClick={async () => {
							analytics.track('IntegrationDisconnectSave-Cloudflare')
							setModalOpen(false)
							await removeCloudflareIntegrationFromProject()
						}}
					>
						Disconnect Cloudflare
					</Button>
				</Box>
			</Stack>
		)
	}

	return (
		<Stack gap="12">
			<Box paddingY="8">
				<Text color="moderate">
					A highlight data proxy via Cloudflare can avoid ad-blockers
					detecting highlight tracking and blocking recording. Create{' '}
					<a
						href="https://dash.cloudflare.com/profile/api-tokens"
						target="_blank"
						rel="noopener noreferrer"
					>
						a Cloudflare API token
					</a>{' '}
					with minimal permissions of{' '}
					<code>
						account.workers_scripts.edit, zone.workers_routes.edit
					</code>
				</Text>
			</Box>
			<Form store={formStore} resetOnSubmit={false}>
				<Stack>
					<Form.Input
						name={formStore.names.token}
						label="API Token"
						type="password"
						minLength={40}
						autoFocus
					/>
					<Form.Input
						name={formStore.names.proxySubdomain}
						label="Proxy Subdomain"
						type="text"
						autoFocus
					/>
				</Stack>
			</Form>
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
							'IntegrationConfigurationCancel-Cloudflare',
						)
						setModalOpen(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					emphasis="high"
					disabled={token.length < 40 || proxySubdomain.length < 3}
					iconLeft={<AppsIcon />}
					onClick={async () => {
						analytics.track('IntegrationConfigurationSave-Cloudflare')
						setModalOpen(false)
						await addCloudflareToProject(token, proxySubdomain)
					}}
				>
					Connect Highlight with Cloudflare
				</Button>
			</Box>
		</Stack>
	)
}

export default CloudflareIntegration
