import { Button } from '@components/Button'
import { Modal } from '@components/Modal/ModalV2'
import { toast } from '@components/Toaster'
import { useUpsertVisualizationMutation } from '@graph/hooks'
import { namedOperations } from '@graph/operations'
import { Box, Form, Stack } from '@highlight-run/ui/components'
import React from 'react'

import { useProjectId } from '@/hooks/useProjectId'

interface Props {
	showModal: boolean
	onHideModal: () => void
	afterCreateHandler: (newDashboardId: string) => void
}

export const CreateDashboardModal: React.FC<Props> = ({
	showModal,
	onHideModal,
	afterCreateHandler,
}) => {
	const { projectId } = useProjectId()

	const [upsertViz, upsertContext] = useUpsertVisualizationMutation({
		refetchQueries: [
			namedOperations.Query.GetVisualizations,
			namedOperations.Query.GetWorkspaceSettings,
		],
	})

	const onSubmit = (name: string) => {
		upsertViz({
			variables: {
				visualization: {
					name,
					projectId,
				},
			},
			onCompleted: (d) => {
				if (afterCreateHandler) {
					afterCreateHandler(d.upsertVisualization)
				}
				onHideModal()
			},
			onError: (e) => {
				toast.error(`Error creating dashboard: ${e.message}`)
			},
		})
	}

	if (!showModal) {
		return null
	}

	return (
		<InnerModal
			loading={upsertContext.loading}
			onHideModal={onHideModal}
			onSubmit={onSubmit}
		/>
	)
}

interface ModalProps {
	loading: boolean
	onHideModal: () => void
	onSubmit: (name: string) => void
}

const InnerModal = ({ loading, onHideModal, onSubmit }: ModalProps) => {
	const formStore = Form.useStore({
		defaultValues: {
			name: '',
		},
	})

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		const newName = formStore.getValue(formStore.names.name)
		onSubmit(newName)
	}

	return (
		<Modal title="Create new dashboard" onClose={onHideModal}>
			<Stack py="8" px="12" style={{ minWidth: 300, maxWidth: 500 }}>
				<Form onSubmit={handleSubmit} store={formStore}>
					<Form.Input
						name={formStore.names.name}
						label="Dashboard name"
						placeholder="Untitled dashboard"
						type="name"
						autoFocus
						autoComplete="off"
					/>
					<Box borderTop="dividerWeak" my="12" width="full" />

					<Box
						display="flex"
						justifyContent="flex-end"
						gap="8"
						pt="12"
					>
						<Button
							trackingId="cancel-create-dashboard"
							kind="secondary"
							emphasis="medium"
							onClick={onHideModal}
						>
							Cancel
						</Button>
						<Button
							trackingId="submit-create-dashboard"
							kind="primary"
							type="submit"
							disabled={!formStore.useValue(formStore.names.name)}
							loading={loading}
						>
							Create
						</Button>
					</Box>
				</Form>
			</Stack>
		</Modal>
	)
}
