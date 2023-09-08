import { Button } from '@components/Button'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import LoadingBox from '@components/LoadingBox'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import {
	useCreateErrorAlertMutation,
	useCreateLogAlertMutation,
	useCreateSessionAlertMutation,
	useGetAlertsPagePayloadQuery,
	useUpsertDiscordChannelMutation,
	useUpsertSlackChannelMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { SessionAlertType } from '@graph/schemas'
import {
	Badge,
	Box,
	Form,
	IconSolidCheck,
	IconSolidCheveronRight,
	IconSolidDiscord,
	IconSolidNewspaper,
	IconSolidSlack,
	Stack,
	Tag,
	Text,
	TextLink,
	useFormStore,
	vars,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { getDiscordOauthUrl } from '@pages/IntegrationsPage/components/DiscordIntegration/DiscordIntegrationConfig'
import { Header } from '@pages/Setup/Header'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { message } from 'antd'
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'

import Switch from '@/components/Switch/Switch'
import { LocalStorageIntegrationData } from '@/util/integrated'

interface NotificationOption {
	name: 'Slack' | 'Discord' | 'Email'
	logo: JSX.Element
	logoDisabled: JSX.Element
}

const notificationOptions: NotificationOption[] = [
	{
		name: 'Slack',
		logo: <IconSolidSlack height={16} width={16} />,
		logoDisabled: (
			<IconSolidSlack
				height={16}
				width={16}
				fill={vars.theme.interactive.fill.secondary.content.onDisabled}
			/>
		),
	},
	{
		name: 'Discord',
		logo: <IconSolidDiscord height={16} width={16} />,
		logoDisabled: (
			<IconSolidDiscord
				height={16}
				width={16}
				fill={vars.theme.interactive.fill.secondary.content.onDisabled}
			/>
		),
	},
	{
		name: 'Email',
		logo: <IconSolidNewspaper height={16} width={16} />,
		logoDisabled: (
			<IconSolidNewspaper
				height={16}
				width={16}
				fill={vars.theme.interactive.fill.secondary.content.onDisabled}
			/>
		),
	},
]

interface AlertOption {
	name: 'Session' | 'Error' | 'Log'
	destination: string
	thresholdPerMinute: number
}

const alertOptions: AlertOption[] = [
	{
		name: 'Session',
		destination: 'session-alerts',
		thresholdPerMinute: 1,
	},
	{
		name: 'Error',
		destination: 'error-alerts',
		thresholdPerMinute: 10,
	},
	{
		name: 'Log',
		destination: 'log-alerts',
		thresholdPerMinute: 60,
	},
]

export const AlertsSetup: React.FC = function () {
	const { projectId } = useProjectId()
	const [alertsSetup] = useLocalStorage<LocalStorageIntegrationData>(
		`highlight-${projectId}-alerts-integration`,
	)
	const [hidden, setHidden] = useState<boolean>()
	const platformMatch = useMatch('/:project_id/setup/alerts/:platform')
	const platform = platformMatch?.params?.platform as
		| 'slack'
		| 'discord'
		| 'email'
		| undefined

	// cache the state of the alerts setup so that we only decide
	// to not show the flow if the setup wasn't completed from the start
	useEffect(() => {
		if (hidden === undefined) {
			setHidden(alertsSetup?.integrated)
		}
	}, [alertsSetup, hidden])

	if (hidden) {
		return null
	}

	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Header
					title="Create alerts for your app"
					subtitle={
						'Don’t search for interesting activity, get alerted proactively. ' +
						'Connect your messaging platform of choice.'
					}
				/>
				{platform ? (
					<AlertPicker platform={platform} />
				) : (
					<PlatformPicker />
				)}
			</Box>
		</Box>
	)
}

const PlatformPicker: React.FC = function () {
	const navigate = useNavigate()
	const [integratePlatform, setIntegratePlatform, clearIntegratePlatform] =
		useLocalStorage<string | undefined>('setup-alerts-platform')
	const { projectId } = useProjectId()
	const { data, loading } = useGetAlertsPagePayloadQuery({
		variables: { project_id: projectId },
	})

	useEffect(() => {
		if (
			(integratePlatform === 'slack' && data?.is_integrated_with_slack) ||
			(integratePlatform === 'discord' &&
				data?.is_integrated_with_discord)
		) {
			clearIntegratePlatform()
			navigate(integratePlatform)
		}
	}, [
		integratePlatform,
		data?.is_integrated_with_slack,
		data?.is_integrated_with_discord,
		navigate,
		clearIntegratePlatform,
	])

	if (loading) return <LoadingBox width={111} />
	return (
		<>
			{integratePlatform === 'email' ? (
				<EmailPicker
					onSubmit={(email) => {
						clearIntegratePlatform()
						navigate(integratePlatform, { state: { email } })
					}}
					onCancel={() => clearIntegratePlatform()}
				/>
			) : null}
			{(integratePlatform === 'slack' &&
				!data?.is_integrated_with_slack) ||
			(integratePlatform === 'discord' &&
				!data?.is_integrated_with_discord) ? (
				<IntegrationCallout
					type={integratePlatform}
					onCancel={() => clearIntegratePlatform()}
				/>
			) : null}
			{notificationOptions.map((option, index) => {
				return (
					<Box
						key={index}
						alignItems="center"
						backgroundColor="raised"
						btr={index === 0 ? '6' : undefined}
						bbr={
							index === notificationOptions.length - 1
								? '6'
								: undefined
						}
						borderTop={index !== 0 ? 'dividerWeak' : undefined}
						display="flex"
						flexGrow={1}
						justifyContent="space-between"
						py="12"
						px="16"
					>
						<Stack align="center" direction="row" gap="10">
							<Box
								alignItems="center"
								backgroundColor="white"
								borderRadius="5"
								display="flex"
								justifyContent="center"
								style={{ height: 28, width: 28 }}
							>
								{option.logo}
							</Box>
							<Text color="default" weight="bold">
								{option.name as string}
							</Text>
						</Stack>
						<Box display="flex" alignItems="center" gap="8">
							{(option.name === 'Slack' &&
								data?.is_integrated_with_slack) ||
							(option.name === 'Discord' &&
								data?.is_integrated_with_discord) ? (
								<Badge
									size="medium"
									variant="purple"
									label="Connected"
									iconStart={<IconSolidCheck />}
								/>
							) : null}
							<Button
								onClick={() =>
									setIntegratePlatform(
										option.name.toLowerCase(),
									)
								}
								trackingId={`setup-option-${option.name}`}
								kind="secondary"
							>
								{option.name === 'Slack'
									? data?.is_integrated_with_slack
										? 'Continue'
										: 'Connect'
									: option.name === 'Discord'
									? data?.is_integrated_with_discord
										? 'Continue'
										: 'Connect'
									: 'Continue'}
							</Button>
						</Box>
					</Box>
				)
			})}
		</>
	)
}

const AlertPicker = function ({
	platform,
}: {
	platform: 'slack' | 'discord' | 'email'
}) {
	const { projectId } = useProjectId()
	const createLoading = useRef<boolean>(false)
	const alertsCreated = useRef<Set<'Session' | 'Error' | 'Log'>>(
		new Set<'Session' | 'Error' | 'Log'>(),
	)
	const location = useLocation()
	const notificationOption = notificationOptions.find(
		(n) => n.name.toLowerCase() === platform,
	)
	const emailDestination =
		platform === 'email' ? (location.state.email as string) : undefined

	const [alertsSelected, onAlertsSelected] = React.useState<
		('Session' | 'Error' | 'Log')[]
	>([])

	const { data, loading } = useGetAlertsPagePayloadQuery({
		variables: { project_id: projectId },
		fetchPolicy: 'network-only',
	})

	const [createSessionAlert] = useCreateSessionAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const [createErrorAlert] = useCreateErrorAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const [createLogAlert] = useCreateLogAlertMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const [upsertSlackChannel] = useUpsertSlackChannelMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})
	const [upsertDiscordChannel] = useUpsertDiscordChannelMutation({
		refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
	})

	const hasDefaultSessionAlert = data?.new_session_alerts.find(
		(a) => a?.default,
	)
	const hasDefaultErrorAlert = data?.error_alerts.find((a) => a?.default)
	const hasDefaultLogAlert = data?.log_alerts.find((a) => a?.default)

	useEffect(() => {
		onAlertsSelected([
			...(hasDefaultSessionAlert ? (['Session'] as const) : []),
			...(hasDefaultErrorAlert ? (['Error'] as const) : []),
			...(hasDefaultLogAlert ? (['Log'] as const) : []),
		])
	}, [hasDefaultErrorAlert, hasDefaultLogAlert, hasDefaultSessionAlert])

	const createAlerts = useCallback(async () => {
		for (const alert of alertsSelected) {
			if (alertsCreated.current.has(alert)) continue
			alertsCreated.current.add(alert)
			const destination =
				alertOptions.find((a) => a.name === alert)?.destination ?? ''
			let channelID = ''
			if (platform === 'slack') {
				const { data } = await upsertSlackChannel({
					variables: {
						project_id: projectId,
						name: destination,
					},
				})
				channelID = data?.upsertSlackChannel.webhook_channel_id ?? ''
			} else if (platform === 'discord') {
				const { data } = await upsertDiscordChannel({
					variables: {
						project_id: projectId,
						name: destination,
					},
				})
				channelID = data?.upsertDiscordChannel.id ?? ''
			}
			analytics.track(`setup-alerts-create-${alert}`, {
				platform,
				destination,
				channelID,
				emailDestination,
				projectId,
			})

			const requestVariables = {
				project_id: projectId,
				count_threshold: 1,
				slack_channels:
					platform === 'slack'
						? [
								{
									webhook_channel_id: channelID,
									webhook_channel_name: destination,
								},
						  ]
						: [],
				discord_channels:
					platform === 'discord'
						? [
								{
									id: channelID,
									name: destination,
								},
						  ]
						: [],
				emails: emailDestination ? [emailDestination] : [],
				environments: [],
				webhook_destinations: [],
				default: true,
			}
			const requestBody = {
				refetchQueries: [namedOperations.Query.GetAlertsPagePayload],
			}

			if (alert === 'Session') {
				if (!hasDefaultSessionAlert) {
					await createSessionAlert({
						...requestBody,
						variables: {
							input: {
								...requestVariables,
								name: 'New Session Alert',
								threshold_window: 1,
								exclude_rules: [],
								user_properties: [],
								track_properties: [],
								disabled: false,
								type: SessionAlertType.NewSessionAlert,
							},
						},
					})
				}
			} else if (alert === 'Error') {
				if (!hasDefaultErrorAlert) {
					await createErrorAlert({
						...requestBody,
						variables: {
							...requestVariables,
							name: 'Error Alert',
							threshold_window: 1,
							regex_groups: [],
							frequency: 3600,
						},
					})
				}
			} else if (alert === 'Log') {
				if (!hasDefaultLogAlert) {
					await createLogAlert({
						...requestBody,
						variables: {
							input: {
								...requestVariables,
								name: 'Error Log Alert',
								threshold_window: 1,
								below_threshold: false,
								disabled: false,
								query: 'level:error',
							},
						},
					})
				}
			}
		}
	}, [
		alertsSelected,
		createErrorAlert,
		createLogAlert,
		createSessionAlert,
		emailDestination,
		hasDefaultErrorAlert,
		hasDefaultLogAlert,
		hasDefaultSessionAlert,
		platform,
		projectId,
		upsertDiscordChannel,
		upsertSlackChannel,
	])

	const onSave = useCallback(async () => {
		try {
			createLoading.current = true
			await createAlerts()
			message.success(
				`${alertsSelected.length} alert${
					alertsSelected.length > 1 ? 's' : ''
				} updated!`,
			)
		} catch (e) {
			message.error(`An error occurred creating alerts.`)
		} finally {
			createLoading.current = false
		}
	}, [alertsSelected.length, createAlerts])

	if (loading) return <LoadingBox width={111} />
	return (
		<Stack gap="0">
			{alertOptions.map((option, index) => {
				return (
					<Stack key={index} gap="0">
						<Box
							display="flex"
							flexDirection="column"
							gap="8"
							padding="12"
							bb="dividerWeak"
							bl="dividerWeak"
							br="dividerWeak"
							bt={index === 0 ? 'dividerWeak' : undefined}
							btr={index === 0 ? '6' : undefined}
							bbr={
								index === alertOptions.length - 1
									? '6'
									: undefined
							}
						>
							<Box display="flex" alignItems="center" gap="8">
								<Switch
									trackingId={`setup-alerts-switch-${option.name}`}
									size="small"
									onChange={(checked) => {
										if (checked) {
											onAlertsSelected([
												...alertsSelected,
												option.name,
											])
										} else {
											onAlertsSelected(
												alertsSelected.filter(
													(alert) =>
														alert !== option.name,
												),
											)
										}
									}}
									checked={
										alertsSelected.indexOf(option.name) !==
										-1
									}
								/>
								<Text size="medium" color="strong">
									{option.name} Alert
								</Text>
							</Box>
							<Box display="flex" alignItems="center" gap="4">
								<Tag
									size="medium"
									shape="basic"
									kind="secondary"
									emphasis="medium"
									iconLeft={
										alertsSelected.indexOf(option.name) ===
										-1
											? notificationOption?.logoDisabled
											: notificationOption?.logo
									}
									disabled={
										alertsSelected.indexOf(option.name) ===
										-1
									}
								>
									{emailDestination
										? emailDestination
										: option.destination}
								</Tag>
								<Badge
									size="medium"
									shape="rounded"
									variant="gray"
									label={`${option.thresholdPerMinute} alerts/min`}
								/>
							</Box>
						</Box>
					</Stack>
				)
			})}

			<Stack gap="4" mt="24">
				<Box>
					<Button
						trackingId="save-alerts"
						kind="primary"
						size="small"
						emphasis="high"
						iconRight={<IconSolidCheveronRight />}
						loading={createLoading.current}
						disabled={createLoading.current}
						onClick={onSave}
					>
						Save & continue
					</Button>
				</Box>
				<Box
					alignItems="center"
					display="flex"
					gap="4"
					color="weak"
					flexWrap="nowrap"
				>
					<Text size="medium" color="moderate" lines="1">
						We've prefilled the alert configurations based on
						typical use-cases.{' '}
					</Text>
					<TextLink href="/alerts">
						<Box alignItems="center" display="flex" gap="2">
							<Text size="medium">Go to alerts</Text>
							<IconSolidCheveronRight />
						</Box>
					</TextLink>
				</Box>
			</Stack>
		</Stack>
	)
}

const IntegrationCallout = function ({
	type,
	onCancel,
}: {
	type: 'slack' | 'discord'
	onCancel: () => void
}) {
	const { projectId } = useProjectId()
	const { slackUrl } = useSlackBot(`setup/alerts/slack`)
	const name = type === 'slack' ? 'Slack' : 'Discord'
	const integrateUrl =
		type === 'slack'
			? slackUrl
			: getDiscordOauthUrl(
					projectId,
					`/${projectId}/setup/alerts/discord`,
			  )
	const icon = notificationOptions.find((n) => n.name === name)?.logo
	return (
		<Modal
			onCancel={onCancel}
			visible={true}
			width="360px"
			minimal
			minimalPaddingSize="12px"
		>
			<ModalBody>
				<Stack>
					<Text size="large" weight="bold">
						Connect to {name}
					</Text>
					<Text size="medium" color="moderate">
						In order to send alerts to {name}, please sign in with
						your account in {name}.
					</Text>
					<Box display="flex" alignItems="center" gap="8">
						<Button
							trackingId={`setup-alerts-integration-${type}`}
							kind="secondary"
							size="small"
							emphasis="high"
							iconLeft={icon}
							onClick={() =>
								(window.location.href = integrateUrl)
							}
						>
							Connect {name}
						</Button>
						<Button
							trackingId={`setup-alerts-integration-${type}-cancel`}
							kind="secondary"
							size="small"
							emphasis="low"
							onClick={onCancel}
						>
							Cancel
						</Button>
					</Box>
				</Stack>
			</ModalBody>
		</Modal>
	)
}

const EmailPicker = function ({
	onSubmit,
	onCancel,
}: {
	onSubmit: (email: string) => void
	onCancel: () => void
}) {
	const formStore = useFormStore({
		defaultValues: {
			email: '',
		},
	})
	const formState = formStore.getState()
	formStore.useSubmit(async () => {
		onSubmit(formState.values.email)
	})
	return (
		<Modal
			onCancel={onCancel}
			visible={true}
			width="360px"
			minimal
			minimalPaddingSize="12px"
		>
			<ModalBody>
				<Stack gap="8">
					<Text size="large" weight="bold">
						Send alerts to an email
					</Text>
					<Text size="medium" color="moderate">
						In order to send alerts to an email, please type in your
						preferred email address.
					</Text>
					<Form store={formStore}>
						<Stack gap="8">
							<Box
								display="flex"
								justifyContent="space-between"
								alignItems="center"
								gap="8"
							>
								<Form.Input
									placeholder="Enter email"
									type="email"
									autoComplete="email"
									autoFocus
									required
									name={formStore.names.email}
								/>
							</Box>
							<Box display="flex" alignItems="center" gap="8">
								<Button
									type="submit"
									trackingId="setup-alerts-integration-email"
									size="small"
									kind="primary"
									emphasis="high"
								>
									Select
								</Button>
								<Button
									trackingId="setup-alerts-integration-email-cancel"
									size="small"
									kind="secondary"
									emphasis="low"
									onClick={onCancel}
								>
									Cancel
								</Button>
							</Box>
						</Stack>
					</Form>
				</Stack>
			</ModalBody>
		</Modal>
	)
}
