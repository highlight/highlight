import {
	Box,
	Button,
	IconSolidArrowSmRight,
	IconSolidDocument,
	IconSolidExternalLink,
	IconSolidGlobe,
	Stack,
	Tabs,
	Text,
} from '@highlight-run/ui/components'
import { IntegrationAction } from '@pages/IntegrationsPage/components/Integration'
import {
	Integration,
	resolveIntegrationExternalDomain,
} from '@pages/IntegrationsPage/Integrations'
import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import EnterpriseFeatureButton from '@/components/Billing/EnterpriseFeatureButton'
import BorderBox from '@/components/BorderBox/BorderBox'
import { LinkButton } from '@/components/LinkButton'
import { IntegrationModal } from '@/pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'

import ProjectSelection, {
	ProjectSelectionState,
} from './common/ProjectSelection'

export enum IntegrationSettingsTab {
	Description = 'description',
	Configure = 'configure',
}

export interface IntegrationDetailPanelProps {
	integration: Integration
	projectSelection: ProjectSelectionState
	showModalDefault?: boolean
	showSettingsDefault?: boolean
}

const resolveDocsUrl = (integration: Integration): string => {
	return (
		integration.docs ||
		`https://www.highlight.io/docs/general/integrations/${integration.key}-integration`
	)
}

const resolveWebsiteUrl = (integration: Integration): string => {
	return integration.externalLink || `https://${integration.key}.com`
}

const resolveConfigureAction = (
	integration: Integration,
): IntegrationAction => {
	if (integration.defaultEnable && integration.hasSettings) {
		return IntegrationAction.Settings
	}
	return IntegrationAction.Setup
}

interface ActionControlsState {
	setShowConfiguration: (open: boolean) => void
	setShowDeleteConfirmation: (open: boolean) => void
	setIntegrationEnabled: (enabled: boolean) => void
}

/**
 * Renders the Connect or Disconnect trigger button, applying enterprise plan gating
 * for Jira and Microsoft Teams integrations.
 */
const IntegrationConnectAction: React.FC<{
	integration: Integration
	controls: ActionControlsState
}> = ({ integration, controls }) => {
	if (integration.defaultEnable) {
		return (
			<Button
				trackingId={`IntegrationDisconnect-${integration.name}`}
				kind="secondary"
				emphasis="high"
				onClick={() => {
					controls.setShowConfiguration(false)
					controls.setShowDeleteConfirmation(true)
				}}
			>
				Disconnect
			</Button>
		)
	}

	const isEnterpriseGated =
		integration.name === 'Jira' || integration.name === 'Microsoft Teams'
	const connectButton = (
		<Button
			trackingId={`IntegrationConnect-${integration.name}`}
			iconRight={<IconSolidArrowSmRight />}
			onClick={(e: React.MouseEvent) => {
				if (!isEnterpriseGated) {
					e.preventDefault()
					controls.setShowConfiguration(true)
					controls.setIntegrationEnabled(true)
				}
			}}
		>
			Connect
		</Button>
	)

	if (!isEnterpriseGated) {
		return connectButton
	}

	const enterpriseSetting =
		integration.name === 'Jira'
			? 'enable_jira_integration'
			: 'enable_teams_integration'
	const enterpriseName =
		integration.name === 'Jira' ? 'Jira Integration' : 'Teams Integration'

	return (
		<EnterpriseFeatureButton
			setting={enterpriseSetting}
			name={enterpriseName}
			fn={async () => {
				controls.setShowConfiguration(true)
				controls.setIntegrationEnabled(true)
			}}
			variant="basic"
		>
			{connectButton}
		</EnterpriseFeatureButton>
	)
}

/**
 * Renders the metadata summary card with connection status, documentation link,
 * vendor website link, and primary connection action.
 */
const IntegrationSummaryBox: React.FC<{
	integration: Integration
	controls: ActionControlsState
}> = ({ integration, controls }) => {
	const docsUrl = resolveDocsUrl(integration)
	const websiteUrl = resolveWebsiteUrl(integration)
	const websiteDomain = resolveIntegrationExternalDomain(integration)

	return (
		<BorderBox>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
			>
				<Stack direction="row" gap="24" align="center">
					<Stack gap="8">
						<Text color="secondaryContentText" size="xSmall">
							Status
						</Text>
						<Text
							color="secondaryContentText"
							size="medium"
							weight="bold"
						>
							{integration.defaultEnable
								? 'Connected'
								: 'Not Connected'}
						</Text>
					</Stack>
					<Stack gap="4">
						<Text color="secondaryContentText" size="xSmall">
							Docs
						</Text>
						<LinkButton
							trackingId="integration_type-docs-link"
							to={docsUrl}
							target="_blank"
							size="xSmall"
							kind="secondary"
							emphasis="low"
							iconLeft={<IconSolidDocument />}
						>
							Docs
						</LinkButton>
					</Stack>
					<Stack gap="4">
						<Text color="secondaryContentText" size="xSmall">
							Website
						</Text>
						<LinkButton
							trackingId="integration_type-website-link"
							to={websiteUrl}
							target="_blank"
							size="xSmall"
							kind="secondary"
							emphasis="low"
							iconLeft={<IconSolidGlobe />}
						>
							{websiteDomain}
						</LinkButton>
					</Stack>
				</Stack>
				<Box>
					<IntegrationConnectAction
						integration={integration}
						controls={controls}
					/>
				</Box>
			</Box>
		</BorderBox>
	)
}

/**
 * Renders the Description and Configure tab panels for the active integration.
 */
const IntegrationTabsSection: React.FC<{
	integration: Integration
	projectSelection: ProjectSelectionState
	controls: ActionControlsState
}> = ({ integration, projectSelection, controls }) => {
	const [searchParams] = useSearchParams()
	const location = useLocation()
	const navigate = useNavigate()
	const activeTab =
		(searchParams.get('tab') as IntegrationSettingsTab) ||
		IntegrationSettingsTab.Description
	const overviewNotes = integration.overviewNotes || [integration.description]

	return (
		<Box mt="24">
			<Tabs<IntegrationSettingsTab>
				selectedId={activeTab}
				onChange={(nextTab) => {
					navigate(`${location.pathname}?tab=${nextTab}`)
				}}
			>
				<Tabs.List>
					<Tabs.Tab id={IntegrationSettingsTab.Description}>
						Description
					</Tabs.Tab>
					<Tabs.Tab id={IntegrationSettingsTab.Configure}>
						Configure
					</Tabs.Tab>
				</Tabs.List>
				<Box mt="24">
					<Tabs.Panel id={IntegrationSettingsTab.Description}>
						<Stack gap="16">
							<Box
								borderRadius="8"
								border="divider"
								p="24"
								style={{ minHeight: 200 }}
								background="secondarySelected"
							>
								<Stack gap="12">
									<Text weight="bold" size="medium">
										{integration.name} + Highlight
									</Text>
									<Text color="secondaryContentText">
										{integration.description}
									</Text>
								</Stack>
							</Box>
							{overviewNotes.map((paragraph, idx) => (
								<Text
									key={idx}
									color="secondaryContentText"
									size="small"
								>
									{paragraph}
								</Text>
							))}
						</Stack>
					</Tabs.Panel>
					<Tabs.Panel id={IntegrationSettingsTab.Configure}>
						<Stack gap="16">
							{integration.isProjectLevel !== false && (
								<ProjectSelection state={projectSelection} />
							)}
							<Box>
								{integration.configurationPage({
									setModalOpen:
										controls.setShowDeleteConfirmation,
									setIntegrationEnabled:
										controls.setIntegrationEnabled,
									action: resolveConfigureAction(integration),
								})}
							</Box>
						</Stack>
					</Tabs.Panel>
				</Box>
			</Tabs>
		</Box>
	)
}

interface ModalStateConfig {
	integration: Integration
	showConfiguration: boolean
	showDeleteConfirmation: boolean
	showUpdateSettings: boolean
	setShowConfiguration: (val: boolean) => void
	setShowDeleteConfirmation: (val: boolean) => void
	setShowUpdateSettings: (val: boolean) => void
	setIntegrationEnabled: (val: boolean) => void
}

const renderModalPage = (state: ModalStateConfig): React.ReactNode => {
	const { configurationPage } = state.integration
	if (state.showConfiguration) {
		return configurationPage({
			setModalOpen: state.setShowConfiguration,
			setIntegrationEnabled: state.setIntegrationEnabled,
			action: IntegrationAction.Setup,
		})
	}
	if (state.showDeleteConfirmation) {
		return configurationPage({
			setModalOpen: state.setShowDeleteConfirmation,
			setIntegrationEnabled: state.setIntegrationEnabled,
			action: IntegrationAction.Disconnect,
		})
	}
	if (state.showUpdateSettings) {
		return configurationPage({
			setModalOpen: state.setShowUpdateSettings,
			setIntegrationEnabled: state.setIntegrationEnabled,
			action: IntegrationAction.Settings,
		})
	}
	return null
}

const dismissModalState = (state: ModalStateConfig) => {
	if (state.showConfiguration) {
		state.setShowConfiguration(false)
		state.setIntegrationEnabled(false)
		return
	}
	if (state.showDeleteConfirmation) {
		state.setShowDeleteConfirmation(false)
		state.setIntegrationEnabled(true)
		return
	}
	state.setShowUpdateSettings(false)
}

/**
 * Displays the header, status box, description/configuration tabs, and modal
 * for the currently selected workspace integration.
 */
export const IntegrationDetailPanel: React.FC<IntegrationDetailPanelProps> = ({
	integration,
	projectSelection,
	showModalDefault,
	showSettingsDefault,
}) => {
	const [showConfiguration, setShowConfiguration] = useState(
		Boolean(showModalDefault && !integration.defaultEnable),
	)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [showUpdateSettings, setShowUpdateSettings] = useState(
		Boolean(showSettingsDefault),
	)
	const [, setIntegrationEnabled] = useState(
		Boolean(integration.defaultEnable),
	)

	useEffect(() => {
		setIntegrationEnabled(Boolean(integration.defaultEnable))
	}, [integration.defaultEnable])

	const docsUrl = resolveDocsUrl(integration)
	const controls: ActionControlsState = {
		setShowConfiguration,
		setShowDeleteConfirmation,
		setIntegrationEnabled,
	}
	const modalConfig: ModalStateConfig = {
		integration,
		showConfiguration,
		showDeleteConfirmation,
		showUpdateSettings,
		setShowConfiguration,
		setShowDeleteConfirmation,
		setShowUpdateSettings,
		setIntegrationEnabled,
	}

	return (
		<>
			<Helmet>
				<title>{integration.name} Integration</title>
			</Helmet>
			<Box
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
				padding="12"
				borderBottom="divider"
			>
				<Text color="secondaryContentText" size="large">
					{integration.name}
				</Text>
				<LinkButton
					trackingId="integration_type-header-docs-link"
					to={docsUrl}
					target="_blank"
					size="xSmall"
					kind="secondary"
					emphasis="high"
					iconRight={<IconSolidExternalLink />}
				>
					Open {integration.name}
				</LinkButton>
			</Box>
			<Stack my="40" mx="48" padding="12" gap="16">
				<Stack direction="row" gap="8" align="center">
					<img
						src={integration.icon}
						alt={integration.name}
						style={{
							borderRadius: integration.noRoundedIcon
								? '0%'
								: '50%',
							height: '24px',
							width: '24px',
						}}
					/>
					<Text size="large" weight="bold">
						{integration.name}
					</Text>
				</Stack>
				<IntegrationSummaryBox
					integration={integration}
					controls={controls}
				/>
				<IntegrationTabsSection
					integration={integration}
					projectSelection={projectSelection}
					controls={controls}
				/>
				<IntegrationModal
					width={integration.modalWidth}
					visible={
						showConfiguration ||
						showDeleteConfirmation ||
						showUpdateSettings
					}
					onCancel={() => dismissModalState(modalConfig)}
					title={
						showDeleteConfirmation
							? 'Are you sure?'
							: `Configuring ${integration.name} Integration`
					}
					configurationPage={() => renderModalPage(modalConfig)}
				/>
			</Stack>
		</>
	)
}

export default IntegrationDetailPanel
