import { Button } from '@components/Button'
import Select from '@components/Select/Select'
import { toast } from '@components/Toaster'
import {
	useCreateLogAlertMutation,
	useDeleteLogAlertMutation,
	useGetLogAlertQuery,
	useGetMetricsQuery,
	useUpdateLogAlertMutation,
} from '@graph/hooks'
import {
	Ariakit,
	Badge,
	Box,
	Column,
	Container,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	Form,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidCheveronUp,
	IconSolidSpeakerphone,
	Menu,
	presetStartDate,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { useSlackSync } from '@hooks/useSlackSync'
import {
	DEFAULT_FREQUENCY,
	FREQUENCIES,
} from '@pages/Alerts/AlertConfigurationCard/AlertConfigurationConstants'
import { useLogAlertsContext } from '@pages/Alerts/LogAlert/context'
import { AlertForm } from '@pages/Alerts/utils/AlertsUtils'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { useParams } from '@util/react-router/useParams'
import { capitalize } from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'

import { getSlackUrl } from '@/components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import LoadingBox from '@/components/LoadingBox'
import { SearchContext } from '@/components/Search/SearchContext'
import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'
import { Search } from '@/components/Search/SearchForm/SearchForm'
import { namedOperations } from '@/graph/generated/operations'
import { MetricAggregator, ProductType } from '@/graph/generated/schemas'
import { useSearchTime } from '@/hooks/useSearchTime'
import SlackLoadOrConnect from '@/pages/Alerts/AlertConfigurationCard/SlackLoadOrConnect'
import AlertTitleField from '@/pages/Alerts/components/AlertTitleField/AlertTitleField'
import { TIMESTAMP_KEY } from '@/pages/Graphing/components/Graph'
import analytics from '@/util/analytics'

import * as styles from './styles.css'

const LOG_ALERT_MINIMUM_FREQUENCY = 15

export const LogAlertPage = () => {
	const { startDate, endDate, selectedPreset, updateSearchTime } =
		useSearchTime({
			presets: DEFAULT_TIME_PRESETS,
			initialPreset: DEFAULT_TIME_PRESETS[0],
		})

	const { projectId } = useProjectId()

	const [queryParam] = useQueryParam('query', StringParam)
	const [initialQuery, setInitialQuery] = useState(queryParam ?? '')
	const [submittedQuery, setSubmittedQuery] = useState(queryParam ?? '')

	const { alert_id } = useParams<{
		alert_id: string
	}>()

	const isCreate = alert_id === undefined
	const createStr = isCreate ? 'create' : 'update'

	const { data, loading } = useGetLogAlertQuery({
		variables: {
			id: alert_id || 'never',
		},
		skip: !alert_id,
	})

	const formStore = Form.useStore<LogMonitorForm>({
		defaultValues: {
			query: initialQuery,
			name: '',
			belowThreshold: false,
			slackChannels: [],
			discordChannels: [],
			microsoftTeamsChannels: [],
			webhookDestinations: [],
			emails: [],
			threshold: undefined,
			threshold_window: Number(DEFAULT_FREQUENCY),
			frequency: Number(DEFAULT_FREQUENCY),
			loaded: false,
		},
	})
	const formValues = formStore.useState('values')

	const handleUpdateInputQuery = (query: string) => {
		setSubmittedQuery(query)
		formStore.setValue(formStore.names.query, query)
	}

	formStore.useSubmit(() => {
		setSubmittedQuery(formValues.query)
	})

	useEffect(() => {
		if (!loading && data) {
			setInitialQuery(data?.log_alert.query)
			setSubmittedQuery(data?.log_alert.query)
			formStore.setValues({
				query: data?.log_alert.query,
				name: data?.log_alert.Name,
				belowThreshold: data?.log_alert.BelowThreshold,
				slackChannels: data?.log_alert.ChannelsToNotify.map((c) => ({
					...c,
					webhook_channel_name: c.webhook_channel,
					displayValue: c.webhook_channel,
					value: c.webhook_channel_id,
					id: c.webhook_channel_id,
				})),
				discordChannels: data?.log_alert.DiscordChannelsToNotify.map(
					(c) => ({
						...c,
						displayValue: c.name,
						value: c.id,
						id: c.id,
					}),
				),
				microsoftTeamsChannels:
					data?.log_alert.MicrosoftTeamsChannelsToNotify.map((c) => ({
						...c,
						displayValue: c.name,
						value: c.id,
						id: c.id,
					})),
				webhookDestinations: data?.log_alert.WebhookDestinations.map(
					(d) => d.url,
				),
				emails: data?.log_alert.EmailsToNotify,
				threshold: data?.log_alert.CountThreshold,
				threshold_window: Number(DEFAULT_FREQUENCY),
				frequency: data?.log_alert.ThresholdWindow,
				loaded: true,
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, loading])

	useEffect(() => {
		analytics.page('Log Alert', { isCreate })
	}, [isCreate])

	const [createLogAlertMutation] = useCreateLogAlertMutation({
		refetchQueries: [
			namedOperations.Query.GetLogAlert,
			namedOperations.Query.GetAlertsPagePayload,
		],
	})
	const [updateLogAlertMutation] = useUpdateLogAlertMutation({
		refetchQueries: [
			namedOperations.Query.GetLogAlert,
			namedOperations.Query.GetAlertsPagePayload,
		],
	})
	const [deleteLogAlertMutation] = useDeleteLogAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const { project_id } = useParams<{
		project_id: string
	}>()

	const navigate = useNavigate()

	const belowThreshold = formValues.belowThreshold
	const threshold = formValues.threshold
	const frequency = formValues.frequency

	const header = (
		<Box
			display="flex"
			justifyContent="flex-end"
			alignItems="center"
			borderBottom="dividerWeak"
			px="8"
			py="6"
			cssClass={styles.header}
		>
			<Box display="flex" alignItems="center" gap="4">
				<Button
					kind="secondary"
					size="small"
					emphasis="low"
					trackingId="closeLogMonitoringAlert"
					onClick={() => {
						navigate(-1)
					}}
				>
					Cancel
				</Button>
				{!isCreate && (
					<Button
						kind="danger"
						size="small"
						emphasis="low"
						trackingId="deleteLogMonitoringAlert"
						onClick={() => {
							deleteLogAlertMutation({
								variables: {
									project_id: project_id ?? '',
									id: alert_id,
								},
							})
								.then(() => {
									toast.success(`Log alert deleted!`)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									toast.error(`Failed to delete log alert!`)
								})
						}}
					>
						Delete Alert
					</Button>
				)}
				<Button
					kind="primary"
					size="small"
					emphasis="high"
					trackingId="saveLogMonitoringAlert"
					onClick={() => {
						const input = {
							count_threshold: formValues.threshold!,
							below_threshold: formValues.belowThreshold,
							disabled: false,
							discord_channels: formValues.discordChannels.map(
								(c) => ({
									name: c.name,
									id: c.id,
								}),
							),
							microsoft_teams_channels:
								formValues.microsoftTeamsChannels.map((c) => ({
									name: c.name,
									id: c.id,
								})),
							emails: formValues.emails,
							name: formValues.name,
							project_id: project_id || '0',
							slack_channels: formValues.slackChannels.map(
								(c) => ({
									webhook_channel_id: c.webhook_channel_id,
									webhook_channel_name:
										c.webhook_channel_name,
								}),
							),
							webhook_destinations: formStore
								.getValue(formStore.names.webhookDestinations)
								.map((d: string) => ({ url: d })),
							threshold_window: formValues.frequency,
							query: formValues.query,
						}

						const nameErr = !input.name
						const thresholdErr =
							!input.count_threshold || input.count_threshold < 0
						const queryErr = !input.query
						if (nameErr || thresholdErr || queryErr) {
							const errs = []
							if (nameErr) {
								formStore.setError(
									formStore.names.name,
									'Name is required',
								)
								errs.push('name')
							}

							if (thresholdErr) {
								formStore.setError(
									formStore.names.threshold,
									'Threshold cannot be less than 0',
								)
								errs.push('threshold')
							}

							if (queryErr) {
								formStore.setError(
									formStore.names.query,
									'Query is required',
								)
								errs.push('query')
							}

							toast.error(
								`Missing required field(s): ${errs.join(
									', ',
								)}.`,
							)

							return
						}

						if (isCreate) {
							createLogAlertMutation({
								variables: {
									input,
								},
							})
								.then(() => {
									toast.success(`Log alert ${createStr}d!`)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									toast.error(
										`Failed to ${createStr} log alert!`,
									)
								})
						} else {
							updateLogAlertMutation({
								variables: {
									id: alert_id,
									input,
								},
							})
								.then(() => {
									toast.success(`Log alert ${createStr}d!`)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									toast.error(
										`Failed to ${createStr} log alert!`,
									)
								})
						}
					}}
				>
					{capitalize(createStr)} alert
				</Button>
			</Box>
		</Box>
	)

	const { data: histogramData, loading: histogramLoading } =
		useGetMetricsQuery({
			variables: {
				product_type: ProductType.Logs,
				project_id: project_id!,
				params: {
					query: submittedQuery,
					date_range: {
						start_date: moment(startDate).format(TIME_FORMAT),
						end_date: moment(endDate).format(TIME_FORMAT),
					},
				},
				column: '',
				metric_types: MetricAggregator.Count,
				group_by: 'level',
				bucket_by: TIMESTAMP_KEY,
				bucket_count: 48,
			},
			skip: !projectId,
		})

	const isLoading = !isCreate && !formValues.loaded

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
				{isLoading && <LoadingBox />}
				{!isLoading && (
					<>
						{header}
						<Container
							display="flex"
							flexDirection="column"
							py="24"
							gap="40"
						>
							<Form store={formStore} resetOnSubmit={false}>
								<Stack gap="40">
									<Box
										display="flex"
										flexDirection="column"
										width="full"
										height="full"
										gap="12"
									>
										<Box
											display="flex"
											alignItems="center"
											width="full"
											justifyContent="space-between"
										>
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
													iconLeft={
														<IconSolidSpeakerphone />
													}
													onClick={() => {
														navigate(
															`/${project_id}/alerts`,
														)
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
													Log monitor
												</Text>
											</Box>
											<DateRangePicker
												emphasis="medium"
												selectedValue={{
													startDate,
													endDate,
													selectedPreset,
												}}
												onDatesChange={updateSearchTime}
												presets={DEFAULT_TIME_PRESETS}
												minDate={presetStartDate(
													DEFAULT_TIME_PRESETS[5],
												)}
											/>
										</Box>
										<AlertTitleField />
										<Box
											cssClass={styles.queryContainer}
											style={{
												borderColor: formStore.getError(
													'query',
												)
													? 'var(--color-red-500)'
													: undefined,
											}}
										>
											<SearchContext
												initialQuery={initialQuery}
												onSubmit={
													handleUpdateInputQuery
												}
											>
												<Search
													startDate={startDate}
													endDate={endDate}
													hideIcon
													placeholder="Define query..."
													productType={
														ProductType.Logs
													}
												/>
											</SearchContext>
										</Box>
										<LogsHistogram
											startDate={startDate}
											endDate={endDate}
											onDatesChange={updateSearchTime}
											outline
											threshold={threshold}
											belowThreshold={belowThreshold}
											frequencySeconds={frequency}
											metrics={histogramData}
											loading={histogramLoading}
										/>
									</Box>
									<LogAlertForm />
								</Stack>
							</Form>
						</Container>
					</>
				)}
			</Box>
		</Box>
	)
}

const LogAlertForm = () => {
	const { projectId } = useProjectId()
	const formStore = Form.useContext() as Ariakit.FormStore<LogMonitorForm>
	const errors = formStore.useState('errors')

	const { alertsPayload } = useLogAlertsContext()
	const { slackLoading, syncSlack } = useSlackSync()
	const [slackSearchQuery, setSlackSearchQuery] = useState('')

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

	const microsoftTeamsChannels = (
		alertsPayload?.microsoft_teams_channel_suggestions ?? []
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
		<Box cssClass={styles.grid}>
			<Stack gap="12">
				<Box
					cssClass={styles.sectionHeader}
					justifyContent="space-between"
				>
					<Text size="large" weight="bold" color="strong">
						Alert conditions
					</Text>
					<Menu>
						<ThresholdTypeConfiguration />
					</Menu>
				</Box>
				<Box borderTop="dividerWeak" width="full" />
				<Column.Container gap="12">
					<Column>
						<Form.Input
							name={formStore.names.threshold}
							type="number"
							label="Alert threshold"
							tag={
								<Badge
									shape="basic"
									variant="red"
									size="small"
									label="Red"
								/>
							}
							style={{
								borderColor: errors.threshold
									? 'var(--color-red-500)'
									: undefined,
							}}
						/>
					</Column>

					<Column>
						<Form.Select
							label="Alert frequency"
							name={formStore.names.frequency.toString()}
							onChange={(e) =>
								formStore.setValue(
									formStore.names.frequency,
									e.target.value,
								)
							}
						>
							<option value="" disabled>
								Select alert frequency
							</option>
							{FREQUENCIES.filter(
								(freq) =>
									Number(freq.value) >=
									LOG_ALERT_MINIMUM_FREQUENCY,
							).map((freq: any) => (
								<option
									key={freq.id}
									value={Number(freq.value)}
								>
									{freq.displayValue}
								</option>
							))}
						</Form.Select>
					</Column>
				</Column.Container>
			</Stack>
			<Stack gap="12">
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
									slackUrl={getSlackUrl(projectId ?? '')}
									isSlackIntegrated={
										alertsPayload?.is_integrated_with_slack ??
										false
									}
								/>
							}
							className={styles.selectContainer}
							mode="multiple"
							labelInValue
							value={formStore.getValue(
								formStore.names.slackChannels,
							)}
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
							value={formStore.getValue(
								formStore.names.discordChannels,
							)}
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
								formStore.setValue(
									formStore.names.emails,
									values,
								)
							}
							notFoundContent={<p>No email suggestions</p>}
							className={styles.selectContainer}
							mode="multiple"
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
			</Stack>
		</Box>
	)
}

const ThresholdTypeConfiguration = () => {
	const form = Form.useContext()!
	const menu = Menu.useContext()!
	const menuState = menu.getState()
	const belowThreshold = form.useValue('belowThreshold')

	return (
		<>
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="high"
				cssClass={styles.thresholdTypeButton}
				iconRight={
					menuState.open ? (
						<IconSolidCheveronUp />
					) : (
						<IconSolidCheveronDown />
					)
				}
			>
				{belowThreshold ? 'Below' : 'Above'} threshold
			</Menu.Button>
			<Menu.List>
				<Menu.Item
					onClick={() => {
						form.setValue('belowThreshold', false)
					}}
				>
					Above threshold
				</Menu.Item>
				<Menu.Item
					onClick={() => {
						form.setValue('belowThreshold', true)
					}}
				>
					Below threshold
				</Menu.Item>
			</Menu.List>
		</>
	)
}

interface LogMonitorForm extends Omit<AlertForm, 'excludedEnvironments'> {
	query: string
}

export default LogAlertPage
