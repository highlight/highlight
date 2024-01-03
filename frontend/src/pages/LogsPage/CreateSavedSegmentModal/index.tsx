import { SavedSegmentModal } from '@components/SegmentModals/SavedSegmentModal'
import {
	useCreateSavedSegmentMutation,
	useEditSavedSegmentMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Maybe, SavedSegment, SavedSegmentEntityType } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React from 'react'

import { SavedSegmentQueryDisplay } from '../SavedSegmentQueryDisplay'

interface Props {
	/** Called after a segment is created. */
	afterCreateHandler?: (segmentId: string, segmentValue: string) => void
	currentSegment?: Maybe<Pick<SavedSegment, 'id' | 'name'>>
	entityType: SavedSegmentEntityType
	onHideModal: () => void
	query: string
	showModal: boolean
}
export const CreateSavedSegmentModal: React.FC<Props> = ({
	afterCreateHandler,
	currentSegment,
	entityType,
	onHideModal,
	query,
	showModal,
}) => {
	const [createSavedSegment, { loading: creatingSavedSegment }] =
		useCreateSavedSegmentMutation({
			refetchQueries: [namedOperations.Query.GetSavedSegments],
		})

	const [editSavedSegment, { loading: updatingSavedSegment }] =
		useEditSavedSegmentMutation({
			refetchQueries: [namedOperations.Query.GetSavedSegments],
		})

	const { project_id } = useParams<{ project_id: string }>()
	const loading = creatingSavedSegment || updatingSavedSegment
	const shouldUpdate = !!currentSegment && !!project_id

	const onSubmit = (newSegmentName: string) => {
		if (shouldUpdate) {
			editSavedSegment({
				variables: {
					project_id: project_id!,
					entity_type: entityType,
					id: currentSegment.id!,
					name: newSegmentName,
					query: query,
				},
				onCompleted: () => {
					message.success(
						`Changed '${currentSegment.name}' name to '${newSegmentName}'`,
						5,
					)
					if (afterCreateHandler) {
						afterCreateHandler(
							currentSegment.id! as string,
							newSegmentName as string,
						)
					}
					onHideModal()
				},
				onError: (e) => {
					message.error(`Error updating segment: ${e.message}`, 5)
				},
			})
		} else {
			createSavedSegment({
				variables: {
					project_id: project_id!,
					entity_type: entityType,
					name: newSegmentName,
					query: query,
				},
				refetchQueries: [namedOperations.Query.GetSavedSegments],
				onCompleted: (r) => {
					if (afterCreateHandler) {
						afterCreateHandler(
							r.createSavedSegment?.id as string,
							r.createSavedSegment?.name as string,
						)
					}
					onHideModal()
					message.success(
						`Created '${r.createSavedSegment?.name}' segment`,
						5,
					)
				},
				onError: (e) => {
					message.error(`Error updating segment: ${e.message}`, 5)
				},
			})
		}
	}

	return (
		<SavedSegmentModal
			context={entityType}
			currentSegment={currentSegment}
			loading={loading}
			onHideModal={onHideModal}
			onSubmit={onSubmit}
			queryBuilder={<SavedSegmentQueryDisplay query={query} />}
			showModal={showModal}
			shouldUpdate={shouldUpdate}
		/>
	)
}
