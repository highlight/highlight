import { Button } from '@components/Button'
import Input from '@components/Input/Input'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import { useCreateSegmentMutation, useEditSegmentMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Maybe, Segment } from '@graph/schemas'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import SessionQueryBuilder from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'

import { SearchOption } from '@/components/Select/SearchSelect/SearchSelect'
import { removeTimeField } from '@/context/SearchState'

import styles from './SegmentButtons.module.css'

interface Props {
	showModal: boolean
	timeRangeField: SearchOption
	onHideModal: () => void
	/** Called after a segment is created. */
	afterCreateHandler?: (segmentId: string, segmentValue: string) => void
	currentSegment?: Maybe<Pick<Segment, 'id' | 'name'>>
}

const CreateSegmentModal = ({
	showModal,
	timeRangeField,
	onHideModal,
	afterCreateHandler,
	currentSegment,
}: Props) => {
	const [createSegment, { loading: creatingSegment }] =
		useCreateSegmentMutation({
			refetchQueries: [namedOperations.Query.GetSegments],
		})

	const [editSegment, { loading: updatingSegment }] = useEditSegmentMutation({
		refetchQueries: [namedOperations.Query.GetSegments],
	})

	const [newSegmentName, setNewSegmentName] = useState(
		currentSegment?.name ?? '',
	)

	const { project_id } = useParams<{
		project_id: string
		segment_id: string
	}>()
	const shouldUpdate = !!currentSegment && !!project_id
	useEffect(() => {
		if (shouldUpdate && currentSegment?.name) {
			setNewSegmentName(currentSegment?.name)
		} else {
			setNewSegmentName('')
		}
	}, [currentSegment?.name, shouldUpdate])

	const { searchQuery } = useSearchContext()

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!newSegmentName) {
			return
		}

		const queryWithoutTimeRange = removeTimeField(
			searchQuery,
			timeRangeField,
		)

		if (shouldUpdate) {
			editSegment({
				variables: {
					project_id,
					id: currentSegment.id!,
					name: newSegmentName,
					params: { query: queryWithoutTimeRange },
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
					params: { query: queryWithoutTimeRange },
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

	const loading = updatingSegment || creatingSegment

	return (
		<Modal
			title={shouldUpdate ? 'Update a Segment' : 'Create a Segment'}
			visible={showModal}
			onCancel={onHideModal}
			style={{ display: 'flex' }}
			width={500}
			destroyOnClose
		>
			<ModalBody>
				<form onSubmit={onSubmit}>
					<p className={styles.modalSubTitle}>
						Segments allow you to save search queries that target a
						specific set of sessions.
					</p>
					<div className={styles.queryBuilderContainer}>
						<SessionQueryBuilder readonly />
					</div>
					<Input
						name="name"
						value={newSegmentName}
						onChange={(e) => {
							setNewSegmentName(e.target.value)
						}}
						placeholder="Segment Name"
						autoFocus
					/>
					<Button
						trackingId={
							shouldUpdate ? 'UpdateSegment' : 'SaveSegment'
						}
						style={{
							width: '100%',
							marginTop: 24,
							justifyContent: 'center',
						}}
						kind="primary"
						type="submit"
						disabled={!newSegmentName}
						loading={loading}
					>
						{shouldUpdate ? 'Update Segment' : 'Save As Segment'}
					</Button>
				</form>
			</ModalBody>
		</Modal>
	)
}

export default CreateSegmentModal
