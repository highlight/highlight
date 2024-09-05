import { Button } from '@components/Button'
import { Modal } from '@components/Modal/ModalV2'
import { toast } from '@components/Toaster'
import { useUpsertVisualizationMutation } from '@graph/hooks'
import {
	Box,
	DEFAULT_TIME_PRESETS,
	Form,
	presetLabel,
	presetValue,
	Stack,
} from '@highlight-run/ui/components'
import React from 'react'

import { useProjectId } from '@/hooks/useProjectId'
import { Visualization } from '@/graph/generated/schemas'

interface Props {
	dashboardId: string
	showModal: boolean
	onHideModal: () => void
	settings: Visualization | undefined
}

export const DashboardSettingsModal: React.FC<Props> = ({
	dashboardId,
	showModal,
	onHideModal,
	settings,
}) => {
	const { projectId } = useProjectId()

	const [upsertViz, upsertContext] = useUpsertVisualizationMutation({})

	const onSubmit = (name: string, timePreset: string) => {
		upsertViz({
			variables: {
				visualization: {
					id: dashboardId,
					name,
					projectId,
					timePreset,
				},
			},
			onError: (e) => {
				toast.error(`Error updating dashboard: ${e.message}`)
			},
			optimisticResponse: {
				upsertVisualization: dashboardId,
			},
			update(cache) {
				const vizId = cache.identify({
					id: dashboardId,
					__typename: 'Visualization',
				})
				cache.modify({
					id: vizId,
					fields: {
						name() {
							return name
						},
						timePreset() {
							return timePreset
						},
					},
				})
			},
		})
		onHideModal()
	}

	if (!showModal || !settings) {
		return null
	}

	return (
		<InnerModal
			loading={upsertContext.loading}
			settings={settings}
			onHideModal={onHideModal}
			onSubmit={onSubmit}
		/>
	)
}

interface ModalProps {
	loading: boolean
	settings: Visualization
	onHideModal: () => void
	onSubmit: (name: string, timePreset: string) => void
}

const InnerModal = ({
	loading,
	onHideModal,
	onSubmit,
	settings,
}: ModalProps) => {
	const formStore = Form.useStore({
		defaultValues: {
			name: settings.name,
			timePreset:
				settings.timePreset || presetValue(DEFAULT_TIME_PRESETS[2]),
		},
	})

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		const name = formStore.getValue(formStore.names.name)
		const timePreset = formStore.getValue(formStore.names.timePreset)
		onSubmit(name, timePreset)
	}

	const timeLabels = DEFAULT_TIME_PRESETS.map((p) => ({
		value: presetValue(p),
		name: presetLabel(p),
	}))

	return (
		<Modal title="Dashboard settings" onClose={onHideModal}>
			<Stack py="8" px="12" style={{ minWidth: 300, maxWidth: 500 }}>
				<Form onSubmit={handleSubmit} store={formStore}>
					<Stack>
						<Form.Input
							name={formStore.names.name}
							label="Name"
							placeholder="Untitled dashboard"
							type="name"
							autoFocus
							autoComplete="off"
						/>
						<Form.Select
							label="Default time range"
							name={formStore.names.timePreset}
							placeholder="Select the default time range"
							options={timeLabels}
						/>
					</Stack>
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
							Save
						</Button>
					</Box>
				</Form>
			</Stack>
		</Modal>
	)
}
