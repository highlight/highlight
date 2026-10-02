import { Box, Stack, Text } from '@highlight-run/ui/components'
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import { useState } from 'react'

import { IntegrationAction } from '@/pages/IntegrationsPage/components/Integration'
import { IntegrationModal } from '@/pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'
import EnterpriseFeatureButton from '@/components/Billing/EnterpriseFeatureButton'

import * as styles from './IntegrationsPage.css'

interface Props {
	integration: IntegrationType & { defaultEnable?: boolean }
	loading?: boolean
}

const IntegrationDetail = ({ integration, loading }: Props) => {
	const {
		icon,
		noRoundedIcon,
		name,
		description,
		configurationPage,
		defaultEnable,
		hasSettings,
		modalWidth,
		docs,
	} = integration

	const isConnected = !!defaultEnable
	const [showConfiguration, setShowConfiguration] = useState(false)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [showUpdateSettings, setShowUpdateSettings] = useState(false)
	const [integrationEnabled, setIntegrationEnabled] = useState(isConnected)

	const isGated = name === 'Jira' || name === 'Microsoft Teams'
	const enterpriseSetting =
		name === 'Jira' ? 'enable_jira_integration' : 'enable_teams_integration'
	const enterpriseName =
		name === 'Jira' ? 'Jira Integration' : 'Teams Integration'

	if (loading) {
		return (
			<Box p="16">
				<Text>Loading...</Text>
			</Box>
		)
	}

	const handleConnect = () => {
		setShowConfiguration(true)
		setIntegrationEnabled(true)
	}

	const handleDisconnect = () => {
		setShowDeleteConfirmation(true)
		setIntegrationEnabled(false)
	}

	return (
		<>
			<Box p="16">
				<Stack gap="16">
					<Stack direction="row" align="center" gap="8">
						<img
							src={icon}
							alt=""
							className={styles.detailIcon}
							style={
								noRoundedIcon
									? { borderRadius: 0 }
									: undefined
							}
						/>
						<Text size="large" weight="bold">
							{name}
						</Text>
					</Stack>

					<Box
						border="secondary"
						borderRadius="6"
						p="12"
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Stack direction="row" align="center" gap="8">
							<Text size="small" color="secondaryContentText">
								Status:
							</Text>
							<Text
								size="small"
								weight="medium"
								color={
									isConnected
										? 'primaryEnabled'
										: 'secondaryContentText'
								}
							>
								{isConnected ? 'Connected' : 'Not connected'}
							</Text>
						</Stack>
						{isConnected ? (
							<Stack direction="row" gap="4">
								{hasSettings && (
									<Box
										as="button"
										border="secondary"
										borderRadius="6"
										p="4"
										px="8"
										cursor="pointer"
										onClick={() =>
											setShowUpdateSettings(true)
										}
									>
										<Text size="xSmall">Settings</Text>
									</Box>
								)}
								<Box
									as="button"
									border="secondary"
									borderRadius="6"
									p="4"
									px="8"
									cursor="pointer"
									onClick={handleDisconnect}
								>
									<Text
										size="xSmall"
										color="secondaryContentText"
									>
										Disconnect
									</Text>
								</Box>
							</Stack>
						) : isGated ? (
							<EnterpriseFeatureButton
								setting={enterpriseSetting}
								name={enterpriseName}
								fn={async () => handleConnect()}
								variant="basic"
							>
								<Box
									border="secondary"
									borderRadius="6"
									p="4"
									px="8"
									cursor="pointer"
								>
									<Text size="xSmall">Connect</Text>
								</Box>
							</EnterpriseFeatureButton>
						) : (
							<Box
								as="button"
								border="secondary"
								borderRadius="6"
								p="4"
								px="8"
								cursor="pointer"
								onClick={handleConnect}
							>
								<Text size="xSmall">Connect</Text>
							</Box>
						)}
					</Box>

					<Stack gap="4">
						<Text
							size="small"
							weight="bold"
							color="secondaryContentText"
						>
							About
						</Text>
						<Text size="small" color="secondaryContentText">
							{description}
						</Text>
						{docs && (
							<a
								href={docs}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Text size="xSmall" color="primaryEnabled">
									Learn more about this integration
								</Text>
							</a>
						)}
					</Stack>
				</Stack>
			</Box>

			<IntegrationModal
				width={modalWidth}
				visible={
					showConfiguration ||
					showDeleteConfirmation ||
					showUpdateSettings
				}
				onCancel={() => {
					if (showConfiguration) {
						setShowConfiguration(false)
						setIntegrationEnabled(false)
					} else if (showDeleteConfirmation) {
						setShowDeleteConfirmation(false)
						setIntegrationEnabled(true)
					} else {
						setShowUpdateSettings(false)
					}
				}}
				title={
					showDeleteConfirmation
						? 'Are you sure?'
						: `Configuring ${name} Integration`
				}
				configurationPage={() => {
					if (showConfiguration) {
						return configurationPage({
							setModalOpen: setShowConfiguration,
							setIntegrationEnabled,
							action: IntegrationAction.Setup,
						})
					}
					if (showDeleteConfirmation) {
						return configurationPage({
							setModalOpen: setShowDeleteConfirmation,
							setIntegrationEnabled,
							action: IntegrationAction.Disconnect,
						})
					}
					if (showUpdateSettings) {
						return configurationPage({
							setModalOpen: setShowUpdateSettings,
							setIntegrationEnabled,
							action: IntegrationAction.Settings,
						})
					}
				}}
			/>
		</>
	)
}

export default IntegrationDetail
