import { Button } from '@components/Button'
import Select from '@components/Select/Select'
import {
	useCreateErrorAlertMutation,
	useDeleteErrorAlertMutation,
	useUpdateErrorAlertMutation,
} from '@graph/hooks'
import {
	Badge,
	Box,
	Column,
	Container,
	defaultPresets,
	Form,
	FormState,
	getNow,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidCheveronUp,
	IconSolidSpeakerphone,
	Menu,
	Stack,
	Tag,
	Text,
} from '@highlight-run/ui/components'
import {
	DEFAULT_FREQUENCY,
	FREQUENCIES,
} from '@pages/Alerts/AlertConfigurationCard/AlertConfigurationConstants'
import {
	AlertForm,
	dedupeEnvironments,
	EnvironmentSuggestion,
	findAlert,
	getFrequencyOption,
} from '@pages/Alerts/utils/AlertsUtils'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { capitalize } from 'lodash'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DateTimeParam, useQueryParam } from 'use-query-params'

import LoadingBox from '@/components/LoadingBox'
import { namedOperations } from '@/graph/generated/operations'
import { useAlertsContext } from '@/pages/Alerts/AlertsContext/AlertsContext'
import AlertNotifyForm from '@/pages/Alerts/components/AlertNotifyForm/AlertNotifyForm'
import AlertTitleField from '@/pages/Alerts/components/AlertTitleField/AlertTitleField'
import analytics from '@/util/analytics'

import * as styles from './styles.css'

export const ErrorAlertPage = () => {
	const [startDateParam] = useQueryParam('start_date', DateTimeParam)
	const [endDateParam] = useQueryParam('end_date', DateTimeParam)

	const [startDate, setStartDate] = useState(
		startDateParam ?? defaultPresets[0].startDate,
	)

	const [endDate, setEndDate] = useState(endDateParam ?? getNow().toDate())
	const [selectedDates] = useState<Date[]>([startDate, endDate])

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

	const { alertsPayload } = useAlertsContext()
	const alert = alert_id
		? (findAlert(alert_id, 'error', alertsPayload) as any)
		: undefined

	const formStore = Form.useStore<ErrorAlertFormItem>({
		defaultValues: {
			name: '',
			belowThreshold: false,
			excludedEnvironments: [],
			slackChannels: [],
			discordChannels: [],
			microsoftTeamsChannels: [],
			webhookDestinations: [],
			emails: [],
			threshold: undefined,
			regex_groups: [],
			frequency: Number(DEFAULT_FREQUENCY),
			threshold_window: Number(DEFAULT_FREQUENCY),
			loaded: false,
		},
	})
	const formValues = formStore.useState().values

	useEffect(() => {
		if (alert) {
			formStore.setValues({
				name: alert.Name ?? 'Error',
				belowThreshold: false,
				excludedEnvironments: alert.ExcludedEnvironments,
				slackChannels: alert.ChannelsToNotify.map((c: any) => ({
					...c,
					webhook_channel_name: c.webhook_channel,
					displayValue: c.webhook_channel,
					value: c.webhook_channel_id,
					id: c.webhook_channel_id,
				})),
				discordChannels: alert.DiscordChannelsToNotify.map(
					(c: any) => ({
						...c,
						displayValue: c.name,
						value: c.id,
						id: c.id,
					}),
				),
				microsoftTeamsChannels:
					alert.MicrosoftTeamsChannelsToNotify.map((c: any) => ({
						...c,
						displayValue: c.name,
						value: c.id,
						id: c.id,
					})),
				webhookDestinations: alert.WebhookDestinations.map(
					(d: any) => d.url,
				),
				emails: alert.EmailsToNotify,
				threshold: alert.CountThreshold,
				frequency: getFrequencyOption(alert.Frequency).value,
				regex_groups: alert.RegexGroups || [],
				threshold_window: alert.ThresholdWindow,
				loaded: true,
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [alert])

	useEffect(() => {
		analytics.page('Error Alert', { isCreate })
	}, [isCreate])

	const [updateErrorAlertMutation] = useUpdateErrorAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const [createErrorAlertMutation] = useCreateErrorAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const [deleteErrorAlertMutation] = useDeleteErrorAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const { project_id } = useParams<{
		project_id: string
	}>()

	const navigate = useNavigate()

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
					trackingId="closeErrorAlert"
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
						trackingId="deleteErrorAlert"
						onClick={() => {
							deleteErrorAlertMutation({
								variables: {
									project_id: project_id ?? '',
									error_alert_id: alert_id,
								},
							})
								.then(() => {
									message.success(`Error alert deleted!`)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									message.error(
										`Failed to delete error alert!`,
									)
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
					trackingId="saveErrorMonitoringAlert"
					onClick={() => {
						const input = {
							count_threshold: formStore.getValue(
								formStore.names.threshold,
							),
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
							emails: formStore.getValue(formStore.names.emails),
							environments: formStore.getValue(
								formStore.names.excludedEnvironments,
							),
							name: formStore.getValue(formStore.names.name),
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
							threshold_window: formStore.getValue(
								formStore.names.threshold_window,
							),
							regex_groups: formStore.getValue(
								formStore.names.regex_groups,
							),
							frequency: formStore.getValue(
								formStore.names.frequency,
							),
						}

						const nameErr = !input.name
						const thresholdErr =
							!input.count_threshold || input.count_threshold < 0
						if (nameErr || thresholdErr) {
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

							message.error(
								`Missing required field(s): ${errs.join(
									', ',
								)}.`,
							)

							return
						}

						if (isCreate) {
							createErrorAlertMutation({
								variables: input,
							})
								.then(() => {
									message.success(
										`Error alert ${createStr}d!`,
									)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									message.error(
										`Failed to ${createStr} error alert!`,
									)
								})
						} else {
							updateErrorAlertMutation({
								variables: {
									...input,
									error_alert_id: alert_id,
								},
							})
								.then(() => {
									message.success(
										`Error alert ${createStr}d!`,
									)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									message.error(
										`Failed to ${createStr} error alert!`,
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
											Error alert
										</Text>
									</Box>
								</Box>
							</Box>

							<Form store={formStore} resetOnSubmit={false}>
								<Stack gap="40">
									<AlertTitleField />
									<ErrorAlertForm />
								</Stack>
							</Form>
						</Container>
					</>
				)}
			</Box>
		</Box>
	)
}

const ErrorAlertForm = () => {
	const formStore = Form.useContext() as FormState<ErrorAlertFormItem>
	const errors = formStore.useState('errors')

	const { alertsPayload } = useAlertsContext()
	const environments = dedupeEnvironments(
		(alertsPayload?.environment_suggestion ??
			[]) as EnvironmentSuggestion[],
	).map((environmentSuggestion) => ({
		displayValue: environmentSuggestion,
		value: environmentSuggestion,
		id: environmentSuggestion,
	}))

	return (
		<Box cssClass={styles.grid}>
			<Stack gap="40">
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
					<Form.NamedSection
						label="Regex Patterns to Ignore"
						name={formStore.names.regex_groups}
					>
						<Select
							aria-label="Regex Patterns to Ignore list"
							placeholder={`Input any valid regex, like: \\d{5}(-\\d{4})?, Hello\\nworld, [b-chm-pP]at|ot`}
							onChange={(values: any): any =>
								formStore.setValue(
									formStore.names.regex_groups,
									values,
								)
							}
							className={styles.selectContainer}
							mode="tags"
							value={formStore.getValue(
								formStore.names.regex_groups,
							)}
						/>
					</Form.NamedSection>
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
								label="Alert threshold window"
								name={formStore.names.threshold_window}
								onChange={(e) =>
									formStore.setValue(
										formStore.names.threshold_window,
										e.target.value,
									)
								}
							>
								<option value="" disabled>
									Select alert threshold window
								</option>
								{FREQUENCIES.map((freq: any) => (
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
					<Form.Select
						label="Alert frequency"
						name={formStore.names.frequency}
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
						{FREQUENCIES.map((freq: any) => (
							<option key={freq.id} value={Number(freq.value)}>
								{freq.displayValue}
							</option>
						))}
					</Form.Select>
				</Stack>

				<Stack gap="12">
					<Box cssClass={styles.sectionHeader}>
						<Text size="large" weight="bold" color="strong">
							General
						</Text>
					</Box>

					<Box borderTop="dividerWeak" width="full" />

					<Form.NamedSection
						label="Excluded environments"
						name={formStore.names.excludedEnvironments}
					>
						<Select
							aria-label="Excluded environments list"
							placeholder="Select excluded environments"
							options={environments}
							onChange={(values: any): any =>
								formStore.setValue(
									formStore.names.excludedEnvironments,
									values,
								)
							}
							notFoundContent={<p>No environment suggestions</p>}
							className={styles.selectContainer}
							mode="multiple"
							value={formStore.getValue(
								formStore.names.excludedEnvironments,
							)}
						/>
					</Form.NamedSection>
				</Stack>
			</Stack>
			<AlertNotifyForm />
		</Box>
	)
}

const ThresholdTypeConfiguration = () => {
	const formStore = Form.useContext()! as FormState<ErrorAlertFormItem>
	const belowThreshold = formStore.useValue('belowThreshold')
	const menu = Menu.useContext()!
	const menuState = menu.getState()
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
						formStore.setValue('belowThreshold', false)
					}}
				>
					Above threshold
				</Menu.Item>
				<Menu.Item
					onClick={() => {
						formStore.setValue('belowThreshold', true)
					}}
				>
					Below threshold
				</Menu.Item>
			</Menu.List>
		</>
	)
}

interface ErrorAlertFormItem extends AlertForm {
	regex_groups: string[]
}

export default ErrorAlertPage
