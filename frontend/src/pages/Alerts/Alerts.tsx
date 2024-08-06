import LoadingBox from '@components/LoadingBox'
import { SearchEmptyState } from '@components/SearchEmptyState/SearchEmptyState'
import { GetAlertsPagePayloadQuery } from '@graph/operations'
import {
	Box,
	Callout,
	Container,
	Heading,
	IconSolidChartBar,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidDiscord,
	IconSolidExclamation,
	IconSolidInformationCircle,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidMicrosoftTeams,
	IconSolidPlay,
	IconSolidPlayCircle,
	IconSolidPlus,
	IconSolidRefresh,
	IconSolidTraces,
	Menu,
	Stack,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import SvgBugIcon from '@icons/BugIcon'
import SvgCursorClickIcon from '@icons/CursorClickIcon'
import SvgFaceIdIcon from '@icons/FaceIdIcon'
import SvgMonitorIcon from '@icons/MonitorIcon'
import SvgSparkles2Icon from '@icons/Sparkles2Icon'
import SvgTargetIcon from '@icons/TargetIcon'
import SvgUserPlusIcon from '@icons/UserPlusIcon'
import { AlertEnableSwitch } from '@pages/Alerts/AlertEnableSwitch/AlertEnableSwitch'
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext'
import useLocalStorage from '@rehooks/local-storage'
import { useParams } from '@util/react-router/useParams'
import React from 'react'
import { RiMailFill, RiSlackFill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/Button'
import { Link } from '@/components/Link'
import { LinkButton } from '@/components/LinkButton'
import {
	AlertDestination,
	AlertDestinationType,
	DiscordChannel,
	MicrosoftTeamsChannel,
	ProductType,
	SanitizedSlackChannel,
} from '@/graph/generated/schemas'
import useFeatureFlag, { Feature } from '@/hooks/useFeatureFlag/useFeatureFlag'

import styles from './Alerts.module.css'

// TODO(et) - replace these with the graphql generated SessionAlertType
export enum ALERT_TYPE {
	Error,
	FirstTimeUser,
	UserProperties,
	TrackProperties,
	NewSession,
	RageClick,
	MetricMonitor,
	Logs,
	Dynamic,
}

export enum ALERT_NAMES {
	ERROR_ALERT = 'Errors',
	NEW_USER_ALERT = 'New Users',
	USER_PROPERTIES_ALERT = 'User Properties',
	TRACK_PROPERTIES_ALERT = 'Track Events',
	NEW_SESSION_ALERT = 'New Sessions',
	RAGE_CLICK_ALERT = 'Rage Clicks',
	METRIC_MONITOR = 'Metric Monitor',
	LOG_ALERT = 'Logs',
	ALERT = 'Alert',
}

export interface AlertConfiguration {
	name: string
	canControlThreshold: boolean
	type: ALERT_TYPE
	description: string | React.ReactNode
	icon: React.ReactNode
	supportsExcludeRules: boolean
}

export const ALERT_CONFIGURATIONS: { [key: string]: AlertConfiguration } = {
	ERROR_ALERT: {
		name: ALERT_NAMES['ERROR_ALERT'],
		canControlThreshold: true,
		type: ALERT_TYPE.Error,
		description: 'Get alerted when an error is thrown in your app.',
		icon: <SvgBugIcon />,
		supportsExcludeRules: false,
	},
	RAGE_CLICK_ALERT: {
		name: ALERT_NAMES['RAGE_CLICK_ALERT'],
		canControlThreshold: true,
		type: ALERT_TYPE.RageClick,
		description: (
			<>
				{'Get alerted whenever a user'}{' '}
				<a
					href="https://docs.highlight.run/rage-clicks"
					target="_blank"
					rel="noreferrer"
				>
					rage clicks.
				</a>
			</>
		),
		icon: <SvgCursorClickIcon />,
		supportsExcludeRules: false,
	},
	NEW_USER_ALERT: {
		name: ALERT_NAMES['NEW_USER_ALERT'],
		canControlThreshold: false,
		type: ALERT_TYPE.FirstTimeUser,
		description:
			'Get alerted when a new user uses your app for the first time.',
		icon: <SvgUserPlusIcon />,
		supportsExcludeRules: false,
	},
	USER_PROPERTIES_ALERT: {
		name: ALERT_NAMES['USER_PROPERTIES_ALERT'],
		canControlThreshold: false,
		type: ALERT_TYPE.UserProperties,
		description:
			'Get alerted when users you want to track record a session.',
		icon: <SvgFaceIdIcon />,
		supportsExcludeRules: false,
	},
	TRACK_PROPERTIES_ALERT: {
		name: ALERT_NAMES['TRACK_PROPERTIES_ALERT'],
		canControlThreshold: false,
		type: ALERT_TYPE.TrackProperties,
		description: 'Get alerted when an action is done in your application.',
		icon: <SvgTargetIcon />,
		supportsExcludeRules: false,
	},
	NEW_SESSION_ALERT: {
		name: ALERT_NAMES['NEW_SESSION_ALERT'],
		canControlThreshold: false,
		type: ALERT_TYPE.NewSession,
		description: 'Get alerted every time a session is created.',
		icon: <SvgSparkles2Icon />,
		supportsExcludeRules: true,
	},
	METRIC_MONITOR: {
		name: ALERT_NAMES['METRIC_MONITOR'],
		canControlThreshold: false,
		type: ALERT_TYPE.MetricMonitor,
		description: 'Get alerted when a metric value exceeds a value.',
		icon: <SvgMonitorIcon />,
		supportsExcludeRules: true,
	},
	LOG_ALERT: {
		name: ALERT_NAMES['LOG_ALERT'],
		canControlThreshold: true,
		type: ALERT_TYPE.Logs,
		description: 'Get alerted when queried logs exceed a threshold.',
		icon: <IconSolidLogs />,
		supportsExcludeRules: true,
	},
	ALERT: {
		name: ALERT_NAMES['ALERT'],
		canControlThreshold: true,
		type: ALERT_TYPE.Dynamic,
		description: 'Get alerted when alert conditions are met.',
		icon: <IconSolidLogs />,
		supportsExcludeRules: true,
	},
} as const
const WALKTHROUGH_LINK = 'TODO'
const ALERTS_DOCS_LINK =
	'https://www.highlight.io/docs/general/product-features/general-features/alerts'

export default function AlertsPage() {
	const { alertsPayload, loading } = useAlertsContext()

	return (
		<Box width="full" background="raised" p="8">
			<Box
				border="dividerWeak"
				borderRadius="6"
				width="full"
				shadow="medium"
				background="default"
				display="flex"
				flexDirection="column"
				height="full"
			>
				{loading && <LoadingBox />}
				{!loading && <AlertsPageLoaded alertsPayload={alertsPayload} />}
			</Box>
		</Box>
	)
}

function formatAlertDataForTable(alert: any, config: AlertConfiguration) {
	const slackChannels =
		alert?.ChannelsToNotify || alert?.channels_to_notify || []
	const discordChannels =
		alert?.DiscordChannelsToNotify ||
		alert?.discord_channels_to_notify ||
		[]
	const microsoftTeamsChannels =
		alert?.MicrosoftTeamsChennelsToNotify ||
		alert?.microsoft_teams_channels_to_notify ||
		[]
	const emails = alert?.EmailsToNotify || alert?.emails_to_notify || []
	const webhookDestinations =
		alert?.WebhookDestinations || alert?.webhook_destinations || []

	const destinations = alert.destinations || []
	destinations.forEach((destination: AlertDestination) => {
		switch (destination.destination_type) {
			case AlertDestinationType.Slack:
				slackChannels.push({
					webhook_channel: destination.type_name,
					webhook_channel_id: destination.type_id,
				})
				break
			case AlertDestinationType.Discord:
				discordChannels.push({
					id: destination.type_id,
					name: destination.type_name,
				})
				break
			case AlertDestinationType.MicrosoftTeams:
				microsoftTeamsChannels.push({
					id: destination.type_id,
					name: destination.type_name,
				})
				break
			case AlertDestinationType.Email:
				emails.push(destination.type_name)
				break
			case AlertDestinationType.Webhook:
				webhookDestinations.push(destination.type_name)
				break
		}
	})

	return {
		...alert,
		ChannelsToNotify: slackChannels,
		DiscordChannelsToNotify: discordChannels,
		MicrosoftTeamsChannelsToNotify: microsoftTeamsChannels,
		EmailsToNotify: emails,
		WebhookDestinations: webhookDestinations,
		configuration: config,
		type: alert?.product_type || config.name,
		name: alert?.name || alert?.Name || config.name,
		key: alert?.id,
	}
}

function getAlertNotifyField(alert: any, field: string) {
	return alert[field] || []
}

function AlertsPageLoaded({
	alertsPayload,
}: {
	alertsPayload: GetAlertsPagePayloadQuery | undefined
}) {
	const [visible, setVisible] = useLocalStorage<boolean>(
		'display-alerts-docs-callout',
		true,
	)
	const { project_id } = useParams<{ project_id: string }>()
	const navigate = useNavigate()
	const metricAlertsEnabled = useFeatureFlag(Feature.MetricAlerts)

	const navigateToAlert = (record: any) => {
		if (record.configuration.name === ALERT_NAMES['ALERT']) {
			navigate(`/${project_id}/alerts/${record.id}/edit`)
		} else if (record.type === ALERT_NAMES['METRIC_MONITOR']) {
			navigate(`/${project_id}/alerts/monitor/${record.id}`)
		} else if (record.type === ALERT_NAMES['LOG_ALERT']) {
			navigate(`/${project_id}/alerts/logs/${record.id}`)
		} else if (record.type === ALERT_NAMES['ERROR_ALERT']) {
			navigate(`/${project_id}/alerts/errors/${record.id}`)
		} else {
			navigate(`/${project_id}/alerts/session/${record.id}`)
		}
	}

	const alertsAsTableRows = [
		...(alertsPayload?.error_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['ERROR_ALERT'],
				),
			)
			.sort((a, b) => a.name.localeCompare(b.name)),
		...(alertsPayload?.new_user_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['NEW_USER_ALERT'],
				),
			)
			.sort((a, b) => a.name.localeCompare(b.name)),
		...(alertsPayload?.track_properties_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['TRACK_PROPERTIES_ALERT'],
				),
			)
			.sort((a, b) => a.name.localeCompare(b.name)),
		...(alertsPayload?.user_properties_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['USER_PROPERTIES_ALERT'],
				),
			)
			.sort((a, b) => a.name.localeCompare(b.name)),
		...(alertsPayload?.new_session_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['NEW_SESSION_ALERT'],
				),
			)
			.sort((a, b) => a.name.localeCompare(b.name)),
		...(alertsPayload?.rage_click_alerts || [])
			.map((alert) =>
				formatAlertDataForTable(
					alert,
					ALERT_CONFIGURATIONS['RAGE_CLICK_ALERT'],
				),
			)
			.sort((a, b) => a.name.localeCompare(b.name)),
		...(alertsPayload?.metric_monitors || [])
			.map((metricMonitor) =>
				formatAlertDataForTable(
					metricMonitor,
					ALERT_CONFIGURATIONS['METRIC_MONITOR'],
				),
			)
			.sort((a, b) => a.name.localeCompare(b.name)),
		...(alertsPayload?.log_alerts || [])
			.map((logAlert) =>
				formatAlertDataForTable(
					logAlert,
					ALERT_CONFIGURATIONS['LOG_ALERT'],
				),
			)
			.sort((a, b) => a.name.localeCompare(b.name)),
		...(alertsPayload?.alerts || []).map((alert) =>
			formatAlertDataForTable(alert, ALERT_CONFIGURATIONS['ALERT']),
		),
	]

	return (
		<Container display="flex" flexDirection="column" gap="24">
			<Box style={{ maxWidth: 560 }} my="40" mx="auto" width="full">
				<Stack gap="24" width="full">
					<Stack gap="16" direction="column" width="full">
						<Heading mt="16" level="h4">
							Alerts
						</Heading>
						<Text weight="medium" size="small" color="default">
							Manage all the alerts for your currently selected
							project.
						</Text>
					</Stack>
					<Stack gap="8" width="full">
						<Box
							display="flex"
							justifyContent="space-between"
							alignItems="center"
							width="full"
						>
							<Text weight="bold" size="small" color="strong">
								All alerts
							</Text>
							{metricAlertsEnabled ? (
								<Button
									trackingId="alerts-page-add-alert-button"
									onClick={() =>
										navigate(`/${project_id}/alerts/new`)
									}
									iconLeft={<IconSolidPlus />}
									kind="secondary"
									emphasis="low"
								>
									Add Alert
								</Button>
							) : (
								<NewAlertMenu />
							)}
						</Box>
						{visible && (
							<Callout
								title="Want to learn more about
												Alerts?"
								icon={false}
								handleCloseClick={() => setVisible(false)}
							>
								<Stack gap="16">
									<Text>
										Be sure to take a look at the docs, and
										the walkthrough coming soon!
									</Text>
									<Stack flexDirection="row" gap="8">
										<LinkButton
											kind="secondary"
											emphasis="high"
											trackingId="alerts-watch-walkthrough"
											to={WALKTHROUGH_LINK}
											iconLeft={<IconSolidPlay />}
											disabled
										>
											Watch walkthrough
										</LinkButton>
										<LinkButton
											trackingId="alerts-read-docs"
											kind="secondary"
											emphasis="low"
											to={ALERTS_DOCS_LINK}
										>
											Read docs
										</LinkButton>
									</Stack>
								</Stack>
							</Callout>
						)}
						{alertsPayload && (
							<Stack gap="6">
								{alertsAsTableRows.length > 0 ? (
									<>
										{alertsAsTableRows.map(
											(record, idx) => (
												<AlertRow
													key={idx}
													record={record}
													navigateToAlert={
														navigateToAlert
													}
												/>
											),
										)}
									</>
								) : (
									<>
										<SearchEmptyState
											className={styles.emptyContainer}
											item="alerts"
											customTitle={`Your project doesn't have any alerts yet 😔`}
										/>
									</>
								)}
							</Stack>
						)}
					</Stack>
				</Stack>
			</Box>
		</Container>
	)
}

type AlertRowProps = {
	record: any
	navigateToAlert: (record: any) => void
}

const AlertRow = ({ record, navigateToAlert }: AlertRowProps) => {
	return (
		<Box
			border="dividerWeak"
			width="full"
			display="flex"
			p="12"
			gap="16"
			background={record.disabled ? 'default' : 'raised'}
			borderRadius="6"
		>
			<Stack>
				<Box
					borderRadius="5"
					border="dividerWeak"
					display="flex"
					alignItems="center"
					justifyContent="center"
					style={{
						width: '28px',
						height: '28px',
					}}
				>
					<AlertIcon type={record.type} disabled={record.disabled} />
				</Box>
			</Stack>
			<Stack width="full" gap="12">
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					gap="8"
				>
					<Box display="flex" alignItems="center" gap="4">
						<Text weight="medium" size="small" color="strong">
							{record.name}
						</Text>
						<Tooltip
							trigger={
								<Tag
									kind="secondary"
									size="medium"
									shape="basic"
									emphasis="low"
									iconRight={<IconSolidInformationCircle />}
								></Tag>
							}
						>
							{record.configuration.description}
						</Tooltip>
					</Box>
					<Box display="flex" gap="8" flexShrink={0}>
						<Tag
							kind="primary"
							size="medium"
							shape="basic"
							emphasis="low"
							iconRight={<IconSolidCheveronRight />}
							onClick={() => navigateToAlert(record)}
						>
							Configure
						</Tag>
						<AlertEnableSwitch record={record} />
					</Box>
				</Box>
				<Stack gap="8">
					<Text
						weight="medium"
						size="xSmall"
						color={
							record.disabled
								? 'secondaryContentOnDisabled'
								: 'weak'
						}
					>
						Channels
					</Text>
					<Box display="flex" flexWrap="wrap" gap="4">
						{getAlertNotifyField(record, 'ChannelsToNotify')
							.length > 0 ||
						getAlertNotifyField(record, 'DiscordChannelsToNotify')
							.length > 0 ||
						getAlertNotifyField(
							record,
							'MicrosoftTeamsChannelsToNotify',
						).length > 0 ||
						getAlertNotifyField(record, 'EmailsToNotify').length >
							0 ||
						getAlertNotifyField(record, 'WebhookDestinations')
							.length > 0 ? (
							<>
								{getAlertNotifyField(
									record,
									'ChannelsToNotify',
								).map((channel: SanitizedSlackChannel) => (
									<Tag
										key={channel.webhook_channel_id}
										kind="secondary"
										size="medium"
										shape="basic"
										emphasis="medium"
										disabled={record.disabled}
										iconLeft={<RiSlackFill />}
										onClick={() => navigateToAlert(record)}
									>
										{channel.webhook_channel}
									</Tag>
								))}
								{getAlertNotifyField(
									record,
									'DiscordChannelsToNotify',
								).map((channel: DiscordChannel) => (
									<Tag
										key={channel.id}
										kind="secondary"
										size="medium"
										shape="basic"
										emphasis="medium"
										disabled={record.disabled}
										iconLeft={
											<IconSolidDiscord
												size={12}
												fill={
													vars.theme.interactive.fill
														.secondary.content.text
												}
											/>
										}
										onClick={() => navigateToAlert(record)}
									>
										{channel.name}
									</Tag>
								))}
								{getAlertNotifyField(
									record,
									'MicrosoftTeamsChannelsToNotify',
								).map((channel: MicrosoftTeamsChannel) => (
									<Tag
										key={channel.id}
										kind="secondary"
										size="medium"
										shape="basic"
										emphasis="medium"
										disabled={record.disabled}
										iconLeft={
											<IconSolidMicrosoftTeams
												size={12}
												fill={
													vars.theme.interactive.fill
														.secondary.content.text
												}
											/>
										}
										onClick={() => navigateToAlert(record)}
									>
										{channel.name}
									</Tag>
								))}
								{getAlertNotifyField(
									record,
									'EmailsToNotify',
								).map((email: string) => (
									<Tag
										key={email}
										kind="secondary"
										size="medium"
										shape="basic"
										emphasis="medium"
										disabled={record.disabled}
										iconLeft={<RiMailFill />}
										onClick={() => navigateToAlert(record)}
									>
										{email}
									</Tag>
								))}
								{getAlertNotifyField(
									record,
									'WebhookDestinations',
								).length > 0 && (
									<Tag
										kind="secondary"
										size="medium"
										shape="basic"
										emphasis="medium"
										disabled={record.disabled}
										iconLeft={<IconSolidRefresh />}
										onClick={() => navigateToAlert(record)}
									>
										Webhook enabled
									</Tag>
								)}
							</>
						) : (
							<Tag
								kind="secondary"
								size="medium"
								shape="basic"
								emphasis="medium"
								disabled={record.disabled}
								iconLeft={<IconSolidExclamation />}
								onClick={() => navigateToAlert(record)}
							>
								No notifications enabled
							</Tag>
						)}
					</Box>
				</Stack>
			</Stack>
		</Box>
	)
}

const AlertIcon = ({ type, disabled }: { type: string; disabled: boolean }) => {
	const color = disabled
		? vars.theme.static.content.weak
		: vars.theme.static.content.moderate

	switch (type) {
		case ProductType.Errors:
			return <IconSolidLightningBolt size="20" color={color} />
		case ProductType.Logs:
			return <IconSolidLogs size="16" color={color} />
		case ProductType.Traces:
			return <IconSolidTraces size="20" color={color} />
		case ProductType.Metrics:
			return <IconSolidChartBar size="20" color={color} />
		default:
			return <IconSolidPlayCircle size="20" color={color} />
	}
}

function NewAlertMenu() {
	const { project_id } = useParams<{ project_id: string }>()

	const NEW_ALERT_OPTIONS = [
		{
			title: 'Session alert',
			icon: <IconSolidPlayCircle />,
			href: `/${project_id}/alerts/session/new`,
		},
		{
			title: 'Error alert',
			icon: <IconSolidLightningBolt />,
			href: `/${project_id}/alerts/errors/new`,
		},
		{
			title: 'Log alert',
			icon: <IconSolidLogs />,
			href: `/${project_id}/alerts/logs/new`,
		},
	]
	return (
		<Menu>
			<Menu.Button iconRight={<IconSolidCheveronDown />}>
				Create new alert
			</Menu.Button>
			<Menu.List>
				{NEW_ALERT_OPTIONS.map((option) => (
					<Link key={option.title} to={option.href}>
						<Menu.Item>
							<Box
								display="flex"
								alignItems="center"
								gap="4"
								py="2"
							>
								{option.icon}
								<Text>{option.title}</Text>
							</Box>
						</Menu.Item>
					</Link>
				))}
			</Menu.List>
		</Menu>
	)
}
