import {
	Box,
	Form,
	IconSolidCloud,
	IconSolidLogout,
	Stack,
	Text,
	TextLink,
} from '@highlight-run/ui/components'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import React from 'react'

import { Button } from '@/components/Button'

import * as styles from './style.css'
import { useCloudflareIntegration } from './utils'

const CloudflareIntegration: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, action }) => {
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
			<Stack gap="8" cssClass={styles.container}>
				<Text color="moderate" size="small">
					Current proxy endpoint: {currentWorkspace?.cloudflare_proxy}
				</Text>
			</Stack>
		)
	}

	if (action === IntegrationAction.Disconnect) {
		return (
			<Stack gap="16" cssClass={styles.container}>
				<Text color="moderate" size="small">
					Disconnecting your Cloudflare workspace from Highlight will
					disable Highlight&apos;s access to your proxy workers.
				</Text>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="flex-end"
					gap="8"
				>
					<Button
						trackingId="IntegrationDisconnectCancel-Cloudflare"
						kind="secondary"
						size="medium"
						emphasis="medium"
						onClick={() => {
							setModalOpen(false)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-Cloudflare"
						kind="danger"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLogout />}
						onClick={async () => {
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
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				A Highlight data proxy via Cloudflare can avoid ad-blockers
				detecting Highlight tracking and blocking recording. Create{' '}
				<TextLink
					href="https://dash.cloudflare.com/profile/api-tokens"
					target="_blank"
				>
					a Cloudflare API token
				</TextLink>{' '}
				with minimal permissions of{' '}
				<code>
					account.workers_scripts.edit, zone.workers_routes.edit
				</code>
				.
			</Text>
			<Form store={formStore} resetOnSubmit={false}>
				<Stack gap="12">
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
					/>
				</Stack>
			</Form>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationConfigurationCancel-Cloudflare"
					kind="secondary"
					size="medium"
					emphasis="medium"
					onClick={() => {
						setModalOpen(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Cloudflare"
					kind="primary"
					size="medium"
					emphasis="high"
					iconLeft={<IconSolidCloud />}
					disabled={token.length < 40 || proxySubdomain.length < 3}
					onClick={async () => {
						setModalOpen(false)
						await addCloudflareToProject(token, proxySubdomain)
					}}
				>
					Connect with Cloudflare
				</Button>
			</Box>
		</Stack>
	)
}

export default CloudflareIntegration
