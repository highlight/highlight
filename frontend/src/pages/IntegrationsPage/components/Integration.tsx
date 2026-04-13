import Button from '@components/Button/Button/Button'
import Card from '@components/Card/Card'
import LoadingBox from '@components/LoadingBox'
import Switch from '@components/Switch/Switch'
import SettingsIcon from '@icons/SettingsIcon'
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'

import { IntegrationModal } from '@/pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'
import {
	Badge,
	Box,
	Heading,
	IconSolidExternalLink,
	Stack,
	Tabs,
	Text,
} from '@highlight-run/ui/components'

import styles from './Integration.module.css'
import pageStyles from '../IntegrationsPage.module.css'
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
	isDetailView?: boolean
}

const Integration = ({
	integration,
	showModalDefault,
	showSettingsDefault,
	loading,
	isDetailView,
}: Props) => {
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
		externalLink,
	} = integration

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
			<Box p="32">
				<LoadingBox height={156} />
			</Box>
		)
	}

	const isGated = name === 'Jira' || name === 'Microsoft Teams'
	const enterpriseSetting =
		name === 'Jira' ? 'enable_jira_integration' : 'enable_teams_integration'
	const enterpriseName =
		name === 'Jira' ? 'Jira Integration' : 'Teams Integration'

	const renderAction = () => {
		const label = !showConfiguration && integrationEnabled ? 'Connected' : 'Connect'
		const isLoading = (showConfiguration && integrationEnabled) || (showDeleteConfirmation && !integrationEnabled)

		if (isGated) {
			return (
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
						label={label}
						loading={isLoading}
						size="default"
						checked={integrationEnabled}
					/>
				</EnterpriseFeatureButton>
			)
		}

		return (
			<Switch
				trackingId={`IntegrationConnect-${name}`}
				label={label}
				loading={isLoading}
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
		)
	}

	if (isDetailView) {
		const detailTabs =
			hasSettings && integrationEnabled
				? ['overview', 'settings']
				: ['overview']

		return (
			<>
				<div className={pageStyles.detailHeader}>
					<div className={pageStyles.detailTitleSection}>
						<img
							src={icon}
							alt=""
							className={clsx(pageStyles.detailLogo, {
								['rounded-none']: noRoundedIcon,
							})}
						/>
						<Stack gap="4">
							<Box display="flex" alignItems="center" gap="8">
								<Heading level="h2">{name}</Heading>
								{externalLink && (
									<a
										href={externalLink}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`Open ${name} website`}
									>
										<IconSolidExternalLink
											size={14}
											color="var(--color-n9)"
										/>
									</a>
								)}
							</Box>
							{integrationEnabled && (
								<Box display="flex" alignItems="center">
									<Badge
										label="Connected"
										variant="green"
										size="small"
									/>
								</Box>
							)}
						</Stack>
					</div>
					<Box display="flex" gap="12" alignItems="center">
						{renderAction()}
					</Box>
				</div>

				<Tabs<string>
					id="integration-detail-tabs"
					defaultSelectedId="overview"
				>
					<div className={pageStyles.tabsContainer}>
						<Tabs.List>
							<Tabs.Tab id="overview">Overview</Tabs.Tab>
							{detailTabs.includes('settings') && (
								<Tabs.Tab id="settings">Settings</Tabs.Tab>
							)}
						</Tabs.List>
					</div>

					<Tabs.Panel id="overview">
						<div className={pageStyles.detailContent}>
							<Stack gap="12">
								<Text size="large" color="secondary">
									{description}
								</Text>
								{docs && (
									<a
										className={styles.description}
										href={docs}
										target="_blank"
										rel="noopener noreferrer"
									>
										Learn more about the {name}{' '}
										integration.
									</a>
								)}
							</Stack>
						</div>
					</Tabs.Panel>

					{detailTabs.includes('settings') && (
						<Tabs.Panel id="settings">
							<div className={pageStyles.detailContent}>
								{configurationPage({
									setModalOpen: setShowUpdateSettings,
									setIntegrationEnabled,
									action: IntegrationAction.Settings,
								})}
							</div>
						</Tabs.Panel>
					)}
				</Tabs>

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
						{renderAction()}
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
