import { Button } from '@components/Button'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import Select from '@components/Select/Select'
import { useGetAlertsPagePayloadQuery } from '@graph/hooks'
import {
	Badge,
	Box,
	IconSolidDiscord,
	IconSolidNewspaper,
	IconSolidSlack,
	Stack,
	Tag,
	Text,
	vars,
} from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { getDiscordOauthUrl } from '@pages/IntegrationsPage/components/DiscordIntegration/DiscordIntegrationConfig'
import { Header } from '@pages/Setup/Header'
import useLocalStorage from '@rehooks/local-storage'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'

import Switch from '@/components/Switch/Switch'

import * as styles from './SetupRouter.css'

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
		logo: (
			<IconSolidDiscord
				height={16}
				width={16}
				fill={vars.theme.static.content.default}
			/>
		),
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
	name: string
	destination: string
	thresholdPerMinute: number
}

const alertOptions: AlertOption[] = [
	{
		name: 'Error',
		destination: 'error-alerts',
		thresholdPerMinute: 10,
	},
	{
		name: 'Session',
		destination: 'session-alerts',
		thresholdPerMinute: 1,
	},
	{
		name: 'Log',
		destination: 'log-alerts',
		thresholdPerMinute: 60,
	},
]

export const AlertsSetup: React.FC = function () {
	const platformMatch = useMatch('/:project_id/setup/alerts/:platform')
	const platform = platformMatch?.params?.platform
	const [alertsSelected, onAlertsSelected] = React.useState<string[]>([])

	useEffect(() => {
		if (alertsSelected.length) {
			// TODO(vkorolik) create the alerts
		}
	}, [alertsSelected])

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
					<AlertPicker
						platform={platform}
						alertsSelected={alertsSelected}
						onAlertsSelected={onAlertsSelected}
					/>
				) : (
					<PlatformPicker />
				)}
			</Box>
		</Box>
	)
}

const PlatformPicker: React.FC = function () {
	const navigate = useNavigate()
	const [integratePlatform, setIntegratePlatform] = useLocalStorage<
		string | undefined
	>('setup-alerts-platform')
	const { projectId } = useProjectId()
	const { data, loading } = useGetAlertsPagePayloadQuery({
		variables: { project_id: projectId },
	})
	const emails = (data?.admins ?? [])
		.map((wa) => wa.admin!.email)
		.map((email) => ({
			displayValue: email,
			value: email,
			id: email,
		}))

	useEffect(() => {
		if (
			(integratePlatform === 'slack' && data?.is_integrated_with_slack) ||
			(integratePlatform === 'discord' &&
				data?.is_integrated_with_discord)
		) {
			setIntegratePlatform(undefined)
			navigate(integratePlatform)
		}
	}, [
		integratePlatform,
		data?.is_integrated_with_slack,
		data?.is_integrated_with_discord,
		navigate,
		setIntegratePlatform,
	])

	if (loading) return null
	return (
		<>
			{integratePlatform === 'email' ? (
				<EmailPicker
					emails={emails}
					onSubmit={(emails) => {
						setIntegratePlatform(undefined)
						navigate(integratePlatform, { state: { emails } })
					}}
					onCancel={() => setIntegratePlatform(undefined)}
				/>
			) : null}
			{(integratePlatform === 'slack' &&
				!data?.is_integrated_with_slack) ||
			(integratePlatform === 'discord' &&
				!data?.is_integrated_with_discord) ? (
				<IntegrationCallout
					type={integratePlatform}
					onCancel={() => setIntegratePlatform(undefined)}
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
						<Button
							onClick={() =>
								setIntegratePlatform(option.name.toLowerCase())
							}
							trackingId={`setup-option-${option.name}`}
							kind="secondary"
						>
							Select
						</Button>
					</Box>
				)
			})}
		</>
	)
}

const AlertPicker = function ({
	platform,
	alertsSelected,
	onAlertsSelected,
}: {
	platform: string
	alertsSelected: string[]
	onAlertsSelected: (alerts: string[]) => void
}) {
	const location = useLocation()
	const notificationOption = notificationOptions.find(
		(n) => n.name.toLowerCase() === platform,
	)
	let destinations: string[] | undefined
	if (platform === 'email') {
		destinations = location.state.emails
	}
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
									{destinations
										? destinations.join(', ')
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
	const { slackUrl } = useSlackBot()
	const name = type === 'slack' ? 'Slack' : 'Discord'
	const integrateUrl =
		type === 'slack' ? slackUrl : getDiscordOauthUrl(projectId)
	const icon = notificationOptions.find((n) => n.name === name)?.logo
	return (
		<Modal onCancel={onCancel} visible={true} width="600px">
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
	emails,
	onSubmit,
	onCancel,
}: {
	emails: { displayValue: string; value: string; id: string }[]
	onSubmit: (emails: string[]) => void
	onCancel: () => void
}) {
	const [targetEmails, setTargetEmails] = useState<string[]>([])
	const icon = notificationOptions.find((n) => n.name === 'Email')?.logo
	return (
		<Modal onCancel={onCancel} visible={true} width="600px">
			<ModalBody>
				<Stack>
					<Text size="large" weight="bold">
						Send alerts to an email
					</Text>
					<Text size="medium" color="moderate">
						Please provide the emails you'd like to notify.
					</Text>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
						gap="8"
					>
						<Select
							aria-label="Emails to notify"
							placeholder="Select emails"
							options={emails}
							onChange={(values: string[]): any =>
								setTargetEmails(values)
							}
							value={targetEmails}
							notFoundContent={<p>No email suggestions</p>}
							className={styles.selectContainer}
							mode="multiple"
						/>
						<Box display="flex" alignItems="center" gap="8">
							<Button
								trackingId="setup-alerts-integration-email"
								kind="secondary"
								size="small"
								emphasis="high"
								iconLeft={icon}
								onClick={() => onSubmit(targetEmails)}
							>
								Select
							</Button>
							<Button
								trackingId="setup-alerts-integration-email-cancel"
								kind="secondary"
								size="small"
								emphasis="low"
								onClick={onCancel}
							>
								Cancel
							</Button>
						</Box>
					</Box>
				</Stack>
			</ModalBody>
		</Modal>
	)
}
