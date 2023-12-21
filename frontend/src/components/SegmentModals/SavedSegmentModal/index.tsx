import { Button } from '@components/Button'
import Input from '@components/Input/Input'
import Modal from '@components/Modal/Modal'
import ModalBody from '@components/ModalBody/ModalBody'
import { Maybe } from 'graphql/jsutils/Maybe'
import React, { useEffect, useState } from 'react'

import { Segment } from '@/graph/generated/schemas'

import { ContextType } from '../utils'
import * as styles from './style.css'

interface Props {
	context: ContextType
	currentSegment?: Maybe<Pick<Segment, 'id' | 'name'>>
	loading: boolean
	onHideModal: () => void
	onSubmit: (name: string) => void
	queryBuilder: React.ReactNode
	shouldUpdate: boolean
	showModal: boolean
}

export const SavedSegmentModal = ({
	context,
	currentSegment,
	loading,
	onHideModal,
	onSubmit,
	queryBuilder,
	shouldUpdate,
	showModal,
}: Props) => {
	const [newSegmentName, setNewSegmentName] = useState(
		currentSegment?.name ?? '',
	)

	useEffect(() => {
		if (shouldUpdate && currentSegment?.name) {
			setNewSegmentName(currentSegment?.name)
		} else {
			setNewSegmentName('')
		}
	}, [currentSegment?.name, shouldUpdate])

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()

		if (!newSegmentName) {
			return
		}

		onSubmit(newSegmentName)
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
				<form onSubmit={handleSubmit}>
					<p className={styles.modalSubTitle}>
						Segments allow you to save search queries that target a
						specific set of sessions.
					</p>
					<div className={styles.queryBuilderContainer}>
						{queryBuilder}
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
								? `Update${context}Segment`
								: `Save${context}Segment`
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
