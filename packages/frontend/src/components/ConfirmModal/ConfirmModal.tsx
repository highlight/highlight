import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import { H } from 'highlight.run'
import React, { useState } from 'react'

import Button, { GenericHighlightButtonProps } from '../Button/Button/Button'
import styles from './ConfirmModal.module.scss'

interface Props {
	onCancelHandler?: () => void
	onConfirmHandler: () => void
	trackingId: string
	buttonProps: GenericHighlightButtonProps
	cancelText?: string
	confirmText?: string
	modalTitleText?: string
	description?: string
	buttonText: string
}

const ConfirmModal = ({
	onCancelHandler,
	onConfirmHandler,
	buttonProps,
	trackingId,
	cancelText = 'Cancel',
	confirmText = 'Confirm',
	modalTitleText = 'Are you sure you want to delete?',
	description,
	buttonText,
}: Props) => {
	const [showModal, setShowModal] = useState(false)

	return (
		<>
			<Modal
				onCancel={() => {
					if (onCancelHandler) {
						onCancelHandler()
					}
					setShowModal(false)
				}}
				visible={showModal}
				title={modalTitleText}
				width="400px"
			>
				<ModalBody>
					{description && (
						<p className={styles.description}>{description}</p>
					)}
					<div className={styles.actionsContainer}>
						<Button
							trackingId="ConfirmModalCancelButton"
							onClick={() => {
								if (onCancelHandler) {
									onCancelHandler()
								}
								setShowModal(false)
							}}
							type="default"
							className={styles.button}
						>
							{cancelText}
						</Button>
						<Button
							trackingId="ConfirmModalConfirmButton"
							onClick={onConfirmHandler}
							danger
							type="primary"
							className={styles.button}
						>
							{confirmText}
						</Button>
					</div>
				</ModalBody>
			</Modal>
			<Button
				{...buttonProps}
				onClick={(e) => {
					if (buttonProps.onClick) {
						buttonProps.onClick(e)
					}
					setShowModal(true)
					H.track(`ConfirmModal-Open-${trackingId}`)
				}}
			>
				{buttonText}
			</Button>
		</>
	)
}

export default ConfirmModal
