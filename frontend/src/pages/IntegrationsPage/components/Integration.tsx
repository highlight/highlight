import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import LoadingBox from '@components/LoadingBox'
import Switch from '@components/Switch/Switch'
import SettingsIcon from '@icons/SettingsIcon'
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import clsx from 'clsx'
import { useEffect, useState } from 'react'

import { IntegrationModal } from '@/pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'
import EnterpriseFeatureButton from '@/components/Billing/EnterpriseFeatureButton'

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
			<Card>
				<LoadingBox height={156} />
			</Card>
		)
	}

	const isGated = name === 'Jira' || name === 'Microsoft Teams'
	const enterpriseSetting =
		name === 'Jira' ? 'enable_jira_integration' : 'enable_teams_integration'
	const enterpriseName =
		name === 'Jira' ? 'Jira Integration' : 'Teams Integration'

	const switchLabel =
		!showConfiguration && integrationEnabled ? 'Connected' : 'Connect'
	const switchLoading =
		(showConfiguration && integrationEnabled) ||
		(showDeleteConfirmation && !integrationEnabled)

	const handleToggle = () => {
		const newValue = !integrationEnabled
		if (newValue) {
			setShowConfiguration(true)
		} else {
			setShowDeleteConfirmation(true)
		}
		setIntegrationEnabled(newValue)
	}

	return (
		<>
			<Card className={styles.integration} interactable>
				<div className={styles.cardInner}>
					{/* Header: logo + controls */}
					<div className={styles.header}>
						<div className={styles.logoWrapper}>
							<img
								src={icon}
								alt={`${name} logo`}
								className={clsx(styles.logo, {
									[styles.logoRounded]: !noRoundedIcon,
								})}
							/>
							{integrationEnabled && (
								<span className={styles.connectedBadge} />
							)}
						</div>

						<div className={styles.controls}>
							{hasSettings && (
								<Button
									trackingId="IntegrationSettings"
									iconButton
									onClick={() => setShowUpdateSettings(true)}
									disabled={!integrationEnabled}
								>
									<SettingsIcon />
								</Button>
							)}

							{isGated ? (
								<EnterpriseFeatureButton
									setting={enterpriseSetting}
									name={enterpriseName}
									fn={async () => handleToggle()}
									variant="basic"
								>
									<Switch
										trackingId={`IntegrationConnect-${name}`}
										label={switchLabel}
										loading={switchLoading}
										size="default"
										checked={integrationEnabled}
									/>
								</EnterpriseFeatureButton>
							) : (
								<Switch
									trackingId={`IntegrationConnect-${name}`}
									label={switchLabel}
									loading={switchLoading}
									onChange={handleToggle}
									size="default"
									checked={integrationEnabled}
								/>
							)}
						</div>
					</div>

					{/* Body: name + description */}
					<div className={styles.body}>
						<h3 className={styles.title}>{name}</h3>
						<p className={styles.description}>{description}</p>
					</div>

					{/* Footer: docs link */}
					{docs && (
						<div className={styles.footer}>
							<a
								className={styles.docsLink}
								href={docs}
								target="_blank"
								rel="noopener noreferrer"
							>
								View docs →
							</a>
						</div>
					)}
				</div>
			</Card>

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
