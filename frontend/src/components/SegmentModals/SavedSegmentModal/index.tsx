import { Button } from '@components/Button'
import { Modal } from '@components/Modal/ModalV2'
import {
	Box,
	Form,
	IconSolidInformationCircle,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { Maybe } from 'graphql/jsutils/Maybe'
import React from 'react'

import { SavedSegment } from '@/graph/generated/schemas'

import { ContextType } from '../utils'

interface Props {
	context: ContextType
	currentSegment?: Maybe<Pick<SavedSegment, 'id' | 'name'>>
	loading: boolean
	onHideModal: () => void
	onSubmit: (name: string) => void
	queryBuilder: React.ReactNode
	shouldUpdate: boolean
}

export const SavedSegmentModal = ({
	context,
	currentSegment,
	loading,
	onHideModal,
	onSubmit,
	queryBuilder,
	shouldUpdate,
}: Props) => {
	const formStore = Form.useStore({
		defaultValues: {
			name: currentSegment?.name || '',
			filters: '',
		},
	})

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()

		const newSegmentName = formStore.getValue(formStore.names.name)
		onSubmit(newSegmentName)
	}

	return (
		<Modal
			title={shouldUpdate ? 'Update Segment' : 'Create Segment'}
			onClose={onHideModal}
		>
			<Stack py="8" px="12" style={{ maxWidth: 500 }}>
				<Form onSubmit={handleSubmit} store={formStore}>
					<Form.Input
						name={formStore.names.name}
						label="Segment Name"
						placeholder="Type name..."
						type="name"
						autoFocus
					/>
					<Box borderTop="dividerWeak" my="12" width="full" />
					<Box mb="4" gap="4" display="flex" flexDirection="column">
						<Form.Label
							label="Filters"
							name={formStore.names.filters}
						/>
						{queryBuilder}
					</Box>
					<Box
						alignItems="flex-start"
						color="moderate"
						display="flex"
						gap="4"
						py="12"
					>
						<IconSolidInformationCircle />
						<Box pt="2">
							<Text>
								Segments allow you to save search queries that
								target a specific set of sessions.
							</Text>
						</Box>
					</Box>
					<Box
						display="flex"
						justifyContent="flex-end"
						gap="8"
						pt="12"
					>
						<Button
							trackingId={`Cancel${context}Segment`}
							kind="secondary"
							emphasis="medium"
							onClick={onHideModal}
						>
							Cancel
						</Button>
						<Button
							trackingId={
								shouldUpdate
									? `Update${context}Segment`
									: `Save${context}Segment`
							}
							kind="primary"
							type="submit"
							disabled={!formStore.useValue(formStore.names.name)}
							loading={loading}
						>
							{shouldUpdate
								? 'Update Segment'
								: 'Save as Segment'}
						</Button>
					</Box>
				</Form>
			</Stack>
		</Modal>
	)
}
