import { Box, Button, Form, Stack, Text } from '@highlight-run/ui/components'
import AppsIcon from '@icons/AppsIcon'
import PlugIcon from '@icons/PlugIcon'
import {
	IntegrationAction,
	IntegrationConfigProps,
} from '@pages/IntegrationsPage/components/Integration'
import { analytics } from '@util/analytics'
import { useParams } from '@util/react-router/useParams'
import React from 'react'

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
			<Stack gap="12">
				<Box paddingY="8">
					<Text color="moderate">
						Disconnecting your Heroku workspace from Highlight will
						break your Heroku log drains that may currently be
						sending data!
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
							analytics.track('IntegrationDisconnectCancel-Heroku')
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
							analytics.track('IntegrationDisconnectSave-Heroku')
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
		<Stack gap="12">
			<Box paddingY="8">
				<Text color="moderate">
					Connect a Heroku Syslog drain pointed to{' '}
					<code>syslog+tls://syslog.highlight.io:34302</code> to
					start shipping your logs to highlight.{' '}
					<a
						href="https://devcenter.heroku.com/articles/log-drains#syslog-drains"
						target="_blank"
						rel="noopener noreferrer"
					>
						Add the drain token to highlight.
					</a>
				</Text>
			</Box>
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
						mode="tags"
						value={formStore.getValue(formStore.names.tokens)}
					/>
				</Form.NamedSection>
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
							'IntegrationConfigurationCancel-Heroku',
						)
						setModalOpen(false)
						setIntegrationEnabled(false)
					}}
				>
					Cancel
				</Button>
				<Button
					kind="primary"
					emphasis="high"
					disabled={!tokens.filter((t) => t.length >= 38).length}
					iconLeft={<AppsIcon />}
					onClick={async () => {
						analytics.track('IntegrationConfigurationSave-Heroku')
						setModalOpen(false)
						await addHerokuToProject(tokens, project_id)
					}}
				>
					Connect Highlight with Heroku
				</Button>
			</Box>
		</Stack>
	)
}

export default HerokuIntegration
