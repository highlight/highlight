import Card from '@components/Card/Card'
import ConfirmModal from '@components/ConfirmModal/ConfirmModal'
import ConnectHighlightWithSlackButton from '@components/Header/components/ConnectHighlightWithSlackButton/ConnectHighlightWithSlackButton'
import Input from '@components/Input/Input'
import Switch from '@components/Switch/Switch'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import {
	useCreateErrorAlertMutation,
	useCreateSessionAlertMutation,
	useGetIdentifierSuggestionsQuery,
	useGetTrackSuggestionQuery,
	useGetUserSuggestionQuery,
	useUpdateErrorAlertMutation,
	useUpdateSessionAlertMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import {
	DiscordChannel,
	SessionAlertType,
	WebhookDestination,
} from '@graph/schemas'
import { useSlackSync } from '@hooks/useSlackSync'
import alertConfigurationCardStyles from '@pages/Alerts/AlertConfigurationCard/AlertConfigurationCard.module.css'
import { DiscordChannnelsSection } from '@pages/Alerts/AlertConfigurationCard/DiscordChannelsSection'
import { useParams } from '@util/react-router/useParams'
import { Form, message, Tag } from 'antd'
import clsx from 'clsx'
import { uniq } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
import TextTransition from 'react-text-transition'

import SlackLoadOrConnect from '@/pages/Alerts/AlertConfigurationCard/SlackLoadOrConnect'
import { useApplicationContext } from '@/routers/AppRouter/context/ApplicationContext'

import Button from '../../../components/Button/Button/Button'
import InputNumber from '../../../components/InputNumber/InputNumber'
import layoutStyles from '../../../components/layout/LeadAlignLayout.module.css'
import Select from '../../../components/Select/Select'
import { ALERT_TYPE } from '../Alerts'
import { dedupeEnvironments, getAlertTypeColor } from '../utils/AlertsUtils'
import styles from './AlertConfigurationCard.module.css'
import {
	DEFAULT_FREQUENCY,
	DEFAULT_LOOKBACK_PERIOD,
	FREQUENCIES,
	LOOKBACK_PERIODS,
} from './AlertConfigurationConstants'

interface AlertConfiguration {
	name: string
	canControlThreshold: boolean
	type: ALERT_TYPE
	description?: string
	supportsExcludeRules: boolean
}

interface Props {
	alert: any
	configuration: AlertConfiguration
	environmentOptions: any[]
	channelSuggestions: any[]
	discordChannelSuggestions: DiscordChannel[]
	slackUrl: string
	onDeleteHandler?: (alertId: string) => void
	isCreatingNewAlert?: boolean
	isSlackIntegrated: boolean
	isDiscordIntegrated: boolean
	emailSuggestions: string[]
}

export const AlertConfigurationCard = ({
	alert,
	configuration: {
		name: defaultName,
		canControlThreshold,
		type,
		description,
		supportsExcludeRules,
	},
	environmentOptions,
	channelSuggestions,
	discordChannelSuggestions,
	onDeleteHandler,
	isCreatingNewAlert = false,
	isSlackIntegrated,
	slackUrl,
	isDiscordIntegrated,
	emailSuggestions,
}: Props) => {
	const [loading, setLoading] = useState(false)
	const [formTouched, setFormTouched] = useState(false)
	const [threshold, setThreshold] = useState(alert?.CountThreshold || 1)
	const [frequency, setFrequency] = useState(
		getFrequencyOption(alert?.Frequency).value,
	)
	const [customEmail, setCustomEmail] = useState('')

	const { slackLoading, syncSlack } = useSlackSync()
	const [isDisabled, setIsDisabled] = useState(alert?.disabled || false)
	const [emailsToNotify, setEmailsToNotify] = useState<string[]>(
		alert?.EmailsToNotify || [],
	)
	const [webhooks, setWebhooks] = useState<WebhookDestination[]>(
		alert?.WebhookDestinations || [],
	)
	const [selectedDiscordChannels, setSelectedDiscordChannels] = useState<
		DiscordChannel[]
	>(alert?.DiscordChannelsToNotify || [])

	const { currentWorkspace } = useApplicationContext()
	/** lookbackPeriod units is minutes. */
	const [lookbackPeriod, setLookbackPeriod] = useState(
		getLookbackPeriodOption(alert?.ThresholdWindow).value,
	)
	const [searchQuery, setSearchQuery] = useState('')
	const [identifierQuery, setIdentifierQuery] = useState('')
	const { project_id: projectIdFromUrl } = useParams<{ project_id: string }>()
	const projectId = projectIdFromUrl ?? '0'
	const [form] = Form.useForm()
	const [updateErrorAlert] = useUpdateErrorAlertMutation()
	const [createErrorAlert, {}] = useCreateErrorAlertMutation({
		variables: {
			project_id: projectId,
			count_threshold: 1,
			environments: [],
			slack_channels: [],
			discord_channels: [],
			webhook_destinations: [],
			threshold_window: 30,
			name: 'Error',
			regex_groups: [],
			frequency: 15,
			emails: emailsToNotify,
		},
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const [createSessionAlert] = useCreateSessionAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const [updateSessionAlert] = useUpdateSessionAlertMutation()

	const excludedEnvironmentsFormName = `${
		alert.Name || defaultName
	}-excludedEnvironments`
	const excludedIdentifiersFormName = `${
		alert.Name || defaultName
	}-excludedIdentifiers`

	const navigate = useNavigate()
	const location = useLocation()

	useEffect(() => {
		navigate(location.pathname, {
			state: {
				errorName: alert.Name || defaultName,
			},
			replace: true,
		})
	}, [alert.Name, defaultName, location.pathname, navigate])

	const onSubmit = async () => {
		const requestVariables = {
			project_id: projectId,
			environments: form.getFieldValue(excludedEnvironmentsFormName),
			count_threshold: form.getFieldValue('threshold'),
			slack_channels: form
				.getFieldValue('channels')
				.map((webhook_channel_id: string) => ({
					webhook_channel_name: channelSuggestions.find(
						(suggestion) =>
							suggestion.webhook_channel_id ===
							webhook_channel_id,
					).webhook_channel,
					webhook_channel_id,
				})),
			name: form.getFieldValue('name'),
			discord_channels: selectedDiscordChannels,
			webhook_destinations: webhooks,
		} as const
		const requestBody = {
			refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
		}

		setLoading(true)
		if (isCreatingNewAlert) {
			try {
				switch (type) {
					case ALERT_TYPE.Error:
						await createErrorAlert({
							...requestBody,
							variables: {
								...requestVariables,
								threshold_window: lookbackPeriod,
								regex_groups:
									form.getFieldValue('regex_groups') || [],
								frequency: frequency,
								emails: emailsToNotify,
							},
						})
						break
					case ALERT_TYPE.FirstTimeUser:
						await createSessionAlert({
							...requestBody,
							variables: {
								input: {
									...requestVariables,
									threshold_window: 1,
									user_properties: [],
									exclude_rules: [],
									track_properties: [],
									emails: emailsToNotify,
									disabled: false,
									type: SessionAlertType.NewUserAlert,
								},
							},
						})
						break
					case ALERT_TYPE.NewSession:
						await createSessionAlert({
							...requestBody,
							variables: {
								input: {
									...requestVariables,
									threshold_window: 1,
									exclude_rules:
										form.getFieldValue(
											excludedIdentifiersFormName,
										) || [],
									user_properties: [],
									track_properties: [],
									disabled: false,
									emails: emailsToNotify,
									type: SessionAlertType.NewSessionAlert,
								},
							},
						})
						break
					case ALERT_TYPE.RageClick:
						await createSessionAlert({
							...requestBody,
							variables: {
								input: {
									...requestVariables,
									threshold_window: lookbackPeriod,
									user_properties: [],
									exclude_rules: [],
									track_properties: [],
									emails: emailsToNotify,
									disabled: false,
									type: SessionAlertType.RageClickAlert,
								},
							},
						})
						break
					case ALERT_TYPE.TrackProperties:
						await createSessionAlert({
							...requestBody,
							variables: {
								input: {
									...requestVariables,
									threshold_window: 1,
									emails: emailsToNotify,
									track_properties: form
										.getFieldValue('trackProperties')
										.map((trackProperty: any) => {
											const [value, name, id] =
												trackProperty.split(':')
											return {
												id,
												value,
												name,
											}
										}),
									disabled: false,
									exclude_rules: [],
									user_properties: [],
									type: SessionAlertType.TrackPropertiesAlert,
								},
							},
						})
						break
					case ALERT_TYPE.UserProperties:
						await createSessionAlert({
							...requestBody,
							variables: {
								input: {
									...requestVariables,
									threshold_window: 1,
									user_properties: form
										.getFieldValue('userProperties')
										.map((userProperty: any) => {
											const [value, name, id] =
												userProperty.split(':')
											return {
												id,
												value,
												name,
											}
										}),
									exclude_rules: [],
									track_properties: [],
									emails: emailsToNotify,
									type: SessionAlertType.UserPropertiesAlert,
									disabled: false,
								},
							},
						})
						break
				}
				message.success(`Created ${requestVariables.name} alert!`)
				navigate(`/${projectId}/alerts`)
			} catch (e) {
				console.log(e)
			}
		} else {
			try {
				switch (type) {
					case ALERT_TYPE.Error:
						await updateErrorAlert({
							...requestBody,
							variables: {
								...requestVariables,
								error_alert_id: alert.id,
								threshold_window: lookbackPeriod,
								regex_groups:
									form.getFieldValue('regex_groups') || [],
								frequency: frequency,
								emails: emailsToNotify,
								disabled: isDisabled,
							},
						})
						break
					case ALERT_TYPE.FirstTimeUser:
						await updateSessionAlert({
							...requestBody,
							variables: {
								id: alert.id,
								input: {
									...requestVariables,
									threshold_window: 1,
									user_properties: [],
									exclude_rules: [],
									track_properties: [],
									emails: emailsToNotify,
									disabled: isDisabled,
									type: SessionAlertType.NewUserAlert,
								},
							},
						})
						break
					case ALERT_TYPE.UserProperties:
						await updateSessionAlert({
							...requestBody,
							variables: {
								id: alert.id,
								input: {
									...requestVariables,
									user_properties: form
										.getFieldValue('userProperties')
										.map((userProperty: any) => {
											const [value, name, id] =
												userProperty.split(':')
											return {
												id,
												value,
												name,
											}
										}),
									exclude_rules: [],
									track_properties: [],
									threshold_window: 1,
									emails: emailsToNotify,
									disabled: isDisabled,
									type: SessionAlertType.UserPropertiesAlert,
								},
							},
						})
						break
					case ALERT_TYPE.TrackProperties:
						await updateSessionAlert({
							...requestBody,
							variables: {
								id: alert.id,
								input: {
									...requestVariables,
									track_properties: form
										.getFieldValue('trackProperties')
										.map((trackProperty: any) => {
											const [value, name, id] =
												trackProperty.split(':')
											return {
												id,
												value,
												name,
											}
										}),
									threshold_window: 1,
									user_properties: [],
									exclude_rules: [],
									emails: emailsToNotify,
									disabled: isDisabled,
									type: SessionAlertType.TrackPropertiesAlert,
								},
							},
						})
						break
					case ALERT_TYPE.NewSession:
						await updateSessionAlert({
							...requestBody,
							variables: {
								id: alert.id,
								input: {
									...requestVariables,
									threshold_window: 1,
									emails: emailsToNotify,
									user_properties: [],
									exclude_rules:
										form.getFieldValue(
											excludedIdentifiersFormName,
										) || [],
									track_properties: [],
									disabled: isDisabled,
									type: SessionAlertType.NewSessionAlert,
								},
							},
						})
						break
					case ALERT_TYPE.RageClick:
						await updateSessionAlert({
							...requestBody,
							variables: {
								id: alert.id,
								input: {
									...requestVariables,
									threshold_window: lookbackPeriod,
									exclude_rules: [],
									user_properties: [],
									track_properties: [],
									emails: emailsToNotify,
									disabled: isDisabled,
									type: SessionAlertType.RageClickAlert,
								},
							},
						})
						break
					default:
						throw new Error(`Unsupported alert type: ${type}`)
				}
				message.success(`Updated ${defaultName}!`)
			} catch (e) {
				message.error(
					`There was a problem updating ${defaultName}. Please try again.`,
				)
			}
		}
		setFormTouched(false)
		setLoading(false)
	}

	const {
		data: userSuggestionsApiResponse,
		loading: userSuggestionsLoading,
		refetch: refetchUserSuggestions,
	} = useGetUserSuggestionQuery({
		variables: {
			project_id: projectId,
			query: '',
		},
		skip: !projectId,
	})

	const {
		refetch: refetchTrackSuggestions,
		loading: trackSuggestionsLoading,
		data: trackSuggestionsApiResponse,
	} = useGetTrackSuggestionQuery({
		variables: {
			project_id: projectId,
			query: '',
		},
		skip: !projectId,
	})

	const {
		refetch: refetchIdentifierSuggestions,
		loading: identifierSuggestionsLoading,
		data: identifierSuggestionsApiResponse,
	} = useGetIdentifierSuggestionsQuery({
		variables: {
			project_id: projectId,
			query: '',
		},
		skip: !projectId,
	})

	const channels = channelSuggestions.map(
		({ webhook_channel, webhook_channel_id }) => ({
			displayValue: webhook_channel,
			value: webhook_channel_id,
			id: webhook_channel_id,
		}),
	)

	const emails = uniq([
		...(emailSuggestions ?? []),
		// Add values from the form to ensure custom emails are included
		...(form.getFieldValue('emails') ?? []),
	]).map((email) => ({
		displayValue: email,
		value: email,
		id: email,
	}))

	if (!!customEmail.split('@')[1]) {
		emails.unshift({
			displayValue: `Send email alerts to: ${customEmail}`,
			value: customEmail,
			id: customEmail,
		})
	}

	const environments = [
		...dedupeEnvironments(environmentOptions).map(
			(environmentSuggestion) => ({
				displayValue: environmentSuggestion,
				value: environmentSuggestion,
				id: environmentSuggestion,
			}),
		),
	]

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

	/** Searches for a user property  */
	const handleUserPropertiesSearch = (query = '') => {
		refetchUserSuggestions({ query, project_id: projectId })
	}

	const handleTrackPropertiesSearch = (query = '') => {
		refetchTrackSuggestions({ query, project_id: projectId })
	}

	const handleIdentifierSearch = (query = '') => {
		setIdentifierQuery(query)
		refetchIdentifierSuggestions({ query, project_id: projectId })
	}

	const onChannelsChange = (channels: string[]) => {
		form.setFieldsValue({ channels })
		setFormTouched(true)
	}

	const onDiscordChannelsChange = (discordChannels: DiscordChannel[]) => {
		setSelectedDiscordChannels(discordChannels)
		setFormTouched(true)
	}

	const onEmailsChange = (emails: string[]) => {
		form.setFieldsValue({ emails })
		setEmailsToNotify(emails)
		setFormTouched(true)
		setCustomEmail('')
	}

	const onWebhooksChange = (webhooks: WebhookDestination[]) => {
		form.setFieldsValue({ webhooks })
		setWebhooks(webhooks)
		setFormTouched(true)
	}

	const onUserPropertiesChange = (_value: any, options: any) => {
		const userProperties = options.map(
			({ value: valueAndName }: { key: string; value: string }) => {
				const [value, name, id] = valueAndName.split(':')
				return {
					id,
					value,
					name,
				}
			},
		)
		form.setFieldsValue(userProperties)
		setFormTouched(true)
	}

	const onTrackPropertiesChange = (_value: any, options: any) => {
		const trackProperties = options.map(
			({ value: valueAndName }: { key: string; value: string }) => {
				const [value, name, id] = valueAndName.split(':')
				return {
					id,
					value,
					name,
				}
			},
		)
		form.setFieldsValue(trackProperties)
		setFormTouched(true)
	}

	const onRegexGroupsChange = (_value: any) => {
		const regex_groups = _value
		form.setFieldsValue({ regex_groups })
		setFormTouched(true)
	}

	const onExcludedEnvironmentsChange = (excludedEnvironments: string[]) => {
		form.setFieldsValue({ excludedEnvironments })
		setFormTouched(true)
	}

	const onThresholdChange = (threshold: any) => {
		setThreshold(threshold)
		setFormTouched(true)
	}

	const onFrequencyChange = (_frequency: any, frequencyOption: any) => {
		setFrequency(frequencyOption.value)
		setFormTouched(true)
	}

	const onLookbackPeriodChange = (
		_lookbackPeriod: any,
		lookbackPeriodOption: any,
	) => {
		setLookbackPeriod(lookbackPeriodOption.value)
		setFormTouched(true)
	}

	if (!alert) {
		return null
	}

	return (
		<>
			{isCreatingNewAlert && (
				<Helmet>
					<title>Create New {defaultName} Alert</title>
				</Helmet>
			)}
			<div className={styles.alertConfigurationCard}>
				<p className={clsx(layoutStyles.subTitle, styles.subTitle)}>
					This is an{' '}
					<strong style={{ color: getAlertTypeColor(defaultName) }}>
						{defaultName}
					</strong>{' '}
					alert. {description}
				</p>

				<Card>
					<Form
						onFinish={onSubmit}
						form={form}
						initialValues={{
							threshold: alert.CountThreshold,
							channels:
								alert.ChannelsToNotify?.map(
									(channel: any) =>
										channel.webhook_channel_id,
								) || [],
							emails: alert.EmailsToNotify || [],
							[excludedEnvironmentsFormName]:
								alert.ExcludedEnvironments,
							lookbackPeriod: [lookbackPeriod],
							userProperties: alert.UserProperties?.map(
								(userProperty: any) =>
									getPropertiesOption(userProperty).value,
							),
							trackProperties: alert.TrackProperties?.map(
								(trackProperty: any) =>
									getPropertiesOption(trackProperty).value,
							),
							name: alert.Name || defaultName,
							[excludedIdentifiersFormName]: alert.ExcludeRules,
							frequency: [frequency],
						}}
						key={projectId}
					>
						<section>
							<h3>Name</h3>
							<p>You can change the name of the alert anytime.</p>
							<Form.Item name="name" required>
								<Input
									size="large"
									onChange={() => {
										setFormTouched(true)
									}}
								/>
							</Form.Item>
						</section>
						{type === ALERT_TYPE.UserProperties && (
							<section>
								<h3>User Properties</h3>
								<p>
									Pick the user properties that you would like
									to get alerted for.
								</p>
								<Form.Item name="userProperties">
									<Select
										onSearch={handleUserPropertiesSearch}
										className={styles.channelSelect}
										options={userPropertiesSuggestions}
										mode="multiple"
										placeholder="Pick the user properties that you would like to get alerted for."
										onChange={onUserPropertiesChange}
									/>
								</Form.Item>
							</section>
						)}
						{type === ALERT_TYPE.TrackProperties && (
							<section>
								<h3>Track Properties</h3>
								<p>
									Pick the track properties that you would
									like to get alerted for.
								</p>
								<Form.Item name="trackProperties">
									<Select
										onSearch={handleTrackPropertiesSearch}
										className={styles.channelSelect}
										options={trackPropertiesSuggestions}
										mode="multiple"
										placeholder="Pick the track properties that you would like to get alerted for."
										onChange={onTrackPropertiesChange}
									/>
								</Form.Item>
							</section>
						)}

						<section>
							<h3>Slack Channels to Notify</h3>
							<p>
								Pick Slack channels or people to message when an
								alert is created.
							</p>
							{!isSlackIntegrated ? (
								<ConnectHighlightWithSlackButton />
							) : (
								<Form.Item shouldUpdate>
									{() => (
										<Select
											className={styles.channelSelect}
											options={channels}
											mode="multiple"
											onFocus={syncSlack}
											onSearch={(value) => {
												setSearchQuery(value)
											}}
											filterOption={(
												searchValue,
												option,
											) => {
												return (
													option?.children
														?.toString()
														.toLowerCase()
														.includes(
															searchValue.toLowerCase(),
														) || false
												)
											}}
											placeholder={`Select a channel(s) or person(s) to send ${defaultName} to.`}
											onChange={onChannelsChange}
											notFoundContent={
												<SlackLoadOrConnect
													searchQuery={searchQuery}
													isLoading={slackLoading}
													isSlackIntegrated={
														isSlackIntegrated
													}
													slackUrl={slackUrl}
												/>
											}
											defaultValue={alert?.ChannelsToNotify?.map(
												(channel: any) =>
													channel.webhook_channel_id,
											)}
										/>
									)}
								</Form.Item>
							)}
						</section>

						{isDiscordIntegrated && (
							<DiscordChannnelsSection
								options={discordChannelSuggestions}
								selectedChannels={selectedDiscordChannels}
								defaultName={defaultName}
								onChannelsChange={onDiscordChannelsChange}
							/>
						)}

						<section>
							<h3>Emails to Notify</h3>
							<p>
								Pick email addresses to email when an alert is
								created.
							</p>
							<Form.Item shouldUpdate>
								{() => (
									<Select
										className={styles.channelSelect}
										options={emails}
										mode="multiple"
										tagRender={(props) => {
											const { value, closable, onClose } =
												props

											const onPreventMouseDown = (
												event: React.MouseEvent<HTMLSpanElement>,
											) => {
												event.preventDefault()
												event.stopPropagation()
											}

											return (
												<Tag
													onMouseDown={
														onPreventMouseDown
													}
													closable={closable}
													onClose={onClose}
													style={{
														// A few custom styles to match default tags on selects
														backgroundColor: `var(--color-gray-200)`,
														border: 0,
														fontSize: 14,
														height: 24,
														lineHeight: `24px`, // set in px to avoid being set as a ratio of the font size
														marginRight: 4,
													}}
												>
													{value}
												</Tag>
											)
										}}
										filterOption={(searchValue, option) => {
											return (
												option?.children
													?.toString()
													.toLowerCase()
													.includes(
														searchValue.toLowerCase(),
													) || false
											)
										}}
										onKeyUp={(e: any) => {
											setCustomEmail(e.target.value)
										}}
										onBlur={() => setCustomEmail('')}
										placeholder={`Select an email address to send ${defaultName} to.`}
										onChange={onEmailsChange}
										notFoundContent={
											<div
												className={
													styles.notFoundContentEmail
												}
											>
												No matching email address found.
												Do you want to{' '}
												<Link
													to={`/w/${currentWorkspace?.id}/team`}
												>
													invite someone to the
													workspace
												</Link>
												? Or enter an external email
												address to send alerts to.
											</div>
										}
										defaultValue={
											alert?.EmailsToNotify || []
										}
									/>
								)}
							</Form.Item>
						</section>

						<section>
							<h3>Webhooks to Notify</h3>
							<p>
								Add webhook destinations for this alert, sent as
								JSON over HTTP. See the{' '}
								<Link to="https://www.highlight.io/docs/general/product-features/general-features/alerts/webhooks">
									docs
								</Link>{' '}
								for more info.
							</p>
							<Select
								className={
									alertConfigurationCardStyles.channelSelect
								}
								value={webhooks.map((wh) => wh.url)}
								mode="tags"
								placeholder="Select webhook web addresses to send the alert to."
								onChange={(whs: string[]) =>
									onWebhooksChange(
										whs.map((wh) => ({ url: wh })),
									)
								}
							/>
						</section>

						<section>
							<h3>Excluded Environments</h3>
							<p>
								Pick environments that should not create alerts.
								Some teams don't want to be woken up at 2AM if
								an alert is created from localhost. Environments
								can be set by passing the environment name when
								you{' '}
								<a
									href="https://docs.highlight.run/api#w0-highlightoptions"
									target="_blank"
									rel="noreferrer"
								>
									start Highlight in your app
								</a>
								.
							</p>
							<Form.Item name={excludedEnvironmentsFormName}>
								<Select
									className={styles.channelSelect}
									options={environments}
									mode="tags"
									placeholder="Select a environment(s) that should not trigger alerts."
									onChange={onExcludedEnvironmentsChange}
								/>
							</Form.Item>
						</section>

						{type === ALERT_TYPE.Error && (
							<section>
								<h3>Regex Patterns to Ignore</h3>
								<p>
									Configure a set of regex patterns to ignore
									errors with. Any error body or stack trace
									that matches the below patterns will NOT
									result in an alert.
								</p>
								<Form.Item name="regexGroups">
									<Select
										className={styles.channelSelect}
										mode="tags"
										placeholder={`Input any valid regex, like: \\d{5}(-\\d{4})?, Hello\\nworld, [b-chm-pP]at|ot`}
										onChange={onRegexGroupsChange}
										defaultValue={alert?.RegexGroups}
									/>
								</Form.Item>
							</section>
						)}

						{type === ALERT_TYPE.Error && (
							<section>
								<h3>Alert Frequency</h3>
								<span>
									You will not get alerted for the same error
									more than once within a{' '}
									<b>
										<TextTransition
											inline
											text={getSingularFrequencyOption(
												frequency,
											)}
										/>
									</b>
									{` `}
									period.
								</span>
								<Form.Item name="frequency">
									<Select
										className={styles.lookbackPeriodSelect}
										onChange={onFrequencyChange}
										options={FREQUENCIES}
									/>
								</Form.Item>
							</section>
						)}

						{supportsExcludeRules && (
							<section>
								<h3>Excluded Identifiers</h3>
								<p>
									Pick identifiers that you don't want to get
									alerts for.
								</p>
								<Form.Item name={excludedIdentifiersFormName}>
									<Select
										onSearch={handleIdentifierSearch}
										className={styles.channelSelect}
										options={identifierSuggestions}
										mode="tags"
										placeholder="Select a identifier(s) that should not trigger alerts."
										onChange={() => {
											setFormTouched(true)
											handleIdentifierSearch('')
										}}
									/>
								</Form.Item>
							</section>
						)}

						{canControlThreshold && (
							<>
								<section>
									<h3>Threshold</h3>
									{threshold <= 0 ? (
										<p>{`Setting the threshold to ${threshold} means no alerts will be created.`}</p>
									) : (
										<>
											<span>
												An alert will be created if{' '}
												<b>
													<TextTransition
														text={`${threshold}`}
														inline
													/>{' '}
													{defaultName.toLocaleLowerCase()}
												</b>{' '}
												happens in a{' '}
												<b>
													<TextTransition
														inline
														text={`${
															getLookbackPeriodOption(
																lookbackPeriod,
															).displayValue.slice(
																0,
																-1,
															) ||
															`${DEFAULT_LOOKBACK_PERIOD} minute`
														}`}
													/>
												</b>{' '}
												window.
											</span>
										</>
									)}
									<div className={styles.frequencyContainer}>
										<Form.Item name="threshold">
											<InputNumber
												onChange={onThresholdChange}
												min={0}
											/>
										</Form.Item>
										<Form.Item name="lookbackPeriod">
											<Select
												className={
													styles.lookbackPeriodSelect
												}
												onChange={
													onLookbackPeriodChange
												}
												options={LOOKBACK_PERIODS}
											/>
										</Form.Item>
									</div>
								</section>
							</>
						)}

						<Form.Item shouldUpdate>
							{() => (
								<div className={styles.footer}>
									{!isCreatingNewAlert && (
										<div>
											<Switch
												label="Enable"
												trackingId="MonitorEnable"
												checked={!isDisabled}
												size="default"
												onChange={(e) => {
													setFormTouched(true)
													setIsDisabled(!e)
												}}
											/>
										</div>
									)}
									<div className={styles.actionsContainer}>
										{onDeleteHandler && (
											<ConfirmModal
												buttonProps={{
													trackingId:
														'DeleteAlertConfiguration',
													type: 'default',
													danger: true,
													className:
														styles.saveButton,
													htmlType: 'button',
													loading: loading,
												}}
												onCancelHandler={() => {}}
												onConfirmHandler={() => {
													if (alert.id) {
														onDeleteHandler(
															alert.id,
														)
													}
												}}
												trackingId="DeleteAlert"
												modalTitleText={`Delete '${alert.Name}' Alert?`}
												description="Deleting an alert is irreversible. You can always create a new alert if you want to get alerted for this again."
												confirmText="Delete Alert"
												cancelText="Don't Delete Alert"
												buttonText="Delete"
											/>
										)}
										<Button
											trackingId="SaveAlertConfiguration"
											type="primary"
											className={styles.saveButton}
											htmlType="submit"
											disabled={!formTouched}
											loading={loading}
										>
											{isCreatingNewAlert
												? 'Create'
												: 'Save'}
										</Button>
									</div>
								</div>
							)}
						</Form.Item>
					</Form>
				</Card>
			</div>
		</>
	)
}

const getLookbackPeriodOption = (minutes = DEFAULT_LOOKBACK_PERIOD): any => {
	const option = LOOKBACK_PERIODS.find(
		(option) => option.value === minutes?.toString(),
	)

	if (!option) {
		return {
			displayValue: '30 minutes',
			value: '30',
			id: '30m',
		}
	}

	return option
}

const getFrequencyOption = (seconds = DEFAULT_FREQUENCY): any => {
	const option = FREQUENCIES.find(
		(option) => option.value === seconds?.toString(),
	)

	if (!option) {
		return FREQUENCIES.find((option) => option.value === DEFAULT_FREQUENCY)
	}

	return option
}

const getSingularFrequencyOption = (seconds = DEFAULT_FREQUENCY): string => {
	const displayValue = getFrequencyOption(seconds).displayValue

	return displayValue.slice(-1) !== 's'
		? displayValue
		: displayValue.slice(0, -1)
}

const getPropertiesOption = (option: any) => ({
	displayValue:
		(
			<>
				<b>{option?.name}: </b>
				{option?.value}
			</>
		) || '',
	value: `${option?.value}:${option?.name}:${option?.id}` || '',
	id: `${option?.value}:${option?.name}` || '',
	name: option?.id || '',
})
