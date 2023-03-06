import { Button } from '@components/Button'
import Input from '@components/Input/Input'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import {
	useCreateErrorSegmentMutation,
	useEditErrorSegmentMutation,
} from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { ErrorSegment, Maybe } from '@graph/schemas'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import ErrorQueryBuilder from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'

import styles from './SegmentButtons.module.scss'

interface Props {
	showModal: boolean
	onHideModal: () => void
	/** Called after a segment is created. */
	afterCreateHandler?: (segmentId: string, segmentValue: string) => void
	currentSegment?: Maybe<Partial<ErrorSegment>>
}

const CreateErrorSegmentModal = ({
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

	const [newSegmentName, setNewSegmentName] = useState(
		currentSegment?.name ?? '',
	)

	const shouldUpdate = !!currentSegment && !!currentSegment.id
	useEffect(() => {
		if (shouldUpdate && currentSegment?.name) {
			setNewSegmentName(currentSegment?.name)
		} else {
			setNewSegmentName('')
		}
	}, [currentSegment?.name, shouldUpdate])

	const { project_id } = useParams<{
		project_id: string
		segment_id: string
	}>()

	const { searchParams, setExistingParams } = useErrorSearchContext()

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!newSegmentName) {
			return
		}

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
					params: searchParams,
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
					setExistingParams(searchParams)
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
					params: searchParams,
				},
				refetchQueries: [namedOperations.Query.GetErrorSegments],
				onCompleted: (r) => {
					if (afterCreateHandler) {
						afterCreateHandler(
							r.createErrorSegment?.id as string,
							r.createErrorSegment?.name as string,
						)
					}
					setExistingParams(searchParams)
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

	const loading = creatingErrorSegment || updatingErrorSegment
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
						specific set of errors.
					</p>
					<div className={styles.queryBuilderContainer}>
						<ErrorQueryBuilder readonly />
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
							shouldUpdate
								? 'UpdateErrorSegment'
								: 'SaveErrorSegment'
						}
						style={{
							width: '100%',
							marginTop: 24,
							justifyContent: 'center',
						}}
						kind="primary"
						disabled={!newSegmentName}
						loading={loading}
						type="submit"
					>
						{shouldUpdate ? 'Update Segment' : 'Save As Segment'}
					</Button>
				</form>
			</ModalBody>
		</Modal>
	)
}

export default CreateErrorSegmentModal
