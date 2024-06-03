import { Button } from '@components/Button'
import Select from '@components/Select/Select'
import { toast } from '@components/Toaster'
import {
	useCreateSessionAlertMutation,
	useDeleteSessionAlertMutation,
	useGetIdentifierSuggestionsQuery,
	useGetTrackSuggestionQuery,
	useGetUserSuggestionQuery,
	useUpdateSessionAlertMutation,
} from '@graph/hooks'
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
	Stack,
	SwitchButton,
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
import { capitalize } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LoadingBox from '@/components/LoadingBox'
import TextHighlighter from '@/components/TextHighlighter/TextHighlighter'
import { namedOperations } from '@/graph/generated/operations'
import { SessionAlertInput, SessionAlertType } from '@/graph/generated/schemas'
import {
	ALERT_CONFIGURATIONS,
	ALERT_NAMES,
	AlertConfiguration,
} from '@/pages/Alerts/Alerts'
import { useAlertsContext } from '@/pages/Alerts/AlertsContext/AlertsContext'
import AlertNotifyForm from '@/pages/Alerts/components/AlertNotifyForm/AlertNotifyForm'
import AlertTitleField from '@/pages/Alerts/components/AlertTitleField/AlertTitleField'
import analytics from '@/util/analytics'

import * as styles from './styles.css'

const SEPARATOR = ':$&'

const SessionAlertOptions = [
	{ title: 'New Session', value: SessionAlertType.NewSessionAlert },
	{ title: 'New User', value: SessionAlertType.NewUserAlert },
	{ title: 'Rage Click', value: SessionAlertType.RageClickAlert },
	{ title: 'Track Properties', value: SessionAlertType.TrackPropertiesAlert },
	{ title: 'User Properties', value: SessionAlertType.UserPropertiesAlert },
]

const SessionAlertDefaultValues = {
	name: '',
	belowThreshold: false,
	excludedEnvironments: [],
	slackChannels: [],
	discordChannels: [],
	microsoftTeamsChannels: [],
	webhookDestinations: [],
	emails: [],
	threshold: undefined,
	frequency: Number(DEFAULT_FREQUENCY),
	threshold_window: Number(DEFAULT_FREQUENCY),
	excludeRules: [],
	userProperties: [],
	trackProperties: [],
}

export const SessionAlertPage = () => {
	const { alert_id } = useParams<{
		alert_id: string
	}>()

	const isCreate = alert_id === undefined
	const createStr = isCreate ? 'create' : 'update'

	const { alertsPayload } = useAlertsContext()
	const alert = alert_id
		? (findAlert(alert_id, 'session', alertsPayload) as any)
		: undefined
	const [alertType, setAlertType] = useState(
		alert?.Type || SessionAlertType.NewSessionAlert,
	)

	const configuration = useMemo(() => {
		return ALERT_CONFIGURATIONS[alertType]
	}, [alertType])

	const formStore = Form.useStore<SessionAlertFormItem>({
		defaultValues: {
			...SessionAlertDefaultValues,
			type: alertType,
			loaded: false,
		},
	})
	const values = formStore.useState('values')

	useEffect(() => {
		if (alert) {
			formStore.setValues({
				name: alert.Name ?? '',
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
				threshold_window: alert.ThresholdWindow,
				userProperties: alert.UserProperties?.map(
					(userProperty: any) =>
						getPropertiesOption(userProperty).value,
				),
				trackProperties: alert.TrackProperties?.map(
					(trackProperty: any) =>
						getPropertiesOption(trackProperty).value,
				),
				excludeRules: alert.ExcludeRules,
				type: alertType,
				loaded: true,
			})
		} else {
			formStore.setValues((prevValue) => ({
				...prevValue,
				...SessionAlertDefaultValues,
				type: alertType,
				loaded: true,
			}))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [alert])

	useEffect(() => {
		analytics.page('Session Alert', { isCreate })
	}, [isCreate])

	const [updateSessionAlertMutation] = useUpdateSessionAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const [createSessionAlertMutation] = useCreateSessionAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const [deleteSessionAlertMutation] = useDeleteSessionAlertMutation({
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
					trackingId="closeSessionAlert"
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
						trackingId="deleteSessionAlert"
						onClick={() => {
							deleteSessionAlertMutation({
								variables: {
									project_id: project_id ?? '',
									session_alert_id: alert_id,
								},
							})
								.then(() => {
									toast.success(`Error alert deleted!`)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									toast.error(`Failed to delete error alert!`)
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
						const tracksSessionProperties =
							configuration.name ===
							ALERT_NAMES.TRACK_PROPERTIES_ALERT
						const tracksUserProperties =
							configuration.name ===
							ALERT_NAMES.USER_PROPERTIES_ALERT

						const excludeRules = configuration.supportsExcludeRules

						const input: SessionAlertInput = {
							count_threshold: formStore.getValue(
								formStore.names.threshold,
							),
							disabled: false,
							discord_channels: values.discordChannels.map(
								(c) => ({
									name: c.name,
									id: c.id,
								}),
							),
							microsoft_teams_channels:
								values.microsoftTeamsChannels.map((c) => ({
									name: c.name,
									id: c.id,
								})),
							emails: formStore.getValue(formStore.names.emails),
							environments: formStore.getValue(
								formStore.names.excludedEnvironments,
							),
							name: formStore.getValue(formStore.names.name),
							project_id: project_id || '0',
							slack_channels: values.slackChannels.map((c) => ({
								webhook_channel_id: c.webhook_channel_id,
								webhook_channel_name: c.webhook_channel_name,
							})),
							webhook_destinations: formStore
								.getValue(formStore.names.webhookDestinations)
								.map((d: string) => ({ url: d })),
							threshold_window: formStore.getValue(
								formStore.names.threshold_window,
							),
							exclude_rules: excludeRules
								? formStore.getValue(
										formStore.names.excludeRules,
								  ) || []
								: [],
							user_properties: tracksUserProperties
								? (
										formStore.getValue(
											formStore.names.userProperties,
										) || []
								  ).map((userProperty: any) => {
										const [id, name, value] =
											userProperty.split(SEPARATOR, 3)
										return {
											id,
											value,
											name,
										}
								  })
								: [],
							track_properties: tracksSessionProperties
								? (
										formStore.getValue(
											formStore.names.trackProperties,
										) || []
								  ).map((trackProperty: any) => {
										const [id, name, value] =
											trackProperty.split(SEPARATOR, 3)
										return {
											id,
											value,
											name,
										}
								  }) || []
								: [],
							type: alertType,
						}

						const nameErr = !input.name
						const thresholdErr =
							configuration.canControlThreshold &&
							(!input.count_threshold ||
								input.count_threshold < 0)
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

							toast.error(
								`Missing required field(s): ${errs.join(
									', ',
								)}.`,
							)

							return
						}

						if (isCreate) {
							createSessionAlertMutation({
								variables: {
									input: {
										...input,
										count_threshold:
											input.count_threshold ?? 1,
									},
								},
							})
								.then(() => {
									toast.success(
										`Session alert ${createStr}d!`,
									)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									toast.error(
										`Failed to ${createStr} session alert!`,
									)
								})
						} else {
							updateSessionAlertMutation({
								variables: {
									input: {
										...input,
										count_threshold:
											input.count_threshold ?? 1,
									},
									id: alert_id,
								},
							})
								.then(() => {
									toast.success(
										`Session alert ${createStr}d!`,
									)
									navigate(`/${project_id}/alerts`)
								})
								.catch(() => {
									toast.error(
										`Failed to ${createStr} session alert!`,
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

	const isLoading = !isCreate && !values.loaded

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
											Session alert
										</Text>
									</Box>
								</Box>
							</Box>

							<Form store={formStore} resetOnSubmit={false}>
								<Stack gap="24">
									<Box
										display="flex"
										borderBottom="dividerWeak"
										width="full"
										gap="4"
										py="12"
									>
										{SessionAlertOptions.map((option) => (
											<SwitchButton
												key={option.value}
												checked={
													option.value === alertType
												}
												onClick={() =>
													setAlertType(option.value)
												}
												style={{
													width: '100%',
													padding: '8px 8px',
												}}
											>
												{option.title}
											</SwitchButton>
										))}
									</Box>
									<Stack gap="40">
										<AlertTitleField />
										<SessionAlertForm
											type={alertType}
											configuration={configuration}
										/>
									</Stack>
								</Stack>
							</Form>
						</Container>
					</>
				)}
			</Box>
		</Box>
	)
}

const SessionAlertForm = ({
	type,
	configuration,
}: {
	type: SessionAlertType
	configuration: AlertConfiguration
}) => {
	const formStore = Form.useContext() as FormState<SessionAlertFormItem>
	const errors = formStore.useState('errors')
	const { project_id } = useParams<{
		project_id: string
	}>()
	const { alertsPayload } = useAlertsContext()
	const environments = dedupeEnvironments(
		(alertsPayload?.environment_suggestion ??
			[]) as EnvironmentSuggestion[],
	).map((environmentSuggestion) => ({
		displayValue: environmentSuggestion,
		value: environmentSuggestion,
		id: environmentSuggestion,
	}))

	const [identifierQuery, setIdentifierQuery] = useState('')

	const {
		data: userSuggestionsApiResponse,
		loading: userSuggestionsLoading,
		refetch: refetchUserSuggestions,
	} = useGetUserSuggestionQuery({
		variables: {
			project_id: project_id ?? '',
			query: '',
		},
		skip: !project_id,
	})

	const {
		refetch: refetchTrackSuggestions,
		loading: trackSuggestionsLoading,
		data: trackSuggestionsApiResponse,
	} = useGetTrackSuggestionQuery({
		variables: {
			project_id: project_id ?? '',
			query: '',
		},
		skip: !project_id,
	})

	const {
		refetch: refetchIdentifierSuggestions,
		loading: identifierSuggestionsLoading,
		data: identifierSuggestionsApiResponse,
	} = useGetIdentifierSuggestionsQuery({
		variables: {
			project_id: project_id ?? '',
			query: '',
		},
		skip: !project_id,
	})

	const userPropertiesSuggestions = userSuggestionsLoading
		? []
		: (userSuggestionsApiResponse?.property_suggestion || []).map(
				(suggestion) => getPropertiesOption(suggestion),
		  )

	const trackPropertiesSuggestions = trackSuggestionsLoading
		? []
		: (trackSuggestionsApiResponse?.property_suggestion || []).map(
				(suggestion) => getPropertiesOption(suggestion),
		  )

	const identifierSuggestions = identifierSuggestionsLoading
		? []
		: (identifierSuggestionsApiResponse?.identifier_suggestion || []).map(
				(suggestion) => ({
					value: suggestion,
					displayValue: (
						<TextHighlighter
							searchWords={[identifierQuery]}
							textToHighlight={suggestion}
						/>
					),
					id: suggestion,
				}),
		  )

	const handleUserPropertiesSearch = (query = '') => {
		refetchUserSuggestions({ query, project_id: project_id })
	}
	const handleTrackPropertiesSearch = (query = '') => {
		refetchTrackSuggestions({ query, project_id: project_id })
	}

	const handleIdentifierSearch = (query = '') => {
		setIdentifierQuery(query)
		refetchIdentifierSuggestions({ query, project_id: project_id })
	}

	return (
		<Box cssClass={styles.grid}>
			<Stack gap="40">
				{type !== SessionAlertType.NewUserAlert && (
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
						{configuration.canControlThreshold && (
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
						)}
						{configuration.supportsExcludeRules && (
							<Form.NamedSection
								label="Excluded identifiers"
								name={formStore.names.excludeRules}
							>
								<Select
									aria-label="Excluded identifiers list"
									notFoundContent={
										<p>No identifier suggestions</p>
									}
									onSearch={handleIdentifierSearch}
									options={identifierSuggestions}
									mode="tags"
									placeholder="Select a identifier(s) that should not trigger alerts."
									onChange={(values: any): any => {
										handleIdentifierSearch('')
										formStore.setValue(
											formStore.names.excludeRules,
											values,
										)
									}}
									className={styles.selectContainer}
									value={formStore.getValue(
										formStore.names.excludeRules,
									)}
								/>
							</Form.NamedSection>
						)}

						{type === SessionAlertType.UserPropertiesAlert && (
							<Form.NamedSection
								label="User Properties"
								name={formStore.names.userProperties}
							>
								<Select
									onSearch={handleUserPropertiesSearch}
									options={userPropertiesSuggestions}
									className={styles.selectContainer}
									mode="multiple"
									placeholder="Pick the user properties that you would like to get alerted for."
									onChange={(values: any): any =>
										formStore.setValue(
											formStore.names.userProperties,
											values,
										)
									}
									value={formStore.getValue(
										formStore.names.userProperties,
									)}
								/>
							</Form.NamedSection>
						)}
						{type === SessionAlertType.TrackPropertiesAlert && (
							<Form.NamedSection
								label="Track Properties"
								name={formStore.names.trackProperties}
							>
								<Select
									onSearch={handleTrackPropertiesSearch}
									options={trackPropertiesSuggestions}
									className={styles.selectContainer}
									mode="multiple"
									placeholder="Pick the track properties that you would like to get alerted for."
									onChange={(values: any): any =>
										formStore.setValue(
											formStore.names.trackProperties,
											values,
										)
									}
									value={formStore.getValue(
										formStore.names.trackProperties,
									)}
								/>
							</Form.NamedSection>
						)}
					</Stack>
				)}

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
	const formStore = Form.useContext()!
	const belowThreshold = formStore.useValue('belowThreshold')
	const menuStore = Menu.useContext()!
	const menuState = menuStore.getState()
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

interface SessionAlertFormItem extends AlertForm {
	excludeRules: string[]
	userProperties: any[]
	trackProperties: any[]
	type: SessionAlertType
}

export default SessionAlertPage

const getPropertiesOption = (option: any) => ({
	displayValue:
		(
			<>
				<b>{option?.name}: </b>
				{option?.value}
			</>
		) || '',
	value:
		`${option?.id}${SEPARATOR}${option?.name}${SEPARATOR}${option?.value}` ||
		'',
	id: `${option?.name}${SEPARATOR}${option?.value}` || '',
	name: option?.id || '',
})
