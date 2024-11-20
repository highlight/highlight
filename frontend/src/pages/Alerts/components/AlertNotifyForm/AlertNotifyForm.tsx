import Select from '@components/Select/Select'
import { Box, Form, FormState, Stack, Text } from '@highlight-run/ui/components'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useSlackSync } from '@/hooks/useSlackSync'
import SlackLoadOrConnect from '@/pages/Alerts/AlertConfigurationCard/SlackLoadOrConnect'
import { useAlertsContext } from '@/pages/Alerts/AlertsContext/AlertsContext'
import { AlertForm } from '@/pages/Alerts/utils/AlertsUtils'

import * as styles from './styles.css'

const AlertNotifyForm = () => {
	const { alertsPayload, slackUrl } = useAlertsContext()
	const { slackLoading, syncSlack } = useSlackSync()
	const [slackSearchQuery, setSlackSearchQuery] = useState('')
	const formStore = Form.useContext() as FormState<AlertForm>

	const slackChannels = (alertsPayload?.slack_channel_suggestion ?? []).map(
		({ webhook_channel, webhook_channel_id }) => ({
			displayValue: webhook_channel!,
			value: webhook_channel_id!,
			id: webhook_channel_id!,
		}),
	)

	const discordChannels = (
		alertsPayload?.discord_channel_suggestions ?? []
	).map(({ name, id }) => ({
		displayValue: name,
		value: id,
		id: id,
	}))

	const emails = (alertsPayload?.admins ?? [])
		.map((wa) => wa.admin!.email)
		.map((email) => ({
			displayValue: email,
			value: email,
			id: email,
		}))

	const microsoftTeamsChannels = (
		alertsPayload?.microsoft_teams_channel_suggestions ?? []
	).map(({ name, id }) => ({
		displayValue: name,
		value: id,
		id: id,
	}))

	return (
		<Stack gap="12">
			<Box cssClass={styles.sectionHeader}>
				<Text size="large" weight="bold" color="strong">
					Notify team
				</Text>
			</Box>

			<Box borderTop="dividerWeak" width="full" />
			<Form.NamedSection
				label="Slack channels to notify"
				name={formStore.names.slackChannels}
			>
				<Select
					aria-label="Slack channels to notify"
					placeholder="Select Slack channels"
					options={slackChannels}
					optionFilterProp="label"
					onFocus={syncSlack}
					onSearch={(value) => {
						setSlackSearchQuery(value)
					}}
					onChange={(values) => {
						formStore.setValue(
							formStore.names.slackChannels,
							values.map((v: any) => ({
								webhook_channel_name: v.label,
								webhook_channel_id: v.value,
								...v,
							})),
						)
					}}
					notFoundContent={
						<SlackLoadOrConnect
							isLoading={slackLoading}
							searchQuery={slackSearchQuery}
							slackUrl={slackUrl}
							isSlackIntegrated={
								alertsPayload?.is_integrated_with_slack ?? false
							}
						/>
					}
					className={styles.selectContainer}
					mode="multiple"
					labelInValue
					value={formStore.getValue(formStore.names.slackChannels)}
				/>
			</Form.NamedSection>

			<Form.NamedSection
				label="Discord channels to notify"
				name={formStore.names.discordChannels}
			>
				<Select
					aria-label="Discord channels to notify"
					placeholder="Select Discord channels"
					options={discordChannels}
					optionFilterProp="label"
					onChange={(values) => {
						formStore.setValue(
							formStore.names.discordChannels,
							values.map((v: any) => ({
								name: v.label,
								id: v.value,
								...v,
							})),
						)
					}}
					notFoundContent={
						discordChannels.length === 0 ? (
							<Link to="/integrations">
								Connect Highlight with Discord
							</Link>
						) : (
							'Discord channel not found'
						)
					}
					className={styles.selectContainer}
					mode="multiple"
					labelInValue
					value={formStore.getValue(formStore.names.discordChannels)}
				/>
			</Form.NamedSection>

			<Form.NamedSection
				label="Microsoft Teams channels to notify"
				name={formStore.names.microsoftTeamsChannels}
			>
				<Select
					aria-label="Microsoft Teams channels to notify"
					placeholder="Select Microsoft Teams channels"
					options={microsoftTeamsChannels}
					optionFilterProp="label"
					onChange={(values) => {
						formStore.setValue(
							formStore.names.microsoftTeamsChannels,
							values.map((v: any) => ({
								name: v.label,
								id: v.value,
								...v,
							})),
						)
					}}
					notFoundContent={
						microsoftTeamsChannels.length === 0 ? (
							<Link to="/integrations">
								Connect Highlight with Microsoft Teams
							</Link>
						) : (
							'Microsoft Teams channel not found'
						)
					}
					className={styles.selectContainer}
					mode="multiple"
					labelInValue
					value={formStore.getValue(
						formStore.names.microsoftTeamsChannels,
					)}
				/>
			</Form.NamedSection>

			<Form.NamedSection
				label="Emails to notify"
				name={formStore.names.emails}
			>
				<Select
					aria-label="Emails to notify"
					placeholder="Select emails"
					options={emails}
					onChange={(values: any): any =>
						formStore.setValue(formStore.names.emails, values)
					}
					notFoundContent={<p>No email suggestions</p>}
					className={styles.selectContainer}
					mode="tags"
					value={formStore.getValue(formStore.names.emails)}
				/>
			</Form.NamedSection>

			<Form.NamedSection
				label="Webhooks to notify"
				name={formStore.names.webhookDestinations}
			>
				<Select
					aria-label="Webhooks to notify"
					placeholder="Enter webhook addresses"
					onChange={(values: any): any =>
						formStore.setValue(
							formStore.names.webhookDestinations,
							values,
						)
					}
					notFoundContent={null}
					className={styles.selectContainer}
					mode="tags"
					value={formStore.getValue(
						formStore.names.webhookDestinations,
					)}
				/>
			</Form.NamedSection>
		</Stack>
	)
}

export default AlertNotifyForm
