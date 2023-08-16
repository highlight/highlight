import { Button } from '@components/Button'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
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
import { useEffect } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'

import Switch from '@/components/Switch/Switch'

interface NotificationOption {
	name: 'Slack' | 'Discord' | 'Email'
	logo: JSX.Element
}

const notificationOptions: NotificationOption[] = [
	{
		name: 'Slack',
		logo: <IconSolidSlack height={16} width={16} />,
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
	},
	{
		name: 'Email',
		logo: <IconSolidNewspaper height={16} width={16} />,
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
	const platformIcon = notificationOptions.find(
		(n) => n.name.toLowerCase() === platform,
	)?.logo
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
									iconLeft={platformIcon}
								>
									{option.destination}
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
