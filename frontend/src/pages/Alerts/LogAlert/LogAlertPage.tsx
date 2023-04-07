import { Button } from '@components/Button'
import Select from '@components/Select/Select'
import {
	useCreateLogAlertMutation,
	useDeleteLogAlertMutation,
	useGetLogAlertQuery,
	useGetLogsKeysQuery,
	useUpdateLogAlertMutation,
} from '@graph/hooks'
import { DiscordChannel, SanitizedSlackChannel } from '@graph/schemas'
import {
	Badge,
	Box,
	Column,
	Container,
	Form,
	FormState,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidCheveronUp,
	IconSolidSpeakerphone,
	Menu,
	PreviousDateRangePicker,
	Stack,
	Tag,
	Text,
	useForm,
	useFormState,
	useMenu,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { useLogAlertsContext } from '@pages/Alerts/LogAlert/context'
import {
	dedupeEnvironments,
	EnvironmentSuggestion,
} from '@pages/Alerts/utils/AlertsUtils'
import {
	LOG_TIME_FORMAT,
	LOG_TIME_PRESETS,
	now,
	thirtyDaysAgo,
} from '@pages/LogsPage/constants'
import LogsHistogram from '@pages/LogsPage/LogsHistogram/LogsHistogram'
import { Search } from '@pages/LogsPage/SearchForm/SearchForm'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { capitalize } from 'lodash'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import * as styles from './styles.css'

export const LogAlertPage = () => {
	const [selectedDates, setSelectedDates] = useState([
		LOG_TIME_PRESETS[0].startDate,
		now.toDate(),
	])

	const [startDate, setStartDate] = useState(LOG_TIME_PRESETS[0].startDate)
	const [endDate, setEndDate] = useState(now.toDate())

	const { alert_id } = useParams<{
		alert_id: string
	}>()

	const isCreate = alert_id === undefined
	const createStr = isCreate ? 'create' : 'update'

	useEffect(() => {
		if (selectedDates.length === 2) {
			setStartDate(selectedDates[0])
			setEndDate(selectedDates[1])
		}
	}, [selectedDates])

	const { data, loading } = useGetLogAlertQuery({
		variables: {
			id: alert_id || 'never',
		},
		skip: !alert_id,
	})

	const form = useFormState<LogMonitorForm>({
		defaultValues: {
			query: '',
			name: '',
			belowThreshold: false,
			excludedEnvironments: [],
			slackChannels: [],
			discordChannels: [],
			webhookDestinations: [],
			emails: [],
			threshold: undefined,
			frequency: 15,
		},
	})

	useEffect(() => {
		if (!loading && data) {
			form.setValues({
				query: data?.log_alert.query,
				name: data?.log_alert.Name,
				belowThreshold: data?.log_alert.BelowThreshold,
				excludedEnvironments: data?.log_alert.ExcludedEnvironments,
				slackChannels: data?.log_alert.ChannelsToNotify,
				discordChannels: data?.log_alert.DiscordChannelsToNotify,
				webhookDestinations: data?.log_alert.WebhookDestinations.map(
					(d) => d.url,
				),
				emails: data?.log_alert.EmailsToNotify,
				threshold: data?.log_alert.CountThreshold,
				frequency: data?.log_alert.ThresholdWindow,
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, loading])

	const [createLogAlertMutation] = useCreateLogAlertMutation()
	const [updateLogAlertMutation] = useUpdateLogAlertMutation()
	const [deleteLogAlertMutation] = useDeleteLogAlertMutation()

	const { project_id } = useParams<{
		project_id: string
	}>()

	const navigate = useNavigate()

	const query = form.values.query
	const belowThreshold = form.values.belowThreshold
	const threshold = form.values.threshold
	const frequency = form.values.frequency

	const header = (
		<Box
			display="flex"
			justifyContent="space-between"
			alignItems="center"
			borderBottom="dividerWeak"
			px="8"
			py="6"
			cssClass={styles.header}
		>
			<Text userSelect="none">
				{capitalize(createStr)} log monitoring alert
			</Text>
			<Box display="flex" alignItems="center" gap="4">
				<Button
					kind="secondary"
					size="small"
					emphasis="low"
					trackingId="closeLogMonitoringAlert"
					onClick={() => {
						navigate(`/${project_id}/alerts`)
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
									message.success(`Log alert deleted!`)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									message.error(`Failed to delete log alert!`)
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
							count_threshold: form.getValue(
								form.names.threshold,
							),
							below_threshold: form.getValue(
								form.names.belowThreshold,
							),
							disabled: false,
							discord_channels: form.getValue(
								form.names.discordChannels,
							),
							emails: form.getValue(form.names.emails),
							environments: form.getValue(
								form.names.excludedEnvironments,
							),
							name: form.getValue(form.names.name),
							project_id: project_id || '0',
							slack_channels: form.getValue(
								form.names.slackChannels,
							),
							webhook_destinations: form
								.getValue(form.names.webhookDestinations)
								.map((d: string) => ({ url: d })),
							threshold_window: form.getValue(
								form.names.frequency,
							),
							query: form.getValue(form.names.query),
						}

						if (!input.name) {
							message.error(`Missing name!`)
							return
						}

						if (!input.count_threshold) {
							message.error(`Missing alert threshold!`)
							return
						}

						if (isCreate) {
							createLogAlertMutation({
								variables: {
									input,
								},
							})
								.then(() => {
									message.success(`Log alert ${createStr}d!`)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									message.error(
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
									message.success(`Log alert ${createStr}d!`)
								})
								.catch(() => {
									message.error(
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
				{header}
				<Container
					display="flex"
					flexDirection="column"
					py="24"
					gap="40"
				>
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
									Log monitor
								</Text>
							</Box>
							<PreviousDateRangePicker
								selectedDates={selectedDates}
								onDatesChange={setSelectedDates}
								presets={LOG_TIME_PRESETS}
								minDate={thirtyDaysAgo}
								kind="secondary"
								size="medium"
								emphasis="low"
							/>
						</Box>
						<LogsHistogram
							query={query}
							startDate={startDate}
							endDate={endDate}
							onDatesChange={(startDate, endDate) => {
								setSelectedDates([startDate, endDate])
							}}
							onLevelChange={() => {}}
							outline
							threshold={threshold}
							belowThreshold={belowThreshold}
							frequencySeconds={frequency}
						/>
					</Box>
					<Form state={form} resetOnSubmit={false}>
						<LogAlertForm {...{ startDate, endDate }} />
					</Form>
				</Container>
			</Box>
		</Box>
	)
}

const LogAlertForm = ({
	startDate,
	endDate,
}: {
	startDate: Date
	endDate: Date
}) => {
	const { projectId } = useProjectId()
	const { data: keysData, loading: keysLoading } = useGetLogsKeysQuery({
		variables: {
			project_id: projectId,
			date_range: {
				start_date: moment(startDate).format(LOG_TIME_FORMAT),
				end_date: moment(endDate).format(LOG_TIME_FORMAT),
			},
		},
	})
	const form = useForm() as FormState<LogMonitorForm>
	const query = form.values.query

	const { alertsPayload } = useLogAlertsContext()

	const environments = dedupeEnvironments(
		(alertsPayload?.environment_suggestion ??
			[]) as EnvironmentSuggestion[],
	).map((environmentSuggestion) => ({
		displayValue: environmentSuggestion,
		value: environmentSuggestion,
		id: environmentSuggestion,
	}))

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
		<Box cssClass={styles.grid}>
			<Stack gap="12">
				<Box cssClass={styles.sectionHeader}>
					<Text size="large" weight="bold" color="strong">
						Define query
					</Text>
				</Box>
				<Box borderTop="dividerWeak" width="full" />
				<Form.NamedSection label="Search query" name={form.names.query}>
					<Box cssClass={styles.queryContainer}>
						<Search
							initialQuery={query}
							keys={keysData?.logs_keys ?? []}
							startDate={startDate}
							endDate={endDate}
							hideIcon
							className={styles.combobox}
							keysLoading={keysLoading}
						/>
					</Box>
				</Form.NamedSection>
			</Stack>
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
							name={form.names.threshold}
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
						/>
					</Column>

					<Column>
						<Form.NamedSection
							label="Alert frequency"
							name={form.names.frequency}
						>
							<select
								className={styles.select}
								value={form.values.frequency}
								onChange={(e) =>
									form.setValue(
										form.names.frequency,
										e.target.value,
									)
								}
							>
								<option value="" disabled>
									Select alert frequency
								</option>
								<option value={15}>15 seconds</option>
								<option value={60}>1 minute</option>
								<option value={300}>5 minutes</option>
								<option value={900}>15 minutes</option>
								<option value={1800}>30 minutes</option>
							</select>
						</Form.NamedSection>
					</Column>
				</Column.Container>
			</Stack>

			<Stack gap="12">
				<Box cssClass={styles.sectionHeader}>
					<Text size="large" weight="bold" color="strong">
						General
					</Text>
				</Box>

				<Box borderTop="dividerWeak" width="full" />

				<Form.Input
					name={form.names.name}
					type="text"
					placeholder="Type alert name"
					label="Name"
				/>

				<Form.NamedSection
					label="Excluded environments"
					name={form.names.excludedEnvironments}
				>
					<Select
						aria-label="Excluded environments list"
						placeholder="Select excluded environments"
						options={environments}
						onChange={(values: any): any =>
							form.setValue(
								form.names.excludedEnvironments,
								values,
							)
						}
						value={form.values.excludedEnvironments}
						notFoundContent={<p>No environment suggestions</p>}
						className={styles.selectContainer}
						mode="multiple"
					/>
				</Form.NamedSection>
			</Stack>
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
						onChange={(values: any): any =>
							form.setValue(form.names.slackChannels, values)
						}
						value={form.values.slackChannels}
						notFoundContent={<p>No channel suggestions</p>}
						className={styles.selectContainer}
						mode="multiple"
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
						onChange={(values: any): any =>
							form.setValue(form.names.discordChannels, values)
						}
						value={form.values.discordChannels}
						notFoundContent={<p>No channel suggestions</p>}
						className={styles.selectContainer}
						mode="multiple"
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
							form.setValue(
								form.names.webhookDestinations,
								values,
							)
						}
						value={form.values.webhookDestinations}
						notFoundContent={null}
						className={styles.selectContainer}
						mode="tags"
					/>
				</Form.NamedSection>
			</Stack>
		</Box>
	)
}

const ThresholdTypeConfiguration = () => {
	const form = useForm()
	const menu = useMenu()
	const belowThreshold = form.values.belowThreshold
	return (
		<>
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="high"
				cssClass={styles.thresholdTypeButton}
				iconRight={
					menu.open ? (
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

interface LogMonitorForm {
	query: string
	name: string
	belowThreshold: boolean
	threshold: number | undefined
	frequency: number
	excludedEnvironments: string[]
	slackChannels: SanitizedSlackChannel[]
	discordChannels: DiscordChannel[]
	emails: string[]
	webhookDestinations: string[]
}

export default LogAlertPage
