import Button from '@components/Button/Button/Button'
import { StandardDropdown } from '@components/Dropdown/StandardDropdown/StandardDropdown'
import Input from '@components/Input/Input'
import LineChart from '@components/LineChart/LineChart'
import Select from '@components/Select/Select'
import { Skeleton } from '@components/Skeleton/Skeleton'
import Switch from '@components/Switch/Switch'
import { useGetMetricsTimelineQuery } from '@graph/hooks'
import {
	DiscordChannel,
	MetricAggregator,
	MetricTagFilter,
	WebhookDestination,
} from '@graph/schemas'
import { useSlackSync } from '@hooks/useSlackSync'
import { DiscordChannnelsSection } from '@pages/Alerts/AlertConfigurationCard/DiscordChannelsSection'
import { UNIT_OPTIONS } from '@pages/Dashboards/components/DashboardCard/DashboardCard'
import {
	MetricSelector,
	TagFilters,
} from '@pages/Dashboards/components/EditMetricModal/EditMetricModal'
import { useApplicationContext } from '@routers/AppRouter/context/ApplicationContext'
import { useParams } from '@util/react-router/useParams'
import { Slider } from 'antd'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import SlackLoadOrConnect from '@/pages/Alerts/AlertConfigurationCard/SlackLoadOrConnect'

import alertConfigurationCardStyles from '../AlertConfigurationCard/AlertConfigurationCard.module.css'
import styles from './MonitorConfiguration.module.css'

// show the last 5 periods
const PREVIEW_PERIODS = 5

interface Props {
	loading: boolean
	metricToMonitorName: string
	onMetricToMonitorNameChange: (newMetric: string) => void
	monitorName: string
	onMonitorNameChange: (newName: string) => void
	aggregator: MetricAggregator
	aggregatePeriodMinutes: number
	onAggregateFunctionChange: (newAggregateFunction: MetricAggregator) => void
	onAggregatePeriodChange: (newPeriod: string) => void
	threshold: number
	onThresholdChange: (newThreshold: number) => void
	filters: MetricTagFilter[]
	onFiltersChange: (newFilters: MetricTagFilter[]) => void
	units?: string
	onUnitsChange: (newUnits: string) => void
	slackChannels: string[]
	onSlackChannelsChange: (newChannels: string[]) => void
	discordChannels: DiscordChannel[]
	onDiscordChannelsChange: (discordChannels: DiscordChannel[]) => void
	webhooks: WebhookDestination[]
	onWebhooksChange: (webhooks: WebhookDestination[]) => void
	emails: string[]
	onEmailsChange: (newEmails: string[]) => void
	onFormSubmit: (values: any) => void
	channelSuggestions: any[]
	discordChannelSuggestions: DiscordChannel[]
	emailSuggestions: string[]
	isSlackIntegrated: boolean
	isDiscordIntegrated: boolean
	slackUrl: string
	formSubmitButtonLabel: string
	formCancelButtonLabel?: string
	formDestructiveButtonLabel?: string
	onFormDestructiveAction?: () => void
	onFormCancel?: () => void
	disabled?: boolean
	setIsDisabled?: (newValue: boolean) => void
}

const MonitorConfiguration = ({
	loading,
	aggregator,
	aggregatePeriodMinutes,
	metricToMonitorName,
	monitorName,
	emails,
	onEmailsChange,
	webhooks,
	onWebhooksChange,
	threshold,
	filters,
	onFormSubmit,
	channelSuggestions,
	emailSuggestions,
	isSlackIntegrated,
	isDiscordIntegrated,
	slackUrl,
	formSubmitButtonLabel,
	formCancelButtonLabel,
	onFormCancel,
	onAggregateFunctionChange,
	onAggregatePeriodChange,
	onMonitorNameChange,
	onMetricToMonitorNameChange,
	onThresholdChange,
	onFiltersChange,
	units,
	onUnitsChange,
	onSlackChannelsChange,
	onDiscordChannelsChange,
	slackChannels,
	discordChannels,
	discordChannelSuggestions,
	formDestructiveButtonLabel,
	onFormDestructiveAction,
	disabled,
	setIsDisabled,
}: Props) => {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { currentWorkspace } = useApplicationContext()
	const [searchQuery, setSearchQuery] = useState('')
	const { slackLoading, syncSlack } = useSlackSync()
	const [endDate] = React.useState<moment.Moment>(moment(new Date()))
	const { data, loading: metricPreviewLoading } = useGetMetricsTimelineQuery({
		variables: {
			project_id: project_id!,
			metric_name: metricToMonitorName,
			params: {
				aggregator,
				date_range: {
					start_date: moment(endDate)
						.subtract(
							PREVIEW_PERIODS * aggregatePeriodMinutes,
							'minutes',
						)
						.toISOString(),
					end_date: endDate.toISOString(),
				},
				filters,
				resolution_minutes: aggregatePeriodMinutes,
				units: units || undefined,
			},
		},
		skip: !project_id,
	})

	const format = useMemo(() => {
		return aggregatePeriodMinutes > (24 / PREVIEW_PERIODS) * 60
			? 'D MMM h:mm A'
			: 'h:mm A'
	}, [aggregatePeriodMinutes])

	const graphData = useMemo(() => {
		if (loading) {
			return []
		}

		if (!data?.metrics_timeline.length) {
			const now = new Date()
			const pointsToGenerate = 100
			return Array.from(new Array(pointsToGenerate)).map((_, index) => {
				const randomValue = Math.random() * 1000
				return {
					value: randomValue,
					date: moment(now)
						.subtract(pointsToGenerate - index, 'minutes')
						.format(),
				}
			})
		} else {
			return data.metrics_timeline.map((point) => ({
				value: point?.value,
				date: moment(point?.date).format(),
			}))
		}
	}, [data, loading])
	const graphMin = useMemo(() => {
		return (
			Math.floor(Math.min(...graphData.map((x) => x.value || 0)) / 10) *
			10
		)
	}, [graphData])
	const graphMax = useMemo(() => {
		return (
			Math.ceil(Math.max(...graphData.map((x) => x.value || 0)) / 10) * 10
		)
	}, [graphData])

	const periodOptions = [
		{ label: '1 minute', value: 1 },
		{ label: '5 minutes', value: 5 },
		{ label: '15 minutes', value: 15 },
		{ label: '30 minutes', value: 30 },
		{ label: '1 hour', value: 60 },
		{ label: '6 hours', value: 6 * 60 },
		{ label: '12 hours', value: 12 * 60 },
		{ label: '1 day', value: 24 * 60 },
	] as { label: string; value: number }[]

	const channels = channelSuggestions.map(
		({ webhook_channel, webhook_channel_id }) => ({
			displayValue: webhook_channel,
			value: webhook_channel_id,
			id: webhook_channel_id,
		}),
	)

	const emailOptions = emailSuggestions.map((email) => ({
		displayValue: email,
		value: email,
		id: email,
	}))

	return (
		<div>
			<div className={styles.chartContainer}>
				{metricPreviewLoading || graphData.length === 0 ? (
					<Skeleton height="231px" />
				) : (
					<>
						<div className="relative float-right h-full w-full pb-5">
							<LineChart
								domain={[
									graphMin,
									Math.max(graphMax, threshold),
								]}
								data={graphData}
								hideLegend
								xAxisDataKeyName="date"
								xAxisTickFormatter={(tickItem) =>
									moment(tickItem).format(format)
								}
								lineColorMapping={{
									value: 'var(--color-blue-400)',
								}}
								yAxisLabel={units || ''}
								referenceAreaProps={
									graphData.length > 0
										? {
												x1: moment(
													graphData[0].date,
												).format(format),
												y1: threshold,
												fill: 'var(--color-red-200)',
												fillOpacity: 0.3,
										  }
										: undefined
								}
								referenceLines={[
									{
										value: threshold,
										color: 'var(--color-red-400)',
									},
								]}
								xAxisProps={{
									tickLine: {
										stroke: 'var(--color-gray-600)',
									},
									axisLine: {
										stroke: 'var(--color-gray-600)',
									},
								}}
							/>
							<div
								style={{
									height: 163,
									position: 'absolute',
									top: 0,
									right: 14,
								}}
							>
								<Slider
									vertical
									className={styles.slider}
									trackStyle={{ background: 'transparent' }}
									tooltipPlacement="bottom"
									min={graphMin}
									max={Math.max(graphMax, threshold)}
									value={threshold}
									onChange={(v) => {
										onThresholdChange(v)
									}}
								/>
							</div>
						</div>
					</>
				)}
			</div>
			<form
				name="newMonitor"
				onSubmit={onFormSubmit}
				autoComplete="off"
				className="flex flex-col gap-2"
			>
				<section>
					<h3>Metric to Monitor</h3>
					<p>
						Select which metric you'd like to create a monitor for.
					</p>
					<MetricSelector
						onSelectMetric={(e) => {
							onMetricToMonitorNameChange(e)
							onFiltersChange([])
						}}
						currentMetric={metricToMonitorName}
					/>
				</section>

				<section>
					<h3>Filters</h3>
					<p>
						Filter the metric values based on custom tags. For
						example, monitor latency for a particular URL.
					</p>
					<TagFilters
						metricName={metricToMonitorName}
						onSelectTags={(t) => onFiltersChange(t)}
						currentTags={filters}
					/>
				</section>

				<section>
					<h3>Function</h3>
					<p>
						Select the function that will aggregate the value. The
						aggregated value will be used to compare against the
						threshold when deciding whether to create an alert.
					</p>
					<Select
						options={Object.values(MetricAggregator).map((v) => ({
							displayValue: v,
							id: v,
							value: v,
						}))}
						className={styles.select}
						value={aggregator}
						onChange={(e) => {
							onAggregateFunctionChange(e)
						}}
					/>
				</section>

				<section>
					<h3>Period</h3>
					<p>
						This aggregation window will be used to determine if the
						value is exceeding the threshold. For example, if set to
						5 minutes with an aggregator function of P50, a 5 minute
						window median must exceed the threshold for an alert.
					</p>
					<Select
						options={periodOptions.map((o) => ({
							displayValue: o.label,
							id: o.value.toString(),
							value: o.value.toString(),
						}))}
						className={styles.select}
						value={aggregatePeriodMinutes.toString()}
						onChange={(e) => {
							onAggregatePeriodChange(e)
						}}
					/>
				</section>

				<section>
					<h3>Threshold</h3>
					<p>
						An alert will be created if{' '}
						<code>
							<b
								style={{
									color: 'var(--color-blue-400)',
								}}
							>
								{aggregator}({metricToMonitorName})
							</b>
						</code>{' '}
						is over{' '}
						<b style={{ color: 'var(--color-red-400)' }}>
							{threshold}
						</b>
						.
					</p>
					<div className={styles.thresholdRow}>
						<Input
							className={styles.threshold}
							value={threshold}
							onChange={(e) => {
								onThresholdChange(
									e.target.value as unknown as number,
								)
							}}
						/>
						<StandardDropdown
							className={styles.thresholdUnits}
							data={UNIT_OPTIONS}
							value={
								UNIT_OPTIONS.filter(
									(x) => x.value === (units || ''),
								)[0]
							}
							onSelect={(value) =>
								onUnitsChange(value || undefined)
							}
						/>
					</div>
				</section>

				<section>
					<h3>Name</h3>
					<p>
						Add a name for your monitor. This makes it easier to
						find later. This can be changed at anytime.
					</p>
					<Input
						value={monitorName}
						onChange={(e) => {
							onMonitorNameChange(e.target.value)
						}}
					/>
				</section>

				<section>
					<h3>Slack Channels to Notify</h3>
					<p>
						Pick Slack channels or people to message when an alert
						is created.
					</p>
					<Select
						className={alertConfigurationCardStyles.channelSelect}
						options={channels}
						mode="multiple"
						onFocus={syncSlack}
						onSearch={(value) => {
							setSearchQuery(value)
						}}
						value={slackChannels}
						onChange={onSlackChannelsChange}
						filterOption={(searchValue, option) => {
							return (
								option?.children
									?.toString()
									.toLowerCase()
									.includes(searchValue.toLowerCase()) ||
								false
							)
						}}
						placeholder="Select a channel(s) or person(s) to send the alert to."
						notFoundContent={
							<SlackLoadOrConnect
								isLoading={slackLoading}
								searchQuery={searchQuery}
								isSlackIntegrated={isSlackIntegrated}
								slackUrl={slackUrl}
							/>
						}
					/>
				</section>

				{isDiscordIntegrated && (
					<DiscordChannnelsSection
						options={discordChannelSuggestions}
						selectedChannels={discordChannels}
						onChannelsChange={onDiscordChannelsChange}
						defaultName="the alert"
					/>
				)}

				<section>
					<h3>Emails to Notify</h3>
					<p>
						Pick email addresses to email when an alert is created.
						These are email addresses for people in your workspace.
					</p>
					<Select
						className={alertConfigurationCardStyles.channelSelect}
						options={emailOptions}
						value={emails}
						mode="multiple"
						filterOption={(searchValue, option) => {
							return (
								option?.children
									?.toString()
									.toLowerCase()
									.includes(searchValue.toLowerCase()) ||
								false
							)
						}}
						placeholder="Select email addresses to send the alert to."
						onChange={onEmailsChange}
						notFoundContent={
							<div
								className={
									alertConfigurationCardStyles.notFoundContentEmail
								}
							>
								No matching email address found. Do you want to{' '}
								<Link to={`/w/${currentWorkspace?.id}/team`}>
									invite someone to the workspace?
								</Link>
							</div>
						}
					/>
				</section>

				<section>
					<h3>Webhooks to Notify</h3>
					<p>
						Add webhook destinations for this alert, sent as JSON
						over HTTP. See the{' '}
						<Link to="https://www.highlight.io/docs/general/product-features/general-features/webhooks">
							docs
						</Link>{' '}
						for more info.
					</p>
					<Select
						className={alertConfigurationCardStyles.channelSelect}
						value={webhooks.map((wh) => wh.url)}
						mode="tags"
						placeholder="Select webhook web addresses to send the alert to."
						onChange={(whs: string[]) =>
							onWebhooksChange(whs.map((wh) => ({ url: wh })))
						}
					/>
				</section>

				<div className={styles.formFooter}>
					{setIsDisabled !== undefined && (
						<Switch
							label="Enable"
							trackingId="MonitorEnable"
							checked={!disabled}
							size="default"
							onChange={(e) => {
								setIsDisabled(!e)
							}}
						/>
					)}
					<div className={styles.actionsContainer}>
						{onFormCancel && (
							<Button
								trackingId="CancelCreateMonitor"
								type="default"
								className={
									alertConfigurationCardStyles.saveButton
								}
								onClick={() => {
									onFormCancel()
								}}
							>
								{formCancelButtonLabel}
							</Button>
						)}
						{onFormDestructiveAction && (
							<Button
								trackingId="DestructiveCreateMonitor"
								danger
								type="default"
								className={
									alertConfigurationCardStyles.saveButton
								}
								onClick={() => {
									onFormDestructiveAction()
								}}
							>
								{formDestructiveButtonLabel}
							</Button>
						)}
						<Button
							trackingId="CreateMonitor"
							htmlType="submit"
							className={alertConfigurationCardStyles.saveButton}
							type="primary"
							disabled={!metricToMonitorName}
						>
							{formSubmitButtonLabel}
						</Button>
					</div>
				</div>
			</form>
		</div>
	)
}

export default MonitorConfiguration
