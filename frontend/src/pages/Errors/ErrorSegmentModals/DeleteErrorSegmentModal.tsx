import { DeleteSegmentModal } from '@components/SegmentModals/DeleteSegmentModal'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useDeleteErrorSegmentMutation } from '../../../graph/generated/hooks'

const NO_SEGMENT = 'none'

interface Props {
	showModal: boolean
	hideModalHandler: () => void
	segmentToDelete: { name?: string; id?: string } | null
	/** Called after a segment is deleted. */
	afterDeleteHandler?: () => void
}

export const DeleteErrorSegmentModal: React.FC<
	React.PropsWithChildren<Props>
> = ({ hideModalHandler, showModal, segmentToDelete, afterDeleteHandler }) => {
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

	const onSubmit = () => {
		deleteSegment({
			variables: {
				segment_id: segmentToDelete?.id || NO_SEGMENT,
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
	}

	if (!showModal) {
		return null
	}

	return (
		<DeleteSegmentModal
			context="Error"
			hideModal={hideModalHandler}
			loading={loading}
			onSubmit={onSubmit}
			segmentToDelete={segmentToDelete}
		/>
	)
}
