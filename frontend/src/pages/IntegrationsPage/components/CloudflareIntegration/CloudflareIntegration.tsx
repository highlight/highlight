import Button from '@components/Button/Button/Button'
import { Form, Stack } from '@highlight-run/ui/components'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import React from 'react'

import * as styles from './style.css'
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
			<p className={styles.modalSubTitle}>
				Current proxy endpoint: {currentWorkspace?.cloudflare_proxy}
			</p>
		)
	} else if (action === IntegrationAction.Disconnect) {
		return (
			<>
				<p className={styles.modalSubTitle}>
					Disconnecting your Cloudflare workspace from Highlight will
					disable highlight's access to your proxy workers!
				</p>
				<footer>
					<Button
						trackingId="IntegrationDisconnectCancel-Cloudflare"
						className={styles.modalBtn}
						onClick={() => {
							setModalOpen(false)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-Cloudflare"
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={async () => {
							setModalOpen(false)
							await removeCloudflareIntegrationFromProject()
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disconnect Cloudflare
					</Button>
				</footer>
			</>
		)
	}

	return (
		<>
			<p className={styles.modalSubTitle}>
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
			</p>
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
			<footer>
				<Button
					trackingId="IntegrationConfigurationCancel-Cloudflare"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Cloudflare"
					className={styles.modalBtn}
					type="primary"
					disabled={token.length < 40 || proxySubdomain.length < 3}
					onClick={async () => {
						setModalOpen(false)
						await addCloudflareToProject(token, proxySubdomain)
					}}
				>
					<AppsIcon className={styles.modalBtnIcon} /> Connect
					Highlight with Cloudflare
				</Button>
			</footer>
		</>
	)
}

export default CloudflareIntegration
