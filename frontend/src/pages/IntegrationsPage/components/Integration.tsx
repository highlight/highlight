import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import LoadingBox from '@components/LoadingBox'
import Switch from '@components/Switch/Switch'
import SettingsIcon from '@icons/SettingsIcon'
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import {
	CATEGORY_LABELS,
	getIntegrationCategory,
	getIntegrationStatus,
} from '@pages/IntegrationsPage/integrationsUtils'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import EnterpriseFeatureButton from '@/components/Billing/EnterpriseFeatureButton'
import { IntegrationModal } from '@/pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'

import styles from './Integration.module.css'

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
		key,
		icon,
		noRoundedIcon,
		name,
		description,
		configurationPage,
		defaultEnable,
		hasSettings,
		modalWidth,
		docs,
		category,
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
			<Card>
				<LoadingBox height={180} />
			</Card>
		)
	}

	const resolvedCategory = getIntegrationCategory(key, category)
	const categoryLabel = CATEGORY_LABELS[resolvedCategory]
	const statusLabel = getIntegrationStatus(integrationEnabled)
	const isConnected = statusLabel === 'Connected'

	const isGated = name === 'Jira' || name === 'Microsoft Teams'
	const enterpriseSetting =
		name === 'Jira' ? 'enable_jira_integration' : 'enable_teams_integration'
	const enterpriseName =
		name === 'Jira' ? 'Jira Integration' : 'Teams Integration'

	const toggleIntegration = () => {
		const newValue = !integrationEnabled
		if (newValue) {
			setShowConfiguration(true)
		} else {
			setShowDeleteConfirmation(true)
		}
		setIntegrationEnabled(newValue)
	}

	const switchControl = (
		<Switch
			trackingId={`IntegrationConnect-${name}`}
			label={
				!showConfiguration && integrationEnabled
					? 'Connected'
					: 'Connect'
			}
			loading={
				(showConfiguration && integrationEnabled) ||
				(showDeleteConfirmation && !integrationEnabled)
			}
			onChange={isGated ? undefined : toggleIntegration}
			size="default"
			checked={integrationEnabled}
		/>
	)

	return (
		<>
			<Card
				className={clsx(styles.integration, {
					[styles.connectedCard]: isConnected,
				})}
				interactable
			>
				<div>
					<div className={styles.header}>
						<div className={styles.identity}>
							<img
								src={icon}
								alt=""
								className={clsx(styles.logo, {
									['rounded-none']: noRoundedIcon,
								})}
							/>
							<div className={styles.metaColumn}>
								<h2 className={styles.title}>{name}</h2>
								<span className={styles.categoryTag}>
									{categoryLabel}
								</span>
							</div>
						</div>
						<span
							className={clsx(
								styles.statusBadge,
								isConnected
									? styles.statusConnected
									: styles.statusAvailable,
							)}
						>
							<span
								className={clsx(
									styles.statusDot,
									isConnected
										? styles.statusDotConnected
										: styles.statusDotAvailable,
								)}
							/>
							{statusLabel}
						</span>
					</div>

					<p className={styles.description}>{description}</p>
					{docs && (
						<a
							className={styles.docsLink}
							href={docs}
							target="_blank"
							rel="noopener noreferrer"
						>
							Learn more about the integration.
						</a>
					)}
				</div>

				<div className={styles.footer}>
					{isGated ? (
						<EnterpriseFeatureButton
							setting={enterpriseSetting}
							name={enterpriseName}
							fn={async () => {
								toggleIntegration()
							}}
							variant="basic"
						>
							{switchControl}
						</EnterpriseFeatureButton>
					) : (
						switchControl
					)}

					{hasSettings && (
						<Button
							trackingId="IntegrationSettings"
							iconButton
							onClick={() => {
								setShowUpdateSettings(true)
							}}
							disabled={!integrationEnabled}
							aria-label={`Configure ${name} settings`}
						>
							<SettingsIcon />
						</Button>
					)}
				</div>
			</Card>

			<IntegrationModal
				width={modalWidth}
				integrationIcon={icon}
				integrationName={name}
				statusLabel={statusLabel}
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
						? `Disconnect ${name}?`
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
