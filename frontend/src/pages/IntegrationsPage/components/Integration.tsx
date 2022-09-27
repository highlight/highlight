import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import Modal from '@components/Modal/Modal'
import Switch from '@components/Switch/Switch'
import SettingsIcon from '@icons/SettingsIcon'
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import React, { useEffect, useState } from 'react'

import styles from './Integration.module.scss'

export enum IntegrationAction {
	Setup,
	Disconnect,
	Settings,
}

export interface IntegrationConfigProps {
	setModelOpen: (newVal: boolean) => void
	setIntegrationEnabled: (newVal: boolean) => void
	action: IntegrationAction
}

interface Props {
	integration: IntegrationType
	showModalDefault?: boolean
}

const Integration = ({
	integration: {
		icon,
		name,
		description,
		configurationPage,
		defaultEnable,
		hasSettings,
	},
	showModalDefault,
}: Props) => {
	const [showConfiguration, setShowConfiguration] = useState(
		showModalDefault && !defaultEnable,
	)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [showUpdateSettings, setShowUpdateSettings] = useState(false)
	const [integrationEnabled, setIntegrationEnabled] = useState(defaultEnable)

	useEffect(() => {
		setIntegrationEnabled(defaultEnable)
	}, [defaultEnable, setIntegrationEnabled])

	return (
		<>
			<Card className={styles.integration} interactable>
				<div className={styles.header}>
					<img src={icon} alt="" className={styles.logo} />
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
						size="default"
						checked={integrationEnabled}
						onChange={(newValue) => {
							if (newValue) {
								setShowConfiguration(true)
							} else {
								setShowDeleteConfirmation(true)
							}
							setIntegrationEnabled(newValue)
						}}
					/>
					{hasSettings && integrationEnabled && (
						<Button
							trackingId="IntegrationSettings"
							iconButton
							onClick={() => {
								setShowUpdateSettings(true)
							}}
						>
							<SettingsIcon />
						</Button>
					)}
				</div>
				<div>
					<h2 className={styles.title}>{name}</h2>
					<p className={styles.description}>{description}</p>
				</div>
			</Card>

			<Modal
				visible={showConfiguration || showDeleteConfirmation}
				onCancel={() => {
					if (showConfiguration) {
						setShowConfiguration(false)
						setIntegrationEnabled(false)
					} else {
						setShowDeleteConfirmation(false)
						setIntegrationEnabled(true)
					}
				}}
				title={
					showConfiguration
						? `Configuring ${name} Integration`
						: 'Are you sure?'
				}
				destroyOnClose
				className={styles.modal}
			>
				{showConfiguration &&
					configurationPage({
						setModelOpen: setShowConfiguration,
						setIntegrationEnabled,
						action: IntegrationAction.Setup,
					})}
				{showDeleteConfirmation &&
					configurationPage({
						setModelOpen: setShowDeleteConfirmation,
						setIntegrationEnabled,
						action: IntegrationAction.Disconnect,
					})}
				{showUpdateSettings &&
					configurationPage({
						setModelOpen: setShowUpdateSettings,
						setIntegrationEnabled,
						action: IntegrationAction.Settings,
					})}
			</Modal>
		</>
	)
}

export default Integration
