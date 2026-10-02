import Select from '@components/Select/Select'
import {
	Box,
	Form,
	IconSolidLogout,
	IconSolidPuzzle,
	Stack,
	Text,
	TextLink,
} from '@highlight-run/ui/components'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

import { Button } from '@/components/Button'

import styles from './HerokuIntegration.module.css'
import { useHerokuIntegration } from './utils'

const HerokuIntegration: React.FC<
	React.PropsWithChildren<IntegrationConfigProps>
> = ({ setModalOpen, setIntegrationEnabled, action }) => {
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
			<Stack gap="16" cssClass={styles.container}>
				<Text color="moderate" size="small">
					Disconnecting your Heroku workspace from Highlight will
					break your Heroku log drains that may currently be sending
					data.
				</Text>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="flex-end"
					gap="8"
				>
					<Button
						trackingId="IntegrationDisconnectCancel-Heroku"
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
						trackingId="IntegrationDisconnectSave-Heroku"
						kind="danger"
						size="medium"
						emphasis="high"
						iconLeft={<IconSolidLogout />}
						onClick={() => {
							setModalOpen(false)
							setIntegrationEnabled(false)
							removeHerokuIntegrationFromProject(project_id)
						}}
					>
						Disconnect Heroku
					</Button>
				</Box>
			</Stack>
		)
	}

	return (
		<Stack gap="16" cssClass={styles.container}>
			<Text color="moderate" size="small">
				Connect a Heroku Syslog drain pointed to{' '}
				<code>syslog+tls://syslog.highlight.io:34302</code> to start
				shipping your logs to Highlight.{' '}
				<TextLink
					href="https://devcenter.heroku.com/articles/log-drains#syslog-drains"
					target="_blank"
				>
					Add the drain token to Highlight.
				</TextLink>
			</Text>
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
			<Box
				display="flex"
				alignItems="center"
				justifyContent="flex-end"
				gap="8"
			>
				<Button
					trackingId="IntegrationConfigurationCancel-Heroku"
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
					trackingId="IntegrationConfigurationSave-Heroku"
					kind="primary"
					size="medium"
					emphasis="high"
					iconLeft={<IconSolidPuzzle />}
					disabled={!tokens.filter((t) => t.length >= 38).length}
					onClick={async () => {
						setModalOpen(false)
						await addHerokuToProject(tokens, project_id)
					}}
				>
					Connect with Heroku
				</Button>
			</Box>
		</Stack>
	)
}

export default HerokuIntegration
