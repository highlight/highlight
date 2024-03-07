import Card from '@components/Card/Card'
import { useCreateMetricMonitorMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
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
import message from 'antd/es/message'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useNavigate } from 'react-router-dom'

import analytics from '@/util/analytics'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.css'

interface Props {
	channelSuggestions: any[]
	emailSuggestions: string[]
	discordChannelSuggestions: DiscordChannel[]
	isSlackIntegrated: boolean
	isDiscordIntegrated: boolean
}

const NewMonitorPage = ({
	channelSuggestions,
	discordChannelSuggestions,
	isSlackIntegrated,
	isDiscordIntegrated,
	emailSuggestions,
}: Props) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { slackUrl, loading } = useAlertsContext()
	const navigate = useNavigate()
	const location = useLocation()
	const metricConfig = location.state.metricConfig
	const [metricToMonitorName, setMetricToMonitorName] = useState<string>(
		metricConfig?.name || 'LCP',
	)
	const [monitorName, setMonitorName] = useState('New Monitor')
	const [aggregator, setAggregator] = useState<MetricAggregator>(
		MetricAggregator.P50,
	)
	const [periodMinutes, setPeriodMinutes] = useState<number>(1)
	const [threshold, setThreshold] = useState<number>(1000)
	const [filters, setFilters] = useState<MetricTagFilter[]>(
		metricConfig?.filters || [],
	)
	const [slackChannels, setSlackChannels] = useState<string[]>([])
	const [discordChannels, setDiscordChannels] = useState<DiscordChannel[]>([])
	const [webhooks, setWebhooks] = useState<WebhookDestination[]>([])
	const [emails, setEmails] = useState<string[]>([])
	const [units, setUnits] = useState<string>(metricConfig?.units || '')
	const [createMonitor] = useCreateMetricMonitorMutation({
		variables: {
			project_id: project_id!,
			aggregator,
			periodMinutes: periodMinutes,
			metric_to_monitor: metricToMonitorName || '',
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
		},
		refetchQueries: [
			namedOperations.Query.GetAlertsPagePayload,
			namedOperations.Query.GetMetricMonitors,
		],
	})

	const onFinish = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		createMonitor()
		message.success(`Created ${monitorName} monitor!`)
		navigate(`/${project_id}/alerts`)
	}

	useEffect(() => {
		// Clear state potentially passed to initialize the metric config.
		navigate(location.pathname, { state: {} })
	}, [location.pathname, navigate])

	useEffect(() => {
		analytics.page('Create Monitor')
	}, [])

	return (
		<Box width="full" background="raised" p="8">
			<Helmet>
				<title>Create New Metric Monitor</title>
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
									slackChannels={slackChannels}
									discordChannels={discordChannels}
									onDiscordChannelsChange={setDiscordChannels}
									webhooks={webhooks}
									onWebhooksChange={setWebhooks}
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
									onFormCancel={() => {
										navigate(`/${project_id}/alerts/new`)
									}}
									formCancelButtonLabel="Cancel"
									formSubmitButtonLabel="Create"
									emailSuggestions={emailSuggestions}
									emails={emails}
									onEmailsChange={setEmails}
								/>
							</Card>
						</Stack>
					</Box>
				</Container>
			</Box>
		</Box>
	)
}

export default NewMonitorPage
