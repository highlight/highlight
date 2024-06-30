import Button from '@components/Button/Button/Button'
import { Form } from '@highlight-run/ui/components'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import styles from './HerokuIntegration.module.css'
import { useHerokuIntegration } from './utils'

const HerokuIntegration: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { addHerokuToProject, removeHerokuIntegrationFromProject } =
		useHerokuIntegration()
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
					Disconnecting your Heroku workspace from Highlight will
					break your Heroku log drains that may currently be sending
					data!
				</p>
				<footer>
					<Button
						trackingId="IntegrationDisconnectCancel-Heroku"
						className={styles.modalBtn}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(true)
						}}
					>
						Cancel
					</Button>
					<Button
						trackingId="IntegrationDisconnectSave-Heroku"
						className={styles.modalBtn}
						type="primary"
						danger
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeHerokuIntegrationFromProject(project_id)
						}}
					>
						<PlugIcon className={styles.modalBtnIcon} />
						Disconnect Heroku
					</Button>
				</footer>
			</>
		)
	}

	return (
		<>
			<p className={styles.modalSubTitle}>
				Connect a Heroku Syslog drain pointed to{' '}
				<code>syslog+tls://syslog.highlight.io:34302</code> to start
				shipping your logs to highlight.{' '}
				<a
					className={styles.description}
					href="https://devcenter.heroku.com/articles/log-drains#syslog-drains"
					target="_blank"
					rel="noopener noreferrer"
				>
					Add the drain token to highlight.
				</a>
			</p>
			<Form store={formStore} resetOnSubmit={false}>
				<Form.Input
					name={formStore.names.token}
					label="Log Drain Token"
					type="text"
					autoFocus
				/>
			</Form>
			<footer>
				<Button
					trackingId="IntegrationConfigurationCancel-Heroku"
					className={styles.modalBtn}
					onClick={() => {
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					trackingId="IntegrationConfigurationSave-Heroku"
					className={styles.modalBtn}
					type="primary"
					disabled={token.length < 38}
					onClick={async () => {
						setModalOpen(false)
						await addHerokuToProject(token, project_id)
					}}
				>
					<AppsIcon className={styles.modalBtnIcon} /> Connect
					Highlight with Heroku
				</Button>
			</footer>
		</>
	)
}

export default HerokuIntegration
