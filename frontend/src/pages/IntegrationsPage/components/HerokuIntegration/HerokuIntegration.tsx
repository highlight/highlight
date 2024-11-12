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
import Select from '@components/Select/Select'

const HerokuIntegration: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen: setModalOpen, setIntegrationEnabled, action }) => {
	const { project_id } = useParams<{ project_id: string }>()
	const { addHerokuToProject, removeHerokuIntegrationFromProject } =
		useHerokuIntegration()
	const formStore = Form.useStore<{ tokens: string[] }>({
		defaultValues: {
			tokens: [],
		},
	})
	const tokens = formStore.useValue(formStore.names.tokens) as string[]

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
				<Form.NamedSection
					name={formStore.names.tokens}
					label="Log Drain Token(s)"
				>
					<Select
						aria-label="Log Drain Token(s)"
						placeholder="d.9173ea1f-6f14-4976-9cf0-deadbeef1234"
						onChange={(values: any): any =>
							formStore.setValue(formStore.names.tokens, values)
						}
						className={styles.selectContainer}
						mode="tags"
						value={formStore.getValue(formStore.names.tokens)}
					/>
				</Form.NamedSection>
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
					disabled={!tokens.filter((t) => t.length >= 38).length}
					onClick={async () => {
						setModalOpen(false)
						await addHerokuToProject(tokens, project_id)
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
