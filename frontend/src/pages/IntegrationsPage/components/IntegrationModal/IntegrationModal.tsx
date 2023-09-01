import Modal from '@components/Modal/Modal'
import React from 'react'

import styles from './IntegrationModal.module.css'

interface Props {
	title: string
	visible: boolean
	width?: number
	onCancel: () => void
	configurationPage: () => React.ReactNode
}

export const IntegrationModal = ({
	title,
	width,
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
			{configurationPage()}
		</Modal>
	)
}
