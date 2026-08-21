import {
	Box,
	Form,
	FormState,
	Select,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import type { SelectOption } from '@highlight-run/ui/components'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useSlackSync } from '@/hooks/useSlackSync'
import SlackLoadOrConnect from '@/pages/Alerts/AlertConfigurationCard/SlackLoadOrConnect'
import { useAlertsContext } from '@/pages/Alerts/AlertsContext/AlertsContext'
import { AlertForm } from '@/pages/Alerts/utils/AlertsUtils'

import * as styles from './styles.css'

type ExistingChannel = {
	id?: string
	value?: string
	name?: string
	displayValue?: string
	webhook_channel?: string
	webhook_channel_id?: string
	webhook_channel_name?: string
}

type ChannelOption = SelectOption & {
	id: string
	displayValue?: string
	webhook_channel_id?: string
	webhook_channel_name?: string
}

const channelValue = (channel: ExistingChannel) =>
	channel.webhook_channel_id ?? channel.value ?? channel.id ?? ''

const channelName = (channel: ExistingChannel) =>
	channel.webhook_channel_name ??
	channel.webhook_channel ??
	channel.name ??
	channel.displayValue ??
	channelValue(channel)

const toSelectedOptions = (channels: ExistingChannel[]): SelectOption[] =>
	channels.map((channel) => ({
		name: channelName(channel),
		value: channelValue(channel),
		...channel,
	}))

const toStringOptions = (values: string[] = []): SelectOption[] =>
	values.map((value) => ({ name: value, value }))

const AlertNotifyForm = () => {
	const { alertsPayload, slackUrl } = useAlertsContext()
	const { slackLoading, syncSlack } = useSlackSync()
	const [slackSearchQuery, setSlackSearchQuery] = useState('')
	const formStore = Form.useContext() as FormState<AlertForm>

	const slackChannels = (alertsPayload?.slack_channel_suggestion ?? []).map(
		({ webhook_channel, webhook_channel_id }) => ({
			displayValue: webhook_channel!,
			name: webhook_channel!,
			value: webhook_channel_id!,
			id: webhook_channel_id!,
			webhook_channel_id: webhook_channel_id!,
			webhook_channel_name: webhook_channel!,
		}),
	)

	const discordChannels = (
		alertsPayload?.discord_channel_suggestions ?? []
	).map(({ name, id }) => ({
		displayValue: name,
		name,
		value: id,
		id,
	}))

	const emails = (alertsPayload?.admins ?? [])
		.map((wa) => wa.admin!.email)
		.map((email) => ({
			displayValue: email,
			name: email,
			value: email,
			id: email,
		}))

	const microsoftTeamsChannels = (
		alertsPayload?.microsoft_teams_channel_suggestions ?? []
	).map(({ name, id }) => ({
		displayValue: name,
		name,
		value: id,
		id,
	}))

	const selectedSlackChannels = toSelectedOptions(
		formStore.getValue(formStore.names.slackChannels),
	)
	const selectedDiscordChannels = toSelectedOptions(
		formStore.getValue(formStore.names.discordChannels),
	)
	const selectedMicrosoftTeamsChannels = toSelectedOptions(
		formStore.getValue(formStore.names.microsoftTeamsChannels),
	)
	const selectedEmails = toStringOptions(
		formStore.getValue(formStore.names.emails),
	)
	const selectedWebhooks = toStringOptions(
		formStore.getValue(formStore.names.webhookDestinations),
	)

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
					filterable
					displayMode="tags"
					checkType="checkbox"
					onFocus={syncSlack}
					onSearchValueChange={setSlackSearchQuery}
					onValueChange={(values: ChannelOption[]) => {
						formStore.setValue(
							formStore.names.slackChannels,
							values.map((v) => ({
								webhook_channel_name: v.name,
								webhook_channel_id: String(v.value),
								...v,
							})),
						)
					}}
					className={styles.selectContainer}
					value={selectedSlackChannels}
				/>
				{slackChannels.length === 0 && (
					<Box mt="4">
						<SlackLoadOrConnect
							isLoading={slackLoading}
							searchQuery={slackSearchQuery}
							slackUrl={slackUrl}
							isSlackIntegrated={
								alertsPayload?.is_integrated_with_slack ?? false
							}
						/>
					</Box>
				)}
			</Form.NamedSection>

			<Form.NamedSection
				label="Discord channels to notify"
				name={formStore.names.discordChannels}
			>
				<Select
					aria-label="Discord channels to notify"
					placeholder="Select Discord channels"
					options={discordChannels}
					filterable
					displayMode="tags"
					checkType="checkbox"
					onValueChange={(values: ChannelOption[]) => {
						formStore.setValue(
							formStore.names.discordChannels,
							values.map((v) => ({
								name: v.name,
								id: String(v.value),
								...v,
							})),
						)
					}}
					className={styles.selectContainer}
					value={selectedDiscordChannels}
				/>
				{discordChannels.length === 0 && (
					<Box mt="4">
						<Link to="/integrations">
							Connect Highlight with Discord
						</Link>
					</Box>
				)}
			</Form.NamedSection>

			<Form.NamedSection
				label="Microsoft Teams channels to notify"
				name={formStore.names.microsoftTeamsChannels}
			>
				<Select
					aria-label="Microsoft Teams channels to notify"
					placeholder="Select Microsoft Teams channels"
					options={microsoftTeamsChannels}
					filterable
					displayMode="tags"
					checkType="checkbox"
					onValueChange={(values: ChannelOption[]) => {
						formStore.setValue(
							formStore.names.microsoftTeamsChannels,
							values.map((v) => ({
								name: v.name,
								id: String(v.value),
								...v,
							})),
						)
					}}
					className={styles.selectContainer}
					value={selectedMicrosoftTeamsChannels}
				/>
				{microsoftTeamsChannels.length === 0 && (
					<Box mt="4">
						<Link to="/integrations">
							Connect Highlight with Microsoft Teams
						</Link>
					</Box>
				)}
			</Form.NamedSection>

			<Form.NamedSection
				label="Emails to notify"
				name={formStore.names.emails}
			>
				<Select
					aria-label="Emails to notify"
					placeholder="Select emails"
					options={emails}
					filterable
					creatable
					displayMode="tags"
					checkType="checkbox"
					onValueChange={(values: SelectOption[]) =>
						formStore.setValue(
							formStore.names.emails,
							values.map(({ value }) => String(value)),
						)
					}
					className={styles.selectContainer}
					value={selectedEmails}
				/>
			</Form.NamedSection>

			<Form.NamedSection
				label="Webhooks to notify"
				name={formStore.names.webhookDestinations}
			>
				<Select
					aria-label="Webhooks to notify"
					placeholder="Enter webhook addresses"
					filterable
					creatable
					displayMode="tags"
					checkType="checkbox"
					onValueChange={(values: SelectOption[]) =>
						formStore.setValue(
							formStore.names.webhookDestinations,
							values.map(({ value }) => String(value)),
						)
					}
					className={styles.selectContainer}
					value={selectedWebhooks}
				/>
			</Form.NamedSection>
		</Stack>
	)
}

export default AlertNotifyForm
