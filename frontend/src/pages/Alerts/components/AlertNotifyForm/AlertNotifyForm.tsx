import Select from '@components/Select/Select'
import { Box, Form, FormState, Stack, Text, useForm } from '@highlight-run/ui'
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
	const form = useForm() as FormState<AlertForm>

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
				name={form.names.slackChannels}
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
						form.setValue(
							form.names.slackChannels,
							values.map((v: any) => ({
								webhook_channel_name: v.label,
								webhook_channel_id: v.value,
								...v,
							})),
						)
					}}
					value={form.values.slackChannels}
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
				/>
			</Form.NamedSection>

			<Form.NamedSection
				label="Discord channels to notify"
				name={form.names.discordChannels}
			>
				<Select
					aria-label="Discord channels to notify"
					placeholder="Select Discord channels"
					options={discordChannels}
					optionFilterProp="label"
					onChange={(values) => {
						form.setValue(
							form.names.discordChannels,
							values.map((v: any) => ({
								name: v.label,
								id: v.value,
								...v,
							})),
						)
					}}
					value={form.values.discordChannels}
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
				/>
			</Form.NamedSection>

			<Form.NamedSection
				label="Emails to notify"
				name={form.names.emails}
			>
				<Select
					aria-label="Emails to notify"
					placeholder="Select emails"
					options={emails}
					onChange={(values: any): any =>
						form.setValue(form.names.emails, values)
					}
					value={form.values.emails}
					notFoundContent={<p>No email suggestions</p>}
					className={styles.selectContainer}
					mode="multiple"
				/>
			</Form.NamedSection>

			<Form.NamedSection
				label="Webhooks to notify"
				name={form.names.emails}
			>
				<Select
					aria-label="Webhooks to notify"
					placeholder="Enter webhook addresses"
					onChange={(values: any): any =>
						form.setValue(form.names.webhookDestinations, values)
					}
					value={form.values.webhookDestinations}
					notFoundContent={null}
					className={styles.selectContainer}
					mode="tags"
				/>
			</Form.NamedSection>
		</Stack>
	)
}

export default AlertNotifyForm
