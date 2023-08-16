import { Button } from '@components/Button'
import { useSlackBot } from '@components/Header/components/ConnectHighlightWithSlackButton/utils/utils'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import Switch from '@components/Switch/Switch'
import { useGetAlertsPagePayloadQuery } from '@graph/hooks'
import { Box, IconSolidSlack, Stack, Text } from '@highlight-run/ui'
import { useProjectId } from '@hooks/useProjectId'
import { getDiscordOauthUrl } from '@pages/IntegrationsPage/components/DiscordIntegration/DiscordIntegrationConfig'
import { Header } from '@pages/Setup/Header'
import useLocalStorage from '@rehooks/local-storage'
import * as React from 'react'
import { useEffect } from 'react'
import { useMatch, useNavigate } from 'react-router-dom'

interface NotificationOption {
	name: 'Slack' | 'Discord' | 'Email'
	// TODO(vkorolik)
	imageUrl: string
}

const notificationOptions: NotificationOption[] = [
	{
		name: 'Slack',
		imageUrl: 'TODO',
	},
	{
		name: 'Discord',
		imageUrl: 'TODO',
	},
	{
		name: 'Email',
		imageUrl: 'TODO',
	},
]

interface AlertOption {
	name: string
	imageUrl: string
}

const alertOptions: AlertOption[] = [
	{
		name: 'Error',
		imageUrl: 'TODO',
	},
	{
		name: 'Session',
		imageUrl: 'TODO',
	},
	{
		name: 'Log',
		imageUrl: 'TODO',
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
								{option.imageUrl ? (
									<img
										alt={option.name}
										src={option.imageUrl}
										style={{ height: 20, width: 20 }}
									/>
								) : (
									<Text userSelect="none" weight="bold">
										{(
											option.name as string
										)[0].toUpperCase()}
									</Text>
								)}
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
	alertsSelected,
	onAlertsSelected,
}: {
	platform: string
	alertsSelected: string[]
	onAlertsSelected: (alerts: string[]) => void
}) {
	return (
		<>
			{alertOptions.map((option, index) => {
				return (
					<Box
						key={index}
						alignItems="center"
						backgroundColor="raised"
						btr={index === 0 ? '6' : undefined}
						bbr={
							index === alertOptions.length - 1 ? '6' : undefined
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
								{option.imageUrl ? (
									<img
										alt={option.name}
										src={option.imageUrl}
										style={{ height: 20, width: 20 }}
									/>
								) : (
									<Text userSelect="none" weight="bold">
										{(
											option.name as string
										)[0].toUpperCase()}
									</Text>
								)}
							</Box>
							<Text color="default" weight="bold">
								{option.name as string}
							</Text>
						</Stack>
						<Switch
							trackingId={`setup-alerts-switch-${option.name}`}
							size="default"
							onChange={(checked) => {
								if (checked) {
									onAlertsSelected([
										...alertsSelected,
										option.name,
									])
								} else {
									onAlertsSelected(
										alertsSelected.filter(
											(alert) => alert !== option.name,
										),
									)
								}
							}}
							checked={alertsSelected.indexOf(option.name) !== -1}
						/>
					</Box>
				)
			})}
		</>
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
	const icon =
		type === 'slack' ? (
			<IconSolidSlack height={16} width={16} />
		) : (
			<img
				alt="discord"
				src="/images/integrations/discord.svg"
				style={{ height: 16, width: 16 }}
			/>
		)
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
