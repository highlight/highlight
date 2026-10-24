import { Box, Stack, Text } from '@highlight-run/ui/components'
import { Integration as IntegrationType } from '@pages/IntegrationsPage/Integrations'
import React, { useState, useEffect } from 'react'
import * as styles from '../IntegrationsPage.css'
import { IntegrationAction } from './IntegrationTypes'
import clsx from 'clsx'

interface Props {
	integration: IntegrationType & { loading?: boolean; defaultEnable?: boolean }
}

export const IntegrationDetail: React.FC<Props> = ({ integration }) => {
	const [integrationEnabled, setIntegrationEnabled] = useState(
		integration.defaultEnable,
	)
	const [activeTab, setActiveTab] = useState<'description' | 'configure'>(
		'description',
	)

	useEffect(() => {
		setIntegrationEnabled(integration.defaultEnable)
		setActiveTab('description')
	}, [integration.defaultEnable, integration.key])

	if (integration.loading) {
		return (
			<Box cssClass={styles.detailPanel}>
				<div className={styles.detailTopBar}>
					<div
						className="animate-pulse rounded"
						style={{
							backgroundColor: 'var(--color-gray-200)',
							height: 16,
							width: 80,
						}}
					/>
				</div>
				<div className={styles.detailHeader}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
						<div
							className="animate-pulse rounded-lg"
							style={{
								backgroundColor: 'var(--color-gray-200)',
								height: 32,
								width: 32,
								borderRadius: 6,
							}}
						/>
						<div
							className="animate-pulse rounded"
							style={{
								backgroundColor: 'var(--color-gray-200)',
								height: 20,
								width: 120,
							}}
						/>
					</div>
				</div>
				<div className={styles.metadataRow}>
					<div
						className="animate-pulse rounded-lg"
						style={{
							backgroundColor: 'var(--color-gray-200)',
							height: 56,
							width: '100%',
							borderRadius: 8,
						}}
					/>
				</div>
			</Box>
		)
	}

	return (
		<Box cssClass={styles.detailPanel}>
			{/* Top bar with integration name and external link */}
			<div className={styles.detailTopBar}>
				<Text size="small" weight="medium">
					{integration.name}
				</Text>
				{integration.externalLink && (
					<a
						href={integration.externalLink}
						target="_blank"
						rel="noopener noreferrer"
						className={styles.externalLink}
					>
						Open {integration.name} ↗
					</a>
				)}
			</div>

			{/* Header with logo, name, and Disconnect button */}
			<div className={styles.detailHeader}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
					<img
						src={integration.icon}
						alt={integration.name}
						className={styles.logo}
					/>
					<Text size="large" weight="bold">
						{integration.name}
					</Text>
				</div>
			</div>

			{/* Metadata row */}
			<div className={styles.metadataRow}>
				<div className={styles.metadataBox}>
					<Stack direction="row" gap="32" align="center">
						{integration.docs && (
							<div>
								<div className={styles.metadataLabel}>Docs</div>
								<a
									href={integration.docs}
									target="_blank"
									rel="noopener noreferrer"
									className={styles.metadataValue}
									style={{ textDecoration: 'none' }}
								>
									📄 Docs
								</a>
							</div>
						)}
					</Stack>
					{integrationEnabled ? (
						<button
							onClick={() => setIntegrationEnabled(false)}
							style={{
								padding: '6px 16px',
								borderRadius: 6,
								border: '1px solid var(--color-gray-300)',
								backgroundColor: 'transparent',
								fontSize: 13,
								fontWeight: 500,
								cursor: 'pointer',
								color: 'inherit',
							}}
						>
							Disconnect
						</button>
					) : (
						<button
							onClick={() => setIntegrationEnabled(true)}
							style={{
								padding: '6px 16px',
								borderRadius: 6,
								border: 'none',
								backgroundColor: 'var(--color-purple-500)',
								color: 'white',
								fontSize: 13,
								fontWeight: 500,
								cursor: 'pointer',
							}}
						>
							Connect ›
						</button>
					)}
				</div>
			</div>

			{/* Tab bar */}
			<div className={styles.tabBar}>
				<button
					className={clsx(styles.tab, {
						[styles.tabActive]: activeTab === 'description',
					})}
					onClick={() => setActiveTab('description')}
				>
					Description
				</button>
				<button
					className={clsx(styles.tab, {
						[styles.tabActive]: activeTab === 'configure',
					})}
					onClick={() => setActiveTab('configure')}
				>
					Configure
				</button>
			</div>

			{/* Tab content */}
			<div className={styles.detailContent}>
				{activeTab === 'description' && (
					<Text size="small" color="secondaryContentText">
						{integration.description}
					</Text>
				)}
				{activeTab === 'configure' && (
					<Box
						display="flex"
						flexDirection="column"
						gap="16"
					>
						{integration.configurationPage({
							setModalOpen: () => {},
							setIntegrationEnabled: setIntegrationEnabled,
							action: integrationEnabled
								? IntegrationAction.Settings
								: IntegrationAction.Setup,
						})}
					</Box>
				)}
			</div>
		</Box>
	)
}
