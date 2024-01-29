import { SavedSegmentModal } from '@components/SegmentModals/SavedSegmentModal'
import { useCreateSegmentMutation, useEditSegmentMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Maybe, Segment } from '@graph/schemas'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import SessionQueryBuilder from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React from 'react'

interface Props {
	showModal: boolean
	onHideModal: () => void
	/** Called after a segment is created. */
	afterCreateHandler?: (segmentId: string, segmentValue: string) => void
	currentSegment?: Maybe<Pick<Segment, 'id' | 'name'>>
}

export const CreateSegmentModal: React.FC<Props> = ({
	showModal,
	onHideModal,
	afterCreateHandler,
	currentSegment,
}) => {
	const [createSegment, { loading: creatingSegment }] =
		useCreateSegmentMutation({
			refetchQueries: [namedOperations.Query.GetSegments],
		})
	const [editSegment, { loading: updatingSegment }] = useEditSegmentMutation({
		refetchQueries: [namedOperations.Query.GetSegments],
	})

	const { project_id } = useParams<{
		project_id: string
		segment_id: string
	}>()
	const shouldUpdate = !!currentSegment && !!project_id
	const { searchQuery } = useSearchContext()

	const onSubmit = (newSegmentName: string) => {
		if (shouldUpdate) {
			editSegment({
				variables: {
					project_id,
					id: currentSegment.id!,
					name: newSegmentName,
					query: searchQuery,
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
		} else if (project_id) {
			createSegment({
				variables: {
					project_id,
					name: newSegmentName,
					query: searchQuery,
				},
				refetchQueries: [namedOperations.Query.GetSegments],
				onCompleted: (r) => {
					if (afterCreateHandler) {
						afterCreateHandler(
							r.createSegment?.id as string,
							r.createSegment?.name as string,
						)
					}
					onHideModal()
					message.success(
						`Created '${r.createSegment?.name}' segment`,
						5,
					)
				},
				onError: (e) => {
					message.error(`Error updating segment: ${e.message}`, 5)
				},
			})
		}
	}

	if (!showModal) {
		return null
	}

	const loading = updatingSegment || creatingSegment
	return (
		<SavedSegmentModal
			context="Session"
			currentSegment={currentSegment}
			loading={loading}
			onHideModal={onHideModal}
			onSubmit={onSubmit}
			queryBuilder={<SessionQueryBuilder readonly />}
			shouldUpdate={shouldUpdate}
		/>
	)
}
