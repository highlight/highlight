import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '../../../../../components/Button/Button/Button'
import { CircularSpinner } from '../../../../../components/Loading/Loading'
import Modal from '../../../../../components/Modal/Modal'
import { useDeleteErrorSegmentMutation } from '../../../../../graph/generated/hooks'
import styles from '../SegmentPicker.module.scss'

const NO_SEGMENT = 'none'

interface Props {
	showModal: boolean
	hideModalHandler: () => void
	segmentToDelete: { name?: string; id?: string } | null
	/** Called after a segment is deleted. */
	afterDeleteHandler?: () => void
}

const DeleteErrorSegmentModal: React.FC<React.PropsWithChildren<Props>> = ({
	hideModalHandler,
	showModal,
	segmentToDelete,
	afterDeleteHandler,
}) => {
	const { segment_id, project_id } = useParams<{
		segment_id: string
		project_id: string
	}>()
	const navigate = useNavigate()
	const [deleteSegment, { loading }] = useDeleteErrorSegmentMutation({
		update(cache) {
			cache.modify({
				fields: {
					segments(existingSegments, { readField }) {
						return existingSegments.filter(
							(existingSegment: any) =>
								readField('id', existingSegment) !==
								segmentToDelete?.id,
						)
					},
				},
			})
		},
		refetchQueries: [namedOperations.Query.GetErrorSegments],
	})

	return (
		<Modal
			title="Delete Segment"
			visible={showModal}
			onCancel={hideModalHandler}
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
						trackingId="CancelDeleteErrorSegment"
						onClick={hideModalHandler}
					>
						Cancel
					</Button>
					<Button
						trackingId="DeleteErrorSegment"
						type="primary"
						onClick={() => {
							deleteSegment({
								variables: {
									segment_id:
										segmentToDelete?.id || NO_SEGMENT,
								},
							})
								.then(() => {
									message.success('Deleted Segment!', 5)
									hideModalHandler()
									if (segment_id === segmentToDelete?.id) {
										navigate(`/${project_id}/errors`)
									}
									if (afterDeleteHandler) {
										afterDeleteHandler()
									}
								})
								.catch(() => {
									message.error('Error deleting segment!', 5)
								})
						}}
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

export default DeleteErrorSegmentModal
