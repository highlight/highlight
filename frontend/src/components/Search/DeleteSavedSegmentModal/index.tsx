import { DeleteSegmentModal } from '@components/SegmentModals/DeleteSegmentModal'
import { toast } from '@components/Toaster'
import { namedOperations } from '@graph/operations'
import { Maybe, SavedSegment, SavedSegmentEntityType } from '@graph/schemas'
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
				toast.success('Deleted Segment!', { duration: 5000 })
				onHideModal()
				if (afterDeleteHandler) {
					afterDeleteHandler()
				}
			})
			.catch(() => {
				toast.error('Error deleting segment!', { duration: 5000 })
			})
	}

	if (!showModal) {
		return null
	}

	return (
		<DeleteSegmentModal
			context={entityType}
			hideModal={onHideModal}
			loading={loading}
			onSubmit={onSubmit}
			segmentToDelete={segmentToDelete}
		/>
	)
}
