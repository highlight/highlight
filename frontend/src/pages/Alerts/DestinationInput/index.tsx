import Select from '@components/Select/Select'
import {
	Box,
	IconSolidDiscord,
	IconSolidGlobeAlt,
	IconSolidMail,
	IconSolidMicrosoftTeams,
	IconSolidPlus,
	IconSolidSlack,
	Menu,
} from '@highlight-run/ui/components'
import * as React from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { AlertDestinationType } from '@/graph/generated/schemas'
import { useSlackSync } from '@/hooks/useSlackSync'
import SlackLoadOrConnect from '@/pages/Alerts/AlertConfigurationCard/SlackLoadOrConnect'
import { useAlertsContext } from '@/pages/Alerts/AlertsContext/AlertsContext'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'

import * as styles from './styles.css'

type Channel = {
	id: AlertDestinationType
	label: string
	icon: JSX.Element
	enabled?: boolean
}

const DESTINATION_CHANNELS: Channel[] = [
	{
		id: AlertDestinationType.Slack,
		label: 'Slack channels',
		icon: <IconSolidSlack />,
	},
	{
		id: AlertDestinationType.Discord,
		label: 'Discord channels',
		icon: <IconSolidDiscord />,
	},
	{
		id: AlertDestinationType.MicrosoftTeams,
		label: 'Microsoft Teams channels',
		icon: <IconSolidMicrosoftTeams />,
	},
	{
		id: AlertDestinationType.Email,
		label: 'Emails',
		icon: <IconSolidMail />,
	},
	{
		id: AlertDestinationType.Webhook,
		label: 'Webhooks',
		icon: <IconSolidGlobeAlt />,
	},
]

export const DestinationInput: React.FC = ({}) => {
	const { alertsPayload, slackUrl } = useAlertsContext()
	const { slackLoading, syncSlack } = useSlackSync()

	const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([])
	const [slackSearchQuery, setSlackSearchQuery] = useState('')

	const [selectedSlackChannels, setSelectedSlackChannels] = useState()
	const [selectedDiscordChannels, setSelectedDiscordChannels] = useState()
	const [selectedTeamsChannels, setSelectedTeamsChannels] = useState()
	const [selectedEmails, setSelectedEmails] = useState()
	const [selectedWebhooks, setSelectedWebhooks] = useState()

	const possibleChannels = useMemo(
		() =>
			DESTINATION_CHANNELS.filter(
				(channel) => !selectedChannelIds.includes(channel.id),
			),

		[selectedChannelIds],
	)

	const handleChannelClick = (channelId: string) => {
		setSelectedChannelIds((prev) => [...prev, channelId])
	}

	const slackChannels = useMemo(
		() =>
			(alertsPayload?.slack_channel_suggestion ?? []).map(
				({ webhook_channel, webhook_channel_id }) => ({
					displayValue: webhook_channel!,
					value: webhook_channel_id!,
					id: webhook_channel_id!,
				}),
			),
		[alertsPayload?.slack_channel_suggestion],
	)

	const discordChannels = useMemo(
		() =>
			(alertsPayload?.discord_channel_suggestions ?? []).map(
				({ name, id }) => ({
					displayValue: name,
					value: id,
					id: id,
				}),
			),
		[alertsPayload?.discord_channel_suggestions],
	)

	const microsoftTeamsChannels = useMemo(
		() =>
			(alertsPayload?.microsoft_teams_channel_suggestions ?? []).map(
				({ name, id }) => ({
					displayValue: name,
					value: id,
					id: id,
				}),
			),
		[alertsPayload?.microsoft_teams_channel_suggestions],
	)

	const emails = useMemo(
		() =>
			(alertsPayload?.admins ?? []).map((wa) => ({
				displayValue: wa.admin!.email,
				value: wa.admin!.email,
				id: wa.admin!.email,
			})),
		[alertsPayload?.admins],
	)

	return (
		<>
			{selectedChannelIds.includes(AlertDestinationType.Slack) && (
				<LabeledRow
					label="Slack channels to notifiy"
					name={AlertDestinationType.Slack}
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
							setSelectedSlackChannels(
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
									alertsPayload?.is_integrated_with_slack ??
									false
								}
							/>
						}
						className={styles.selectContainer}
						mode="multiple"
						labelInValue
						value={selectedSlackChannels}
					/>
				</LabeledRow>
			)}
			{selectedChannelIds.includes(AlertDestinationType.Discord) && (
				<LabeledRow
					label="Discord channels to notifiy"
					name={AlertDestinationType.Slack}
				>
					<Select
						aria-label="Discord channels to notify"
						placeholder="Select Discord channels"
						options={discordChannels}
						optionFilterProp="label"
						onChange={(values) => {
							setSelectedDiscordChannels(
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
						value={selectedDiscordChannels}
					/>
				</LabeledRow>
			)}
			{selectedChannelIds.includes(
				AlertDestinationType.MicrosoftTeams,
			) && (
				<LabeledRow
					label="Microsoft Teams channels to notifiy"
					name={AlertDestinationType.Slack}
				>
					<Select
						aria-label="Microsoft Teams channels to notify"
						placeholder="Select Microsoft Teams channels"
						options={microsoftTeamsChannels}
						optionFilterProp="label"
						onChange={(values) => {
							setSelectedTeamsChannels(
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
						value={selectedTeamsChannels}
					/>
				</LabeledRow>
			)}
			{selectedChannelIds.includes(AlertDestinationType.Email) && (
				<LabeledRow
					label="Emails to notifiy"
					name={AlertDestinationType.Slack}
				>
					<Select
						aria-label="Emails to notify"
						placeholder="Select emails"
						options={emails}
						onChange={setSelectedEmails}
						notFoundContent={<p>No email suggestions</p>}
						className={styles.selectContainer}
						mode="multiple"
						value={selectedEmails}
					/>
				</LabeledRow>
			)}
			{selectedChannelIds.includes(AlertDestinationType.Webhook) && (
				<LabeledRow
					label="Webhooks to notifiy"
					name={AlertDestinationType.Slack}
				>
					<Select
						aria-label="Webhooks to notify"
						placeholder="Enter webhook addresses"
						onChange={setSelectedWebhooks}
						notFoundContent={null}
						className={styles.selectContainer}
						mode="tags"
						value={selectedWebhooks}
					/>
				</LabeledRow>
			)}

			{possibleChannels.length > 0 && (
				<Menu>
					<Menu.Button iconLeft={<IconSolidPlus />} kind="secondary">
						Add channel/email
					</Menu.Button>
					<Menu.List>
						{possibleChannels.map((channel) => (
							<Menu.Item
								key={channel.id}
								onClick={() => handleChannelClick(channel.id)}
							>
								<Box display="flex" alignItems="center" gap="4">
									{channel.icon}
									Add {channel.label}
								</Box>
							</Menu.Item>
						))}
					</Menu.List>
				</Menu>
			)}
		</>
	)
}
