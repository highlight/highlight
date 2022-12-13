import Input from '@components/Input/Input'
import { CircularSpinner } from '@components/Loading/Loading'
import { useCreateSegmentMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Maybe, Segment } from '@graph/schemas'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import SessionsQueryBuilder from '@pages/Sessions/SessionsFeedV2/components/SessionsQueryBuilder/SessionsQueryBuilder'
import { useParams } from '@util/react-router/useParams'
import { message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import Button from '../../../../components/Button/Button/Button'
import Modal from '../../../../components/Modal/Modal'
import ModalBody from '../../../../components/ModalBody/ModalBody'
import styles from './SegmentButtons.module.scss'

interface Props {
	showModal: boolean
	onHideModal: () => void
	/** Called after a segment is created. */
	afterCreateHandler?: (segmentId: string, segmentValue: string) => void
	currentSegment?: Maybe<Partial<Segment>>
}

const CreateSegmentModal = ({
	showModal,
	onHideModal,
	afterCreateHandler,
	currentSegment,
}: Props) => {
	const [createSegment, { loading }] = useCreateSegmentMutation({
		refetchQueries: [namedOperations.Query.GetSegments],
	})

	const [newSegmentName, setNewSegmentName] = useState(
		currentSegment?.name ?? '',
	)

	const shouldUpdate = !!currentSegment
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

	const { searchParams, setExistingParams } = useSearchContext()
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
					r.data?.createSegment?.id as string,
					r.data?.createSegment?.name as string,
				)
			} else {
				history.push(
					`/${project_id}/sessions/segment/${r.data?.createSegment?.id}`,
				)
			}
			onHideModal()
			if (shouldUpdate) {
				message.success(
					`Changed '${currentSegment.name}' name to '${r.data?.createSegment?.name}'`,
					5,
				)
			} else {
				message.success(
					`Created '${r.data?.createSegment?.name}' segment`,
					5,
				)
			}
		})
	}

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
						<SessionsQueryBuilder readonly />
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
						) : shouldUpdate ? (
							'Update Segment'
						) : (
							'Save As Segment'
						)}
					</Button>
				</form>
			</ModalBody>
		</Modal>
	)
}

export default CreateSegmentModal
