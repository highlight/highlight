import { LinkButton } from '@components/LinkButton'
import {
	Box,
	IconSolidCheckCircle,
	Stack,
	SwitchButton,
	Text,
} from '@highlight-run/ui'
import { Header } from '@pages/Setup/Header'
import * as React from 'react'
import { useMatch } from 'react-router-dom'

interface NotificationOption {
	name: string
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

	// TODO(vkorolik) this should check whether the chosen platform is integrated

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
				<Picker
					platform={platform}
					alertsSelected={alertsSelected}
					onAlertsSelected={onAlertsSelected}
				/>
			</Box>
		</Box>
	)
}

const Picker = function ({
	platform,
	alertsSelected,
	onAlertsSelected,
}: {
	platform: string | undefined
	alertsSelected: string[]
	onAlertsSelected: (alerts: string[]) => void
}) {
	const options = platform ? alertOptions : notificationOptions
	return (
		<>
			{options.map((option, index) => {
				return (
					<Box
						key={index}
						alignItems="center"
						backgroundColor="raised"
						btr={index === 0 ? '6' : undefined}
						bbr={index === options.length - 1 ? '6' : undefined}
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
						{platform ? (
							<SwitchButton
								size="small"
								key={option.name}
								onChange={(event) => {
									if (event.target.checked) {
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
									alertsSelected.indexOf(option.name) !== -1
								}
								iconLeft={
									alertsSelected.indexOf(option.name) !==
									-1 ? (
										<IconSolidCheckCircle size={16} />
									) : undefined
								}
							/>
						) : (
							<LinkButton
								to={option.name.toLowerCase()}
								trackingId={`setup-option-${option.name}`}
								kind="secondary"
							>
								Select
							</LinkButton>
						)}
					</Box>
				)
			})}
		</>
	)
}
