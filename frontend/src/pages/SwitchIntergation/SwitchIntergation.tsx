import { useParams } from '@util/react-router/useParams'
import { Helmet } from 'react-helmet'
import { Integration } from '../IntegrationsPage/Integrations'

import BorderBox from '@/components/BorderBox/BorderBox'
import { LinkButton } from '@/components/LinkButton'
import {
	Box,
	IconSolidExternalLink,
	Stack,
	IconSolidDocument,
	IconSolidGlobe,
	IconSolidArrowSmRight,
	Text,
	Button,
	Tabs,
} from '@highlight-run/ui/components'
import { IntegrationAction } from '../IntegrationsPage/components/Integration'
import { IntegrationModal } from '../IntegrationsPage/components/IntegrationModal/IntegrationModal'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

enum IntegrationSettingsTabs {
	Description = 'description',
	Configure = 'configure',
}

const SwitchIntergations = ({ integration }: { integration: Integration }) => {
	const { intergate_type } = useParams<{
		workspace_id: string
		intergate_type: string
	}>()

	const [showConfiguration, setShowConfiguration] = useState(false)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [showUpdateSettings, setShowUpdateSettings] = useState(false)
	const [params] = useSearchParams()
	const navigate = useNavigate()

	const [_, setIntegrationEnabled] = useState(true)
	const configurationPage = integration?.configurationPage

	return (
		<>
			<Helmet>
				<title>Integration {intergate_type || ''}</title>
			</Helmet>
			{integration && (
				<>
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
							trackingId="intergation_type-docs-link"
							to={`https://www.highlight.io/docs/general/integrations/${integration.key}-integration`}
							target="_blank"
							size="xSmall"
							kind="secondary"
							emphasis="high"
							iconRight={<IconSolidExternalLink />}
						>
							Open {integration.name}
						</LinkButton>
					</Box>
					<Stack my="40" mx="48" padding="12">
						<Stack direction="row" gap="2" align="center">
							<img
								src={integration.icon}
								alt=""
								style={{
									borderRadius: '50%',
									height: '24px',
									width: '24px',
								}}
							/>
							<Text size="large" weight="bold">
								{integration.name}
							</Text>
						</Stack>
						<Stack gap="16">
							{[integration].map((integration, index) => {
								return (
									<BorderBox key={index}>
										<Box cssClass="grid grid-cols-[2fr_3.5fr]">
											<Stack
												direction="row"
												justify="space-between"
											>
												<Stack gap="8">
													<Text
														color="secondaryContentText"
														size="xSmall"
													>
														Integrated By
													</Text>
													<Text
														color="secondaryContentText"
														size="medium"
														weight="bold"
													>
														Jay
													</Text>
												</Stack>
												<Stack gap="1">
													<Text
														cssClass="ml-2"
														color="secondaryContentText"
														size="xSmall"
													>
														Docs
													</Text>
													<LinkButton
														trackingId="intergation_type-docs-link"
														to={`https://www.highlight.io/docs/general/integrations/${integration.key}-integration`}
														target="_blank"
														size="xSmall"
														kind="secondary"
														emphasis="low"
														iconLeft={
															<IconSolidDocument />
														}
													>
														Docs
													</LinkButton>
												</Stack>
												<Stack gap="1">
													<Text
														color="secondaryContentText"
														size="xSmall"
														cssClass="ml-2"
													>
														Website
													</Text>
													<LinkButton
														trackingId="intergation_type-docs-link"
														//for now redirect to docs. TO DO update it to integration url
														to={`https://www.highlight.io/docs/general/integrations/${integration.key}-integration`}
														target="_blank"
														size="xSmall"
														kind="secondary"
														emphasis="low"
														iconLeft={
															<IconSolidGlobe />
														}
													>
														{integration.key}
														.com
													</LinkButton>
												</Stack>
											</Stack>
											<Box cssClass="justify-self-end">
												{integration.defaultEnable ? (
													<Button
														onClick={() => {
															setShowConfiguration(
																false,
															)
															setShowDeleteConfirmation(
																true,
															)
														}}
													>
														Disconnect
													</Button>
												) : (
													<Button
														iconRight={
															<IconSolidArrowSmRight />
														}
														onClick={(e) => {
															e.preventDefault()
															setShowConfiguration(
																true,
															)
														}}
													>
														Connect
													</Button>
												)}
											</Box>
										</Box>
									</BorderBox>
								)
							})}
							<Box mt="24">
								<Tabs<IntegrationSettingsTabs>
									selectedId={
										(params?.get('tab') ||
											IntegrationSettingsTabs.Description) as IntegrationSettingsTabs
									}
									onChange={(id) => {
										navigate(
											`${location.pathname}?tab=${id}`,
										)
									}}
								>
									<Tabs.List>
										<Tabs.Tab
											id={
												IntegrationSettingsTabs.Description
											}
										>
											Description
										</Tabs.Tab>
										<Tabs.Tab
											id={
												IntegrationSettingsTabs.Configure
											}
										>
											Configure
										</Tabs.Tab>
									</Tabs.List>
									<Box mt="24">
										<Tabs.Panel
											id={
												IntegrationSettingsTabs.Description
											}
										>
											<Stack>
												{/* TO DO  Need update this with real description*/}
												<Box
													borderRadius="8"
													border="divider"
													style={{ minHeight: 300 }}
													background="secondarySelected"
												></Box>
												<Text color="secondaryContentText">
													Bring your highlight.io
													comments and alerts to{' '}
													{integration.name} as
													messages.
												</Text>
											</Stack>
										</Tabs.Panel>
										<Tabs.Panel
											id={
												IntegrationSettingsTabs.Configure
											}
										>
											{configurationPage({
												setModalOpen:
													setShowDeleteConfirmation,
												setIntegrationEnabled,
												action: IntegrationAction.Settings,
												isV2: true,
											})}
										</Tabs.Panel>
									</Box>
								</Tabs>
							</Box>
						</Stack>
						<IntegrationModal
							width={integration?.modalWidth}
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
					</Stack>
				</>
			)}
		</>
	)
}

export default SwitchIntergations
