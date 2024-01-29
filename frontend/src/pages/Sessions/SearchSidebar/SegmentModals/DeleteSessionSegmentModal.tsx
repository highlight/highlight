import {
	DEMO_PROJECT_ID,
	DEMO_WORKSPACE_PROXY_APPLICATION_ID,
} from '@components/DemoWorkspaceButton/DemoWorkspaceButton'
import { DeleteSegmentModal } from '@components/SegmentModals/DeleteSegmentModal'
import { namedOperations } from '@graph/operations'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useDeleteSegmentMutation } from '../../../../graph/generated/hooks'

const NO_SEGMENT = 'none'

interface Props {
	showModal: boolean
	hideModalHandler: () => void
	segmentToDelete: { name?: string; id?: string } | null
	/** Called after a segment is deleted. */
	afterDeleteHandler?: () => void
}

export const DeleteSessionSegmentModal: React.FC<
	React.PropsWithChildren<Props>
> = ({ hideModalHandler, showModal, segmentToDelete, afterDeleteHandler }) => {
	const { segment_id, project_id } = useParams<{
		segment_id: string
		project_id: string
	}>()
	const projectIdRemapped =
		project_id === DEMO_PROJECT_ID
			? DEMO_WORKSPACE_PROXY_APPLICATION_ID
			: project_id
	const navigate = useNavigate()
	const [deleteSegment, { loading }] = useDeleteSegmentMutation({
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
		refetchQueries: [namedOperations.Query.GetSegments],
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
					navigate(`/${projectIdRemapped}/sessions`)
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
			context="Session"
			hideModal={hideModalHandler}
			loading={loading}
			onSubmit={onSubmit}
			segmentToDelete={segmentToDelete}
		/>
	)
}
