import {
	Box,
	ButtonIcon,
	IconSolidLoading,
	Heading,
	Stack,
	SwitchButton,
	Text,
} from '@highlight-run/ui/components'
import SettingsIcon from '@icons/SettingsIcon'
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import analytics from '@util/analytics'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { IntegrationModal } from '@/pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'

import styles from './Integration.module.css'
import EnterpriseFeatureButton from '@/components/Billing/EnterpriseFeatureButton'

export enum IntegrationAction {
	Setup,
	Disconnect,
	Settings,
}

export interface IntegrationConfigProps {
	setModalOpen: (newVal: boolean) => void
	setIntegrationEnabled: (newVal: boolean) => void
	action: IntegrationAction
}

interface Props {
	integration: IntegrationType
	showModalDefault?: boolean
	showSettingsDefault?: boolean
	loading?: boolean
}

const Integration = ({
	integration: {
		icon,
		noRoundedIcon,
		name,
		description,
		configurationPage,
		defaultEnable,
		hasSettings,
		modalWidth,
		docs,
	},
	showModalDefault,
	showSettingsDefault,
	loading,
}: Props) => {
	const [showConfiguration, setShowConfiguration] = useState(
		showModalDefault && !defaultEnable,
	)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [showUpdateSettings, setShowUpdateSettings] = useState(
		showSettingsDefault || false,
	)
	const [integrationEnabled, setIntegrationEnabled] = useState(defaultEnable)

	useEffect(() => {
		setIntegrationEnabled(defaultEnable)
	}, [defaultEnable, setIntegrationEnabled])
	if (loading) {
		return (
			<Box
				background="elevated"
				borderRadius="8"
				border="secondary"
				padding="16"
				display="flex"
				alignItems="center"
				justifyContent="center"
				style={{ height: 156 }}
			>
				<IconSolidLoading size={32} />
			</Box>
		)
	}

	const isGated = name === 'Jira' || name === 'Microsoft Teams'
	const enterpriseSetting =
		name === 'Jira' ? 'enable_jira_integration' : 'enable_teams_integration'
	const enterpriseName =
		name === 'Jira' ? 'Jira Integration' : 'Teams Integration'

	return (
		<>
			<Box
				background="elevated"
				borderRadius="8"
				border="secondary"
				padding="16"
				shadow="small"
				display="flex"
				flexDirection="column"
				gap="12"
				cssClass={styles.integration}
			>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="flex-start"
				>
					<Box
						as="img"
						src={icon}
						alt=""
						cssClass={clsx(styles.logo, {
							['rounded-none']: noRoundedIcon,
						})}
					/>
					<Box display="flex" flexDirection="column" gap="8">
						{isGated ? (
							<EnterpriseFeatureButton
								setting={enterpriseSetting}
								name={enterpriseName}
								fn={async () => {
									const newValue = !integrationEnabled
									if (newValue) {
										setShowConfiguration(true)
									} else {
										setShowDeleteConfirmation(true)
									}
									setIntegrationEnabled(newValue)
								}}
								variant="basic"
							>
								<SwitchButton
									checked={integrationEnabled}
									onChange={() => {
										analytics.track(
											`Switch-IntegrationConnect-${name}`,
											{
												checked: !integrationEnabled,
											},
										)
									}}
									iconLeft={
										(showConfiguration &&
											integrationEnabled) ||
										(showDeleteConfirmation &&
											!integrationEnabled) ? (
											<IconSolidLoading />
										) : undefined
									}
								>
									{!showConfiguration && integrationEnabled
										? 'Connected'
										: 'Connect'}
								</SwitchButton>
							</EnterpriseFeatureButton>
						) : (
							<SwitchButton
								checked={integrationEnabled}
								onChange={() => {
									const newValue = !integrationEnabled
									analytics.track(
										`Switch-IntegrationConnect-${name}`,
										{
											checked: newValue,
										},
									)
									if (newValue) {
										setShowConfiguration(true)
									} else {
										setShowDeleteConfirmation(true)
									}
									setIntegrationEnabled(newValue)
								}}
								iconLeft={
									(showConfiguration &&
										integrationEnabled) ||
									(showDeleteConfirmation &&
										!integrationEnabled) ? (
										<IconSolidLoading />
									) : undefined
								}
							>
								{!showConfiguration && integrationEnabled
									? 'Connected'
									: 'Connect'}
							</SwitchButton>
						)}
						{hasSettings && (
							<Box
								display="flex"
								width="full"
								justifyContent="flex-end"
								style={{ height: 18 }}
							>
								<ButtonIcon
									kind="secondary"
									emphasis="low"
									size="xSmall"
									icon={<SettingsIcon />}
									onClick={() => {
										analytics.track(
											'Button-IntegrationSettings',
										)
										setShowUpdateSettings(true)
									}}
									disabled={!integrationEnabled}
								/>
							</Box>
						)}
					</Box>
				</Box>
				<Box display="flex" flexDirection="column" gap="4">
					<Heading level="h4">
						{name}
					</Heading>
					<Text color="weak" size="small">
						{description}
					</Text>
					{docs && (
						<a
							href={docs}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Text color="weak" size="small">
								Learn more about the integration.
							</Text>
						</a>
					)}
				</Box>
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

export default Integration
