import Modal from '@components/Modal/Modal'
import { IntegrationStatus } from '@pages/IntegrationsPage/integrationsUtils'
import clsx from 'clsx'
import React from 'react'

import styles from './IntegrationModal.module.css'

interface Props {
	title: string
	visible: boolean
	width?: number
	integrationName?: string
	integrationIcon?: string
	statusLabel?: IntegrationStatus
	onCancel: () => void
	configurationPage: () => React.ReactNode
}

export const IntegrationModal = ({
	title,
	width,
	integrationName,
	integrationIcon,
	statusLabel,
	configurationPage,
	onCancel,
	visible,
}: Props) => {
	return (
		<Modal
			title={title}
			visible={visible}
			className={styles.modal}
			width={width}
			onCancel={onCancel}
			destroyOnClose
		>
			{(integrationName || integrationIcon || statusLabel) && (
				<div className={styles.modalHeader}>
					<div className={styles.modalIdentity}>
						{integrationIcon && (
							<img
								src={integrationIcon}
								alt=""
								className={styles.modalIcon}
							/>
						)}
						{integrationName && (
							<span className={styles.modalIntegrationName}>
								{integrationName}
							</span>
						)}
					</div>
					{statusLabel && (
						<span
							className={clsx(styles.modalStatus, {
								[styles.modalStatusConnected]:
									statusLabel === 'Connected',
							})}
						>
							{statusLabel}
						</span>
					)}
				</div>
			)}
			<div className={styles.modalBody}>{configurationPage()}</div>
		</Modal>
	)
}
