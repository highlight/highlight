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
	Callout,
	Form,
	IconSolidCheck,
	IconSolidCheveronRight,
	IconSolidDiscord,
	IconSolidMicrosoftTeams,
	IconSolidNewspaper,
	IconSolidSlack,
	Stack,
	Tag,
	Text,
	TextLink,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import { useProjectId } from '@hooks/useProjectId'
import { DEFAULT_FREQUENCY } from '@pages/Alerts/AlertConfigurationCard/AlertConfigurationConstants'
import { getDiscordOauthUrl } from '@pages/IntegrationsPage/components/DiscordIntegration/DiscordIntegrationConfig'
import { Header } from '@pages/Setup/Header'
import useLocalStorage from '@rehooks/local-storage'
import analytics from '@util/analytics'
import { client } from '@util/graph'
import { message } from 'antd'
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'

import Switch from '@/components/Switch/Switch'
import { getMicrosoftTeamsUrl } from '@/pages/IntegrationsPage/components/MicrosoftTeamsIntegration/utils'
import { useIntegratedLocalStorage } from '@/util/integrated'

interface NotificationOption {
	name: 'Slack' | 'Discord' | 'Email' | 'Microsoft Teams'
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
		name: 'Microsoft Teams',
		logo: <IconSolidMicrosoftTeams height={16} width={16} />,
		logoDisabled: (
			<IconSolidMicrosoftTeams
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

const AlertsSetupHeader: React.FC = function () {
	return (
		<Header
			title="Create alerts for your app"
			subtitle="Don’t search for interesting activity; get alerted proactively."
		/>
	)
}

export const AlertsSetup: React.FC = function () {
	const { projectId } = useProjectId()
	const navigate = useNavigate()
	const [alertsSetup] = useIntegratedLocalStorage(projectId, 'alerts')
	const [hidden, setHidden] = useState<boolean>()
	const platformMatch = useMatch('/:project_id/setup/alerts/:platform')
	const platform = platformMatch?.params?.platform as
		| 'slack'
		| 'discord'
		| 'email'
		| 'microsoft_teams'
		| undefined

	// cache the state of the alerts setup so that we only decide
	// to not show the flow if the setup wasn't completed from the start
	useEffect(() => {
		if (hidden === undefined) {
			setHidden(alertsSetup?.integrated)
		}
	}, [alertsSetup, hidden])

	if (hidden) {
		return (
			<Box style={{ maxWidth: 560, marginTop: 80 }} margin="auto">
				<AlertsSetupHeader />
				<Callout title="You have already created alerts.">
					<Stack gap="16">
						<Text size="small" weight="medium" color="moderate">
							Go to the alerts page to create new alerts, or
							configure existing ones. If you want to learn more
							about alerts, be sure to read the docs!
						</Text>
						<Box display="flex" alignItems="center" gap="8">
							<Button
								kind="secondary"
								size="small"
								emphasis="high"
								trackingId="setup-alerts-configure"
								onClick={() => navigate(`/${projectId}/alerts`)}
							>
								Go to alerts
							</Button>
							<Button
								kind="secondary"
								emphasis="low"
								trackingId="setup-alerts-learn-more"
								onClick={() =>
									window.open(
										'https://www.highlight.io/docs/general/product-features/general-features/alerts',
										'_blank',
									)
								}
							>
								Learn more
							</Button>
						</Box>
					</Stack>
				</Callout>
			</Box>
		)
	}

	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<AlertsSetupHeader />
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
			(integratePlatform === 'microsoft_teams' &&
				data?.is_integrated_with_microsoft_teams) ||
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
		data?.is_integrated_with_microsoft_teams,
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
			(integratePlatform === 'microsoft_teams' &&
				!data?.is_integrated_with_microsoft_teams) ||
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
							(option.name === 'Microsoft Teams' &&
								data?.is_integrated_with_microsoft_teams) ||
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
									: option.name === 'Microsoft Teams'
									? data?.is_integrated_with_microsoft_teams
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
	platform: 'slack' | 'discord' | 'email' | 'microsoft_teams'
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

	const [createSessionAlert] = useCreateSessionAlertMutation()

	const [createErrorAlert] = useCreateErrorAlertMutation()

	const [createLogAlert] = useCreateLogAlertMutation()

	const [upsertSlackChannel] = useUpsertSlackChannelMutation()
	const [upsertDiscordChannel] = useUpsertDiscordChannelMutation()

	const hasDefaultSessionAlert = data?.new_session_alerts.find(
		(a) => a?.default,
	)
	const hasDefaultErrorAlert = data?.error_alerts.find((a) => a?.default)
	const hasDefaultLogAlert = data?.log_alerts.find((a) => a?.default)
	const hasChanges =
		alertsSelected.includes('Session') !== !!hasDefaultSessionAlert ||
		alertsSelected.includes('Error') !== !!hasDefaultErrorAlert ||
		alertsSelected.includes('Log') !== !!hasDefaultLogAlert

	useEffect(() => {
		onAlertsSelected([
			...(hasDefaultSessionAlert ? (['Session'] as const) : []),
			...(hasDefaultErrorAlert ? (['Error'] as const) : []),
			...(hasDefaultLogAlert ? (['Log'] as const) : []),
		])
	}, [hasDefaultErrorAlert, hasDefaultLogAlert, hasDefaultSessionAlert])

	const getChannelID = useCallback(
		async (destination: string) => {
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
			return channelID
		},
		[platform, projectId, upsertDiscordChannel, upsertSlackChannel],
	)

	const createAlerts = useCallback(async () => {
		const promises: Promise<any>[] = []
		for (const alert of alertsSelected) {
			if (alertsCreated.current.has(alert)) continue
			alertsCreated.current.add(alert)
			const destination =
				alertOptions.find((a) => a.name === alert)?.destination ?? ''

			promises.push(
				getChannelID(destination).then((channelID) => {
					analytics.track(`setup-alerts-create-${alert}`, {
						platform,
						destination,
						channelID,
						emailDestination,
						projectId,
					})

					const a = alertOptions.find((a) => a.name === alert)
					const requestVariables = {
						project_id: projectId,
						count_threshold: a?.thresholdPerMinute ?? 1,
						threshold_window: Number(DEFAULT_FREQUENCY),
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
						microsoft_teams_channels:
							platform === 'microsoft_teams'
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

					if (alert === 'Session') {
						if (!hasDefaultSessionAlert) {
							return createSessionAlert({
								variables: {
									input: {
										...requestVariables,
										name: 'New Session Alert',
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
							return createErrorAlert({
								variables: {
									...requestVariables,
									name: 'Error Alert',
									regex_groups: [],
									frequency: 3600,
								},
							})
						}
					} else if (alert === 'Log') {
						if (!hasDefaultLogAlert) {
							return createLogAlert({
								variables: {
									input: {
										...requestVariables,
										name: 'Error Log Alert',
										below_threshold: false,
										disabled: false,
										query: 'level:error',
									},
								},
							})
						}
					}
				}),
			)
		}
		await Promise.all(promises)
		await client.refetchQueries({
			include: [namedOperations.Query.GetAlertsPagePayload],
		})
	}, [
		alertsSelected,
		createErrorAlert,
		createLogAlert,
		createSessionAlert,
		emailDestination,
		getChannelID,
		hasDefaultErrorAlert,
		hasDefaultLogAlert,
		hasDefaultSessionAlert,
		platform,
		projectId,
	])

	const onSave = useCallback(async () => {
		try {
			createLoading.current = true
			await createAlerts()
		} catch (e) {
			message.error(`An error occurred creating alerts.`)
		} finally {
			createLoading.current = false
		}
	}, [createAlerts])

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
									disabled={
										!!(
											(option.name === 'Session' &&
												hasDefaultSessionAlert) ||
											(option.name === 'Error' &&
												hasDefaultErrorAlert) ||
											(option.name === 'Log' &&
												hasDefaultLogAlert)
										)
									}
									onChange={(checked) => {
										if (
											!checked &&
											((option.name === 'Session' &&
												hasDefaultSessionAlert) ||
												(option.name === 'Error' &&
													hasDefaultErrorAlert) ||
												(option.name === 'Log' &&
													hasDefaultLogAlert))
										) {
											return
										}
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
									checked={alertsSelected.includes(
										option.name,
									)}
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
										!alertsSelected.includes(option.name)
											? notificationOption?.logoDisabled
											: notificationOption?.logo
									}
									disabled={
										!alertsSelected.includes(option.name)
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
									label={`${
										option.thresholdPerMinute
									} ${option.name.toLowerCase()}${
										option.thresholdPerMinute <= 1
											? ''
											: 's'
									}/min`}
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
						loading={createLoading.current}
						disabled={!hasChanges}
						onClick={onSave}
					>
						Save
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
	type: 'slack' | 'discord' | 'microsoft_teams'
	onCancel: () => void
}) {
	const { projectId } = useProjectId()
	const { slackUrl } = useSlackBot(`setup/alerts/slack`)
	const name =
		type === 'slack'
			? 'Slack'
			: type === 'discord'
			? 'Discord'
			: 'Microsoft Teams'
	const integrateUrl =
		type === 'slack'
			? slackUrl
			: type === 'discord'
			? getDiscordOauthUrl(
					projectId,
					`/${projectId}/setup/alerts/discord`,
			  )
			: getMicrosoftTeamsUrl(projectId)
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
	const formStore = Form.useStore({
		defaultValues: {
			email: '',
		},
	})
	formStore.useSubmit(async (formState) => {
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
