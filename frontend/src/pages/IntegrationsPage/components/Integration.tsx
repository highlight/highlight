import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import LoadingBox from '@components/LoadingBox'
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

	return (
		<>
			<Card className={styles.integration} interactable>
				<div className={styles.header}>
					<img
						src={icon}
						alt=""
						className={clsx(styles.logo, {
							['rounded-none']: noRoundedIcon,
						})}
					/>
					<div className="flex flex-col gap-2">
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
							<div className="flex h-[18px] w-full justify-end">
								<Button
									trackingId="IntegrationSettings"
									iconButton
									onClick={() => {
										setShowUpdateSettings(true)
									}}
									disabled={!integrationEnabled}
								>
									<SettingsIcon />
								</Button>
							</div>
						)}
					</div>
				</div>
				<div>
					<h2 className={styles.title}>{name}</h2>
					<p className={styles.description}>{description}</p>
					{docs && (
						<a
							className={styles.description}
							href={docs}
							target="_blank"
							rel="noopener noreferrer"
						>
							Learn more about the integration.
						</a>
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
