import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import analytics from '@util/analytics'
import { H } from 'highlight.run'
import { useState } from 'react'
import { useAsyncFn } from 'react-use'

import Button, { GenericHighlightButtonProps } from '../Button/Button/Button'

export type ConfirmHandlerActions = {
	close: () => void
}

interface Props {
	onCancelHandler?: () => void
	onConfirmHandler: (
		actions: ConfirmHandlerActions,
	) => void | Promise<unknown>
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

	const [confirmState, handleConfirmClick] = useAsyncFn(async () => {
		try {
			await onConfirmHandler({ close: () => setShowModal(false) })
		} catch (error) {
			H.consumeError(error as Error)
			throw error // allow the UI to display the error
		}
	})

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
						<p className="text-gray-500">{description}</p>
					)}
					{confirmState.error && (
						<p className="m-0 text-red-600">
							{confirmState.error.message ||
								'Something went wrong, try again.'}
						</p>
					)}
					<div className="mt-4 grid auto-cols-fr grid-flow-col gap-6">
						<Button
							trackingId="ConfirmModalCancelButton"
							onClick={() => {
								if (onCancelHandler) {
									onCancelHandler()
								}
								setShowModal(false)
							}}
							type="default"
							className="justify-center"
						>
							{cancelText}
						</Button>
						<Button
							trackingId="ConfirmModalConfirmButton"
							danger
							type="primary"
							loading={confirmState.loading}
							disabled={confirmState.loading}
							onClick={handleConfirmClick}
							className="justify-center"
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
					analytics.track(`ConfirmModal-Open-${trackingId}`)
				}}
			>
				{buttonText}
			</Button>
		</>
	)
}

export default ConfirmModal
