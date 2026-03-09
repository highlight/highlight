import {
	Box,
	Button,
	IconSolidExternalLink,
	Stack,
	Text,
	TextLink,
} from '@highlight-run/ui/components'
import { Integration } from '@pages/IntegrationsPage/Integrations'
import clsx from 'clsx'
import { useState } from 'react'

import BorderBox from '@/components/BorderBox/BorderBox'
import { IntegrationAction } from '@/pages/IntegrationsPage/components/Integration'
import { IntegrationModal } from '@/pages/IntegrationsPage/components/IntegrationModal/IntegrationModal'

import * as styles from '../IntegrationsPage.css'

interface Props {
	integration: Integration
}

const IntegrationDetail = ({ integration }: Props) => {
	const [showConfiguration, setShowConfiguration] = useState(false)
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
	const [integrationEnabled, setIntegrationEnabled] = useState(
		integration.defaultEnable ?? false,
	)

	const configurationPage = integration.configurationPage

	const handleConnect = () => {
		setShowConfiguration(true)
	}

	const handleDisconnect = () => {
		setShowDeleteConfirmation(true)
	}

	return (
		<>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				padding="12"
				borderBottom="divider"
			>
				<Text color="secondaryContentText" size="large">
					{integration.name}
				</Text>
				{integration.docs && (
					<TextLink href={integration.docs} target="_blank">
						<Stack direction="row" align="center" gap="4">
							<Text size="xSmall">Docs</Text>
							<IconSolidExternalLink size={12} />
						</Stack>
					</TextLink>
				)}
			</Box>

			<Stack my="40" mx="48" padding="12" gap="24">
				<Stack direction="row" gap="8" align="center">
					<img
						src={integration.icon}
						alt=""
						className={clsx(styles.integrationIconLarge, {
							['rounded-none']: integration.noRoundedIcon,
						})}
					/>
					<Text size="large" weight="bold">
						{integration.name}
					</Text>
				</Stack>

				<BorderBox>
					<Box
						display="flex"
						justifyContent="space-between"
						alignItems="center"
					>
						<Stack gap="4">
							<Text color="secondaryContentText" size="xSmall">
								Status
							</Text>
							<Text weight="bold">
								{integration.defaultEnable
									? 'Connected'
									: 'Not connected'}
							</Text>
						</Stack>
						<Box>
							{integration.defaultEnable ? (
								<Button
									trackingId={`integration-${integration.key}-disconnect`}
									kind="danger"
									emphasis="low"
									onClick={handleDisconnect}
								>
									Disconnect
								</Button>
							) : (
								<Button
									trackingId={`integration-${integration.key}-connect`}
									kind="primary"
									emphasis="high"
									onClick={handleConnect}
								>
									Connect
								</Button>
							)}
						</Box>
					</Box>
				</BorderBox>

				<Stack gap="8">
					<Text weight="bold">About</Text>
					<Text color="secondaryContentText">
						{integration.description}
					</Text>
				</Stack>

				{integration.defaultEnable && integration.hasSettings && (
					<Stack gap="8">
						<Text weight="bold">Configuration</Text>
						<BorderBox>
							{configurationPage({
								setModalOpen: setShowConfiguration,
								setIntegrationEnabled,
								action: IntegrationAction.Settings,
							})}
						</BorderBox>
					</Stack>
				)}
			</Stack>

			<IntegrationModal
				width={integration.modalWidth}
				visible={showConfiguration || showDeleteConfirmation}
				onCancel={() => {
					if (showConfiguration) {
						setShowConfiguration(false)
					} else if (showDeleteConfirmation) {
						setShowDeleteConfirmation(false)
						setIntegrationEnabled(true)
					}
				}}
				title={
					showDeleteConfirmation
						? 'Are you sure?'
						: `Configuring ${integration.name} Integration`
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
				}}
			/>
		</>
	)
}

export default IntegrationDetail
