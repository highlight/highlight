import Button from '@components/Button/Button/Button'
import { Form } from '@highlight-run/ui/components'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import React from 'react'

import * as styles from './style.css'
import { useCloudflareIntegration } from './utils'

const CloudflareIntegration: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { addCloudflareToProject, removeCloudflareIntegrationFromProject } =
		useCloudflareIntegration()
	const formStore = Form.useStore({
		defaultValues: {
			token: '',
		},
	})
	const token = formStore.useValue(formStore.names.token)

	if (action === IntegrationAction.Disconnect) {
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
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-Cloudflare"
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeCloudflareIntegrationFromProject()
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
				detecting highlight tracking and blocking recording. Create a
				Cloudflare API token with minimal permissions of{' '}
				<code>
					account.workers_scripts.edit, zone.workers_routes.edit
				</code>
				. Add your API token below:
			</p>
			<Form store={formStore} resetOnSubmit={false}>
				<Form.Input
					name={formStore.names.token}
					label="API Token"
					type="text"
					autoFocus
				/>
			</Form>
			<footer>
				<Button
					trackingId="IntegrationConfigurationCancel-Cloudflare"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Cloudflare"
					className={styles.modalBtn}
					type="primary"
					disabled={token.length < 38}
					onClick={async () => {
						setModalOpen(false)
						await addCloudflareToProject(token)
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
