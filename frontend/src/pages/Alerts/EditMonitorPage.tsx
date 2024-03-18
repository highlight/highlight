import Card from '@components/Card/Card'
import {
	useDeleteMetricMonitorMutation,
	useUpdateMetricMonitorMutation,
} from '@graph/hooks'
import { GetAlertsPagePayloadQuery, namedOperations } from '@graph/operations'
import {
	DiscordChannel,
	MetricAggregator,
	MetricTagFilter,
	WebhookDestination,
} from '@graph/schemas'
import {
	Box,
	Container,
	IconSolidCheveronRight,
	IconSolidSpeakerphone,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext'
import MonitorConfiguration from '@pages/Alerts/MonitorConfiguration/MonitorConfiguration'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'

import analytics from '@/util/analytics'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'

interface Props {
	channelSuggestions: any[]
	discordChannelSuggestions: DiscordChannel[]
	emailSuggestions: string[]
	isSlackIntegrated: boolean
	isDiscordIntegrated: boolean
}

const EditMonitorPage = ({
	channelSuggestions,
	discordChannelSuggestions,
	isSlackIntegrated,
	isDiscordIntegrated,
	emailSuggestions,
}: Props) => {
	const { project_id, id } = useParams<{
		project_id: string
		id: string
	}>()
	const { slackUrl, loading, alertsPayload } = useAlertsContext()
	const existingMonitor = id ? findMonitor(id, alertsPayload) : undefined
	const navigate = useNavigate()
	const [metricToMonitorName, setMetricToMonitorName] = useState<string>()
	const [monitorName, setMonitorName] = useState('')
	const [aggregator, setAggregator] = useState<MetricAggregator>(
		MetricAggregator.P50,
	)
	const [periodMinutes, setPeriodMinutes] = useState<number>(1)
	const [threshold, setThreshold] = useState<number>(1000)
	const [filters, setFilters] = useState<MetricTagFilter[]>([])
	const [units, setUnits] = useState<string>()
	const [slackChannels, setSlackChannels] = useState<string[]>([])
	const [discordChannels, setDiscordChannels] = useState<DiscordChannel[]>([])
	const [webhooks, setWebhooks] = useState<WebhookDestination[]>([])
	const [isDisabled, setIsDisabled] = useState<boolean>(false)
	const [emails, setEmails] = useState<string[]>([])
	const [updateMonitor] = useUpdateMetricMonitorMutation({
		variables: {
			metric_monitor_id: id!,
			project_id: project_id!,
			aggregator,
			periodMinutes: periodMinutes,
			metric_to_monitor: metricToMonitorName,
			name: monitorName,
			slack_channels: slackChannels.map((webhook_channel_id: string) => ({
				webhook_channel_name: channelSuggestions.find(
					(suggestion) =>
						suggestion.webhook_channel_id === webhook_channel_id,
				).webhook_channel,
				webhook_channel_id,
			})),
			discord_channels: discordChannels,
			webhook_destinations: webhooks,
			threshold,
			filters,
			units,
			emails,
			disabled: isDisabled,
		},
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const [deleteMonitor] = useDeleteMetricMonitorMutation({
		variables: {
			metric_monitor_id: id!,
			project_id: project_id!,
		},
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const onFinish = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		updateMonitor()
		message.success('Monitor updated!')
	}

	useEffect(() => {
		if (!loading && existingMonitor) {
			const {
				channels_to_notify,
				aggregator,
				period_minutes: period,
				metric_to_monitor,
				name,
				threshold,
				filters,
				units,
				emails_to_notify,
				disabled,
				discord_channels_to_notify,
				webhook_destinations,
			} = existingMonitor

			setMetricToMonitorName(metric_to_monitor)
			setMonitorName(name)
			setThreshold(threshold)
			setFilters(filters || [])
			setUnits(units || undefined)
			setEmails((emails_to_notify as string[]) || [])
			setSlackChannels(
				channels_to_notify?.map(
					(channel: any) => channel.webhook_channel_id,
				) || [],
			)
			setAggregator(aggregator)
			setPeriodMinutes(period || 1)
			setIsDisabled(disabled)
			setDiscordChannels(discord_channels_to_notify)
			setWebhooks(webhook_destinations)
		}

		if (
			!loading &&
			existingMonitor === undefined &&
			alertsPayload !== undefined
		) {
			message.error("The monitor you tried viewing doesn't exist")
			navigate(`/${project_id}/alerts`)
		}
	}, [alertsPayload, existingMonitor, loading, navigate, project_id])

	useEffect(() => {
		analytics.page('Edit Monitor')
	}, [])

	if (!metricToMonitorName) {
		return null
	}

	return (
		<Box width="full" background="raised" p="8">
			<Helmet>
				<title>Edit Metric Monitor</title>
			</Helmet>
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
				<Container display="flex" flexDirection="column" gap="24">
					<Box style={{ maxWidth: 860 }} my="40" mx="auto">
						<Stack gap="24">
							<Box
								display="flex"
								alignItems="center"
								gap="4"
								color="weak"
							>
								<Tag
									kind="secondary"
									size="medium"
									shape="basic"
									emphasis="high"
									iconLeft={<IconSolidSpeakerphone />}
									onClick={() => {
										navigate(`/${project_id}/alerts`)
									}}
								>
									Alerts
								</Tag>
								<IconSolidCheveronRight />
								<Text
									color="moderate"
									size="small"
									weight="medium"
									userSelect="none"
								>
									Metric monitor
								</Text>
							</Box>
							<p className={layoutStyles.subTitle}>
								Monitors are a special type of alert. Monitors
								will send you an alert when a metric exceeds a
								value.
							</p>
							<Card>
								<MonitorConfiguration
									onAggregateFunctionChange={setAggregator}
									onAggregatePeriodChange={(p) =>
										setPeriodMinutes(Number(p))
									}
									onMonitorNameChange={setMonitorName}
									onMetricToMonitorNameChange={
										setMetricToMonitorName
									}
									onSlackChannelsChange={setSlackChannels}
									discordChannels={discordChannels}
									onDiscordChannelsChange={setDiscordChannels}
									webhooks={webhooks}
									onWebhooksChange={setWebhooks}
									slackChannels={slackChannels}
									onThresholdChange={setThreshold}
									onFiltersChange={setFilters}
									aggregator={aggregator}
									aggregatePeriodMinutes={periodMinutes}
									loading={loading}
									metricToMonitorName={metricToMonitorName}
									monitorName={monitorName}
									threshold={threshold}
									filters={filters}
									units={units}
									onUnitsChange={setUnits}
									channelSuggestions={channelSuggestions}
									discordChannelSuggestions={
										discordChannelSuggestions
									}
									onFormSubmit={onFinish}
									isSlackIntegrated={isSlackIntegrated}
									isDiscordIntegrated={isDiscordIntegrated}
									slackUrl={slackUrl}
									formSubmitButtonLabel="Save"
									onFormDestructiveAction={async () => {
										await deleteMonitor()
										message.success('Monitor deleted!')
										navigate(`/${project_id}/alerts`)
									}}
									formDestructiveButtonLabel="Delete"
									emailSuggestions={emailSuggestions}
									emails={emails}
									onEmailsChange={setEmails}
									disabled={isDisabled}
									setIsDisabled={setIsDisabled}
								/>
							</Card>
						</Stack>
					</Box>
				</Container>
			</Box>
		</Box>
	)
}

export default EditMonitorPage

function findMonitor(id: any, alertsPayload?: GetAlertsPagePayloadQuery) {
	if (!alertsPayload) {
		return undefined
	}

	return alertsPayload.metric_monitors.find((monitor) => monitor?.id === id)
}
