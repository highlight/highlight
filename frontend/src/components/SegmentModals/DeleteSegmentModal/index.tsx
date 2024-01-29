import { Button } from '@components/Button'
import { Modal } from '@components/Modal/ModalV2'
import {
	Box,
	IconSolidExclamationCircle,
	Text,
} from '@highlight-run/ui/components'
import React from 'react'

import { ContextType } from '../utils'

interface Props {
	context: ContextType
	hideModal: () => void
	loading: boolean
	onSubmit: () => void
	segmentToDelete: { name?: string; id?: string } | null
}

export const DeleteSegmentModal: React.FC<Props> = ({
	context,
	hideModal,
	loading,
	onSubmit,
	segmentToDelete,
}) => {
	const handleSubmit = async () => {
		onSubmit()
	}

	return (
		<Modal title="Delete Segment" onClose={hideModal}>
			<Box py="8" px="12" style={{ maxWidth: 500 }}>
				<Box
					alignItems="flex-start"
					color="moderate"
					display="flex"
					gap="4"
					py="8"
				>
					<IconSolidExclamationCircle />
					<Box pt="2">
						<Text>
							{`This action is irreversible. Do you want to delete ${
								segmentToDelete?.name
									? `'${segmentToDelete.name}'`
									: 'this segment'
							}?`}
						</Text>
					</Box>
				</Box>
				<Box display="flex" justifyContent="flex-end" gap="8" pt="12">
					<Button
						trackingId={`CancelDelete${context}Segment`}
						kind="secondary"
						emphasis="medium"
						onClick={hideModal}
					>
						Cancel
					</Button>
					<Button
						trackingId={`Delete${context}Segment`}
						kind="primary"
						onClick={handleSubmit}
						loading={loading}
					>
						Delete Segment
					</Button>
				</Box>
			</Box>
		</Modal>
	)
}
