import Input from '@components/Input/Input'
import { namedOperations } from '@graph/operations'
import ErrorQueryBuilder from '@pages/Error/components/ErrorQueryBuilder/ErrorQueryBuilder'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import Button from '../../../../components/Button/Button/Button'
import { CircularSpinner } from '../../../../components/Loading/Loading'
import Modal from '../../../../components/Modal/Modal'
import ModalBody from '../../../../components/ModalBody/ModalBody'
import { useCreateErrorSegmentMutation } from '../../../../graph/generated/hooks'
import { useErrorSearchContext } from '../../ErrorSearchContext/ErrorSearchContext'
import styles from './SegmentButtons.module.scss'

interface Props {
	showModal: boolean
	onHideModal: () => void
	/** Called after a segment is created. */
	afterCreateHandler?: (segmentId: string, segmentValue: string) => void
}

const CreateErrorSegmentModal = ({
	showModal,
	onHideModal,
	afterCreateHandler,
}: Props) => {
	const [createSegment, { loading }] = useCreateErrorSegmentMutation({
		refetchQueries: [namedOperations.Query.GetErrorSegments],
	})
	const [newSegmentName, setNewSegmentName] = useState('')
	const { project_id } = useParams<{
		project_id: string
		segment_id: string
	}>()

	const { searchParams, setExistingParams } = useErrorSearchContext()
	const history = useHistory()

	const onSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		if (!newSegmentName) {
			return
		}
		createSegment({
			variables: {
				project_id,
				name: newSegmentName,
				params: searchParams,
			},
		}).then((r) => {
			setExistingParams(searchParams)
			if (afterCreateHandler) {
				afterCreateHandler(
					r.data?.createErrorSegment?.id as string,
					r.data?.createErrorSegment?.name as string,
				)
			} else {
				history.push(
					`/${project_id}/errors/segment/${r.data?.createErrorSegment?.id}`,
				)
			}
			onHideModal()
			setNewSegmentName('')
			message.success(
				`Created '${r.data?.createErrorSegment?.name}' segment`,
				5,
			)
		})
	}

	return (
		<Modal
			title="Create a Segment"
			visible={showModal}
			onCancel={onHideModal}
			style={{ display: 'flex' }}
			width={500}
			destroyOnClose
		>
			<ModalBody>
				<form onSubmit={onSubmit}>
					<p className={styles.modalSubTitle}>
						Creating a segment allows you to save search queries
						that target a specific set of errors.
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
						placeholder={'Segment Name'}
						autoFocus
					/>
					<Button
						trackingId="SaveErrorSegmentFromExistingSegment"
						style={{
							width: '100%',
							marginTop: 24,
							justifyContent: 'center',
						}}
						type="primary"
						htmlType="submit"
						disabled={!newSegmentName}
					>
						{loading ? (
							<CircularSpinner
								style={{
									fontSize: 18,
									color: 'var(--text-primary-inverted)',
								}}
							/>
						) : (
							'Save As Segment'
						)}
					</Button>
				</form>
			</ModalBody>
		</Modal>
	)
}

export default CreateErrorSegmentModal
