import { SavedSegmentModal } from '@components/SegmentModals/SavedSegmentModal'
import {
	useCreateErrorSegmentMutation,
	useEditErrorSegmentMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ErrorSegment, Maybe } from '@graph/schemas'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import { useQueryParam } from 'use-query-params'

import { QueryParam } from '@/components/Search/SearchForm/SearchForm'

interface Props {
	showModal: boolean
	onHideModal: () => void
	/** Called after a segment is created. */
	afterCreateHandler?: (segmentId: string, segmentValue: string) => void
	currentSegment?: Maybe<Pick<ErrorSegment, 'id' | 'name'>>
}

export const CreateErrorSegmentModal = ({
	showModal,
	onHideModal,
	afterCreateHandler,
	currentSegment,
}: Props) => {
	const [createErrorSegment, { loading: creatingErrorSegment }] =
		useCreateErrorSegmentMutation({
			refetchQueries: [namedOperations.Query.GetErrorSegments],
		})

	const [editErrorSegment, { loading: updatingErrorSegment }] =
		useEditErrorSegmentMutation({
			refetchQueries: [namedOperations.Query.GetErrorSegments],
		})

	const shouldUpdate = !!currentSegment && !!currentSegment.id

	const { project_id } = useParams<{
		project_id: string
		segment_id: string
	}>()

	// TODO(spenny): use new saved searches
	const [query] = useQueryParam('query', QueryParam)

	const onSubmit = (newSegmentName: string) => {
		if (newSegmentName === currentSegment?.name) {
			onHideModal()
			return
		}

		if (shouldUpdate) {
			editErrorSegment({
				variables: {
					project_id: project_id!,
					id: currentSegment.id!,
					name: newSegmentName,
					query,
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
			createErrorSegment({
				variables: {
					project_id: project_id!,
					name: newSegmentName,
					query,
				},
				refetchQueries: [namedOperations.Query.GetErrorSegments],
				onCompleted: (r) => {
					if (afterCreateHandler) {
						afterCreateHandler(
							r.createErrorSegment?.id as string,
							r.createErrorSegment?.name as string,
						)
					}
					onHideModal()
					message.success(
						`Created '${r.createErrorSegment?.name}' segment`,
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

	const loading = creatingErrorSegment || updatingErrorSegment
	return (
		<SavedSegmentModal
			context="Error"
			currentSegment={currentSegment}
			loading={loading}
			onHideModal={onHideModal}
			onSubmit={onSubmit}
			queryBuilder={<div>TODO(spenny)</div>}
			shouldUpdate={shouldUpdate}
		/>
	)
}
