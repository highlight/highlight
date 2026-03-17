import Button from '@components/Button/Button/Button'
import Switch from '@components/Switch/Switch'
import SettingsIcon from '@icons/SettingsIcon'
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
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
			<div className={styles.cardContainer}>
				<div className={styles.header}>
					<div
						className="animate-pulse rounded-md"
						style={{
							backgroundColor: 'var(--color-gray-200)',
							height: 36,
							width: 36,
						}}
					/>
					<div
						className="animate-pulse rounded-full"
						style={{
							backgroundColor: 'var(--color-gray-200)',
							height: 24,
							width: 54,
						}}
					/>
				</div>
				<div className="mt-4 flex flex-col gap-2">
					<div
						className="animate-pulse rounded"
						style={{
							backgroundColor: 'var(--color-gray-200)',
							height: 18,
							width: '33%',
						}}
					/>
					<div
						className="animate-pulse rounded"
						style={{
							backgroundColor: 'var(--color-gray-200)',
							height: 14,
							width: '100%',
						}}
					/>
					<div
						className="animate-pulse rounded"
						style={{
							backgroundColor: 'var(--color-gray-200)',
							height: 14,
							width: '66%',
						}}
					/>
				</div>
			</div>
		)
	}

	const isGated = name === 'Jira' || name === 'Microsoft Teams'
	const enterpriseSetting =
		name === 'Jira' ? 'enable_jira_integration' : 'enable_teams_integration'
	const enterpriseName =
		name === 'Jira' ? 'Jira Integration' : 'Teams Integration'

	return (
		<>
			<div className={styles.cardContainer}>
				<div className={styles.header}>
					<img
						src={icon}
						alt={name}
						className={clsx(styles.logo, {
							['border-gray-200 p-0.5 shadow-sm rounded-none border']:
								noRoundedIcon,
						})}
					/>
					<div className={styles.actions}>
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
								<Switch
									trackingId={`IntegrationConnect-${name}`}
									label={
										!showConfiguration && integrationEnabled
											? 'Connected'
											: 'Connect'
									}
									loading={
										(showConfiguration &&
											integrationEnabled) ||
										(showDeleteConfirmation &&
											!integrationEnabled)
									}
									size="default"
									checked={integrationEnabled}
								/>
							</EnterpriseFeatureButton>
						) : (
							<Switch
								trackingId={`IntegrationConnect-${name}`}
								label={
									!showConfiguration && integrationEnabled
										? 'Connected'
										: 'Connect'
								}
								loading={
									(showConfiguration && integrationEnabled) ||
									(showDeleteConfirmation &&
										!integrationEnabled)
								}
								onChange={() => {
									const newValue = !integrationEnabled
									if (newValue) {
										setShowConfiguration(true)
									} else {
										setShowDeleteConfirmation(true)
									}
									setIntegrationEnabled(newValue)
								}}
								size="default"
								checked={integrationEnabled}
							/>
						)}
						{hasSettings && (
							<Button
								trackingId="IntegrationSettings"
								iconButton
								className={styles.settingsButton}
								onClick={() => setShowUpdateSettings(true)}
								disabled={!integrationEnabled}
							>
								<SettingsIcon />
							</Button>
						)}
					</div>
				</div>
				<div>
					<h2 className={styles.title}>{name}</h2>
					<p className={styles.description}>{description}</p>
					{docs && (
						<a
							className={styles.docsLink}
							href={docs}
							target="_blank"
							rel="noopener noreferrer"
						>
							Learn more about the integration
						</a>
					)}
				</div>
			</div>

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
