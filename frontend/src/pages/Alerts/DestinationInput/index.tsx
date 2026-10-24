import {
	Box,
	IconSolidDiscord,
	IconSolidGlobeAlt,
	IconSolidMail,
	IconSolidMicrosoftTeams,
	IconSolidPlus,
	IconSolidSlack,
	Menu,
	Select,
} from '@highlight-run/ui/components'
import type { SelectOption } from '@highlight-run/ui/components'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
	AlertDestinationInput,
	AlertDestinationType,
} from '@/graph/generated/schemas'
import { useSlackSync } from '@/hooks/useSlackSync'
import SlackLoadOrConnect from '@/pages/Alerts/AlertConfigurationCard/SlackLoadOrConnect'
import { useAlertsContext } from '@/pages/Alerts/AlertsContext/AlertsContext'
import { LabeledRow } from '@/pages/Graphing/LabeledRow'

type Channel = {
	id: AlertDestinationType
	label: string
	icon: JSX.Element
	enabled?: boolean
}

type ChannelOption = SelectOption & {
	id?: string
	displayValue?: string
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

type Props = {
	initialDestinations: AlertDestinationInput[]
	setDestinations: (destinations: AlertDestinationInput[]) => void
}

export const DestinationInput: React.FC<Props> = ({
	initialDestinations,
	setDestinations,
}) => {
	const { alertsPayload, slackUrl } = useAlertsContext()
	const { slackLoading, syncSlack } = useSlackSync()

	const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([])
	const [slackSearchQuery, setSlackSearchQuery] = useState('')

	const [selectedSlackChannels, setSelectedSlackChannels] = useState<
		ChannelOption[]
	>([])
	const [selectedDiscordChannels, setSelectedDiscordChannels] = useState<
		ChannelOption[]
	>([])
	const [selectedTeamsChannels, setSelectedTeamsChannels] = useState<
		ChannelOption[]
	>([])
	const [selectedEmails, setSelectedEmails] = useState<ChannelOption[]>([])
	const [selectedWebhooks, setSelectedWebhooks] = useState<ChannelOption[]>(
		[],
	)

	// load in initial destinations
	useEffect(() => {
		const selectedChannels: { [key: string]: boolean } = {}
		const slackChannels: ChannelOption[] = []
		const discordChannels: ChannelOption[] = []
		const teamsChannels: ChannelOption[] = []
		const emails: ChannelOption[] = []
		const webhooks: ChannelOption[] = []

		initialDestinations.forEach((destination) => {
			switch (destination.destination_type) {
				case AlertDestinationType.Slack:
					selectedChannels[AlertDestinationType.Slack] = true
					slackChannels.push({
						displayValue: destination.type_name,
						id: destination.type_id,
						name: destination.type_name,
						value: destination.type_id,
					})
					break
				case AlertDestinationType.Discord:
					selectedChannels[AlertDestinationType.Discord] = true
					discordChannels.push({
						displayValue: destination.type_name,
						id: destination.type_id,
						name: destination.type_name,
						value: destination.type_id,
					})
					break
				case AlertDestinationType.MicrosoftTeams:
					selectedChannels[AlertDestinationType.MicrosoftTeams] = true
					teamsChannels.push({
						displayValue: destination.type_name,
						id: destination.type_id,
						name: destination.type_name,
						value: destination.type_id,
					})
					break
				case AlertDestinationType.Email:
					selectedChannels[AlertDestinationType.Email] = true
					emails.push({
						displayValue: destination.type_name,
						id: destination.type_id,
						name: destination.type_name,
						value: destination.type_id,
					})
					break
				case AlertDestinationType.Webhook:
					selectedChannels[AlertDestinationType.Webhook] = true
					webhooks.push({
						displayValue: destination.type_name,
						id: destination.type_id,
						name: destination.type_name,
						value: destination.type_id,
					})
					break
			}
		})

		setSelectedChannelIds(Object.keys(selectedChannels))
		setSelectedSlackChannels(slackChannels)
		setSelectedDiscordChannels(discordChannels)
		setSelectedTeamsChannels(teamsChannels)
		setSelectedEmails(emails)
		setSelectedWebhooks(webhooks)
	}, [initialDestinations])

	// keep destinations in sync with local state
	useEffect(() => {
		const newDestinations = [
			...convertOptionsToDestinations(
				selectedSlackChannels,
				AlertDestinationType.Slack,
			),
			...convertOptionsToDestinations(
				selectedDiscordChannels,
				AlertDestinationType.Discord,
			),
			...convertOptionsToDestinations(
				selectedTeamsChannels,
				AlertDestinationType.MicrosoftTeams,
			),
			...convertOptionsToDestinations(
				selectedEmails,
				AlertDestinationType.Email,
			),
			...convertOptionsToDestinations(
				selectedWebhooks,
				AlertDestinationType.Webhook,
			),
		]

		setDestinations(newDestinations)
	}, [
		selectedDiscordChannels,
		selectedEmails,
		selectedSlackChannels,
		selectedTeamsChannels,
		selectedWebhooks,
		setDestinations,
	])

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
					id: webhook_channel_id!,
					displayValue: webhook_channel!,
					name: webhook_channel!,
					value: webhook_channel_id!,
				}),
			),
		[alertsPayload?.slack_channel_suggestion],
	)

	const discordChannels = useMemo(
		() =>
			(alertsPayload?.discord_channel_suggestions ?? []).map(
				({ name, id }) => ({
					id,
					displayValue: name,
					name,
					value: id,
				}),
			),
		[alertsPayload?.discord_channel_suggestions],
	)

	const microsoftTeamsChannels = useMemo(
		() =>
			(alertsPayload?.microsoft_teams_channel_suggestions ?? []).map(
				({ name, id }) => ({
					id,
					displayValue: name,
					name,
					value: id,
				}),
			),
		[alertsPayload?.microsoft_teams_channel_suggestions],
	)

	const emails = useMemo(
		() =>
			(alertsPayload?.admins ?? []).map((wa) => ({
				id: wa.admin!.email,
				displayValue: wa.admin!.email,
				name: wa.admin!.email,
				value: wa.admin!.email,
			})),
		[alertsPayload?.admins],
	)

	return (
		<>
			{selectedChannelIds.includes(AlertDestinationType.Slack) && (
				<LabeledRow
					label="Slack channels to notify"
					name={AlertDestinationType.Slack}
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
						onValueChange={setSelectedSlackChannels}
						value={selectedSlackChannels}
					/>
					{slackChannels.length === 0 && (
						<Box mt="4">
							<SlackLoadOrConnect
								isLoading={slackLoading}
								searchQuery={slackSearchQuery}
								slackUrl={slackUrl}
								isSlackIntegrated={
									alertsPayload?.is_integrated_with_slack ??
									false
								}
							/>
						</Box>
					)}
				</LabeledRow>
			)}
			{selectedChannelIds.includes(AlertDestinationType.Discord) && (
				<LabeledRow
					label="Discord channels to notify"
					name={AlertDestinationType.Slack}
				>
					<Select
						aria-label="Discord channels to notify"
						placeholder="Select Discord channels"
						options={discordChannels}
						filterable
						displayMode="tags"
						checkType="checkbox"
						onValueChange={setSelectedDiscordChannels}
						value={selectedDiscordChannels}
					/>
					{discordChannels.length === 0 && (
						<Box mt="4">
							<Link to="/integrations">
								Connect Highlight with Discord
							</Link>
						</Box>
					)}
				</LabeledRow>
			)}
			{selectedChannelIds.includes(
				AlertDestinationType.MicrosoftTeams,
			) && (
				<LabeledRow
					label="Microsoft Teams channels to notify"
					name={AlertDestinationType.Slack}
				>
					<Select
						aria-label="Microsoft Teams channels to notify"
						placeholder="Select Microsoft Teams channels"
						options={microsoftTeamsChannels}
						filterable
						displayMode="tags"
						checkType="checkbox"
						onValueChange={setSelectedTeamsChannels}
						value={selectedTeamsChannels}
					/>
					{microsoftTeamsChannels.length === 0 && (
						<Box mt="4">
							<Link to="/integrations">
								Connect Highlight with Microsoft Teams
							</Link>
						</Box>
					)}
				</LabeledRow>
			)}
			{selectedChannelIds.includes(AlertDestinationType.Email) && (
				<LabeledRow
					label="Emails to notify"
					name={AlertDestinationType.Email}
				>
					<Select
						aria-label="Emails to notify"
						placeholder="Select emails"
						options={emails}
						filterable
						creatable
						displayMode="tags"
						checkType="checkbox"
						onValueChange={setSelectedEmails}
						value={selectedEmails}
					/>
				</LabeledRow>
			)}
			{selectedChannelIds.includes(AlertDestinationType.Webhook) && (
				<LabeledRow
					label="Webhooks to notify"
					name={AlertDestinationType.Webhook}
				>
					<Select
						aria-label="Webhooks to notify"
						placeholder="Enter webhook addresses"
						filterable
						creatable
						displayMode="tags"
						checkType="checkbox"
						onValueChange={setSelectedWebhooks}
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

const convertOptionsToDestinations = (
	options: ChannelOption[],
	destinationType: AlertDestinationType,
) => {
	return options.map((v: ChannelOption) => ({
		destination_type: destinationType,
		type_name: v.name ?? String(v.value),
		type_id: String(v.value),
	}))
}
