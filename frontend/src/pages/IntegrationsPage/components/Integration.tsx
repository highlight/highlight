import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import Modal from '@components/Modal/Modal'
import Switch from '@components/Switch/Switch'
import SettingsIcon from '@icons/SettingsIcon'
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

import styles from './Integration.module.scss'

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

	return (
		<>
			<Card className={styles.integration} interactable>
				<div className={styles.header}>
					<img
						src={icon}
						alt=""
						className={classNames(styles.logo, {
							['rounded-none']: noRoundedIcon,
						})}
					/>
					<div className="flex flex-col gap-2">
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

			<Modal
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
				destroyOnClose
				className={styles.modal}
				width={modalWidth}
			>
				{showConfiguration &&
					configurationPage({
						setModalOpen: setShowConfiguration,
						setIntegrationEnabled,
						action: IntegrationAction.Setup,
					})}
				{showDeleteConfirmation &&
					configurationPage({
						setModalOpen: setShowDeleteConfirmation,
						setIntegrationEnabled,
						action: IntegrationAction.Disconnect,
					})}
				{showUpdateSettings &&
					configurationPage({
						setModalOpen: setShowUpdateSettings,
						setIntegrationEnabled,
						action: IntegrationAction.Settings,
					})}
			</Modal>
		</>
	)
}

export default Integration
