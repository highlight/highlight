import Button from '@components/Button/Button/Button'
import { CircularSpinner } from '@components/Loading/Loading'
import Modal from '@components/Modal/Modal'
import React from 'react'

import { ContextType } from '../utils'
import * as styles from './style.css'

interface Props {
	context: ContextType
	hideModal: () => void
	loading: boolean
	onSubmit: () => void
	segmentToDelete: { name?: string; id?: string } | null
	showModal: boolean
}

export const DeleteSegmentModal: React.FC<Props> = ({
	context,
	hideModal,
	loading,
	onSubmit,
	segmentToDelete,
	showModal,
}) => {
	const handleSubmit = async () => {
		onSubmit()
	}

	return (
		<Modal
			title="Delete Segment"
			visible={showModal}
			onCancel={hideModal}
			style={{ display: 'flex' }}
			width={400}
		>
			<div>
				<p className={styles.modalSubTitle}>
					{`This action is irreversible. Do you want to delete ${
						segmentToDelete?.name
							? `'${segmentToDelete.name}'`
							: 'this segment'
					}?`}
				</p>
				<div className={styles.actionsContainer}>
					<Button
						trackingId={`CancelDelete${context}Segment`}
						onClick={hideModal}
						className={styles.actionButton}
					>
						Cancel
					</Button>
					<Button
						trackingId={`Delete${context}Segment`}
						type="primary"
						onClick={handleSubmit}
						className={styles.actionButton}
					>
						{loading ? (
							<CircularSpinner
								style={{
									fontSize: 18,
									color: 'var(--text-primary-inverted)',
								}}
							/>
						) : (
							'Delete Segment'
						)}
					</Button>
				</div>
			</div>
		</Modal>
	)
}
