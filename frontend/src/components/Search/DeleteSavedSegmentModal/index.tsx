import { DeleteSegmentModal } from '@components/SegmentModals/DeleteSegmentModal'
import { namedOperations } from '@graph/operations'
import { Maybe, SavedSegment, SavedSegmentEntityType } from '@graph/schemas'
import { message } from 'antd'
import React from 'react'

import { useDeleteSavedSegmentMutation } from '@/graph/generated/hooks'

const NO_SEGMENT = 'none'

interface Props {
	/** Called after a segment is deleted. */
	afterDeleteHandler?: () => void
	entityType: SavedSegmentEntityType
	onHideModal: () => void
	segmentToDelete: Maybe<Pick<SavedSegment, 'id' | 'name'>>
	showModal: boolean
}

export const DeleteSavedSegmentModal: React.FC<Props> = ({
	afterDeleteHandler,
	entityType,
	onHideModal,
	segmentToDelete,
	showModal,
}) => {
	const [deleteSegment, { loading }] = useDeleteSavedSegmentMutation({
		refetchQueries: [namedOperations.Query.GetSavedSegments],
	})

	const onSubmit = () => {
		deleteSegment({
			variables: {
				segment_id: segmentToDelete?.id || NO_SEGMENT,
			},
		})
			.then(() => {
				message.success('Deleted Segment!', 5)
				onHideModal()
				if (afterDeleteHandler) {
					afterDeleteHandler()
				}
			})
			.catch(() => {
				message.error('Error deleting segment!', 5)
			})
	}

	return (
		<DeleteSegmentModal
			context={entityType}
			hideModal={onHideModal}
			loading={loading}
			onSubmit={onSubmit}
			segmentToDelete={segmentToDelete}
			showModal={showModal}
		/>
	)
}
