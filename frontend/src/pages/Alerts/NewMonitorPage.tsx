import Card from '@components/Card/Card'
import { useCreateMetricMonitorMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	DashboardMetricConfig,
	DiscordChannel,
	MetricAggregator,
	MetricTagFilter,
} from '@graph/schemas'
import { useAlertsContext } from '@pages/Alerts/AlertsContext/AlertsContext'
import MonitorConfiguration from '@pages/Alerts/MonitorConfiguration/MonitorConfiguration'
import { useParams } from '@util/react-router/useParams'
import message from 'antd/lib/message'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useHistory } from 'react-router-dom'

import layoutStyles from '../../components/layout/LeadAlignLayout.module.scss'

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
	const history = useHistory<{ metricConfig?: DashboardMetricConfig }>()
	const metricConfig = history.location.state.metricConfig
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
	const [emails, setEmails] = useState<string[]>([])
	const [units, setUnits] = useState<string>(metricConfig?.units || '')
	const [createMonitor] = useCreateMetricMonitorMutation({
		variables: {
			project_id,
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
		history.push(`/${project_id}/alerts`)
	}

	useEffect(() => {
		// Clear state potentially passed to initialize the metric config.
		history.replace({ ...history.location, state: {} })
	}, [history])

	return (
		<div>
			<Helmet>
				<title>Create New Metric Monitor</title>
			</Helmet>
			<>
				<p className={layoutStyles.subTitle}>
					Monitors are a special type of alert. Monitors will send you
					an alert when a metric exceeds a value.
				</p>
				<Card>
					<MonitorConfiguration
						onAggregateFunctionChange={setAggregator}
						onAggregatePeriodChange={(p) =>
							setPeriodMinutes(Number(p))
						}
						onMonitorNameChange={setMonitorName}
						onMetricToMonitorNameChange={setMetricToMonitorName}
						onSlackChannelsChange={setSlackChannels}
						slackChannels={slackChannels}
						discordChannels={discordChannels}
						onDiscordChannelsChange={setDiscordChannels}
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
						discordChannelSuggestions={discordChannelSuggestions}
						onFormSubmit={onFinish}
						isSlackIntegrated={isSlackIntegrated}
						isDiscordIntegrated={isDiscordIntegrated}
						slackUrl={slackUrl}
						onFormCancel={() => {
							history.push(`/${project_id}/alerts/new`)
						}}
						formCancelButtonLabel="Cancel"
						formSubmitButtonLabel="Create"
						emailSuggestions={emailSuggestions}
						emails={emails}
						onEmailsChange={setEmails}
					/>
				</Card>
			</>
		</div>
	)
}

export default NewMonitorPage
