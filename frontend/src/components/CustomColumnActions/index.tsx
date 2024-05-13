import { Button } from '@components/Button'
import {
	Box,
	Form,
	IconOutlineDotsHorizontal,
	IconSolidArrowLeft,
	IconSolidArrowRight,
	IconSolidClipboardCopy,
	IconSolidCloudUpload,
	IconSolidRefresh,
	IconSolidXCircle,
	Menu,
	Stack,
	Table,
} from '@highlight-run/ui/components'
import { copyToClipboard } from '@util/string'
import * as React from 'react'
import { useMemo } from 'react'

import { ValidCustomColumn } from '@/components/CustomColumnPopover'
import { Modal } from '@/components/Modal/ModalV2'
import analytics from '@/util/analytics'

type Props = {
	selectedColumns: ValidCustomColumn[]
	setSelectedColumns: (columns: ValidCustomColumn[]) => void
	columnId: string
	trackingId: string
	standardColumns: Record<string, ValidCustomColumn>
}

export const CustomColumnActions: React.FC<Props> = ({
	selectedColumns,
	setSelectedColumns,
	columnId,
	trackingId,
	standardColumns,
}) => {
	const [labelModalOpen, setLabelModalOpen] = React.useState(false)

	const columnIndex = useMemo(
		() => selectedColumns.findIndex((c) => c.id === columnId),
		[selectedColumns, columnId],
	)

	const trackEvent = (action: string) => {
		analytics.track(`Button-${trackingId}_${action}`, { columnId })
	}

	const removeColumn = () => {
		trackEvent('hide')
		setSelectedColumns(selectedColumns.filter((c) => c.id !== columnId))
	}

	const moveColumnLeft = () => {
		trackEvent('left')
		const newColumns = [...selectedColumns]
		newColumns[columnIndex] = selectedColumns[columnIndex - 1]
		newColumns[columnIndex - 1] = selectedColumns[columnIndex]
		setSelectedColumns(newColumns)
	}

	const moveColumnRight = () => {
		trackEvent('right')
		const newColumns = [...selectedColumns]
		newColumns[columnIndex] = selectedColumns[columnIndex + 1]
		newColumns[columnIndex + 1] = selectedColumns[columnIndex]
		setSelectedColumns(newColumns)
	}

	const copyColumn = () => {
		trackEvent('copy')
		copyToClipboard(columnId, {
			onCopyText: 'Copied to clipboard',
		})
	}

	const handleLabelUpdateColumn = () => {
		trackEvent('rename')
		setLabelModalOpen(true)
	}

	const handleLabelUpdateSubmit = (column: ValidCustomColumn) => {
		const newColumns = [...selectedColumns]
		newColumns[columnIndex] = column
		setSelectedColumns(newColumns)
	}

	const resetSize = () => {
		trackEvent('resetSize')
		const newColumns = [...selectedColumns]

		const newSize =
			standardColumns[selectedColumns[columnIndex].id]?.size || '1fr'

		newColumns[columnIndex] = {
			...selectedColumns[columnIndex],
			size: newSize,
		}
		setSelectedColumns(newColumns)
	}

	const disableLeft = columnIndex === 0
	const disableRight = columnIndex === selectedColumns.length - 1

	return (
		<>
			<Menu>
				<Table.Discoverable trigger="header">
					<Menu.Button
						style={{
							padding: 0,
							height: 'fit-content',
						}}
						size="small"
						emphasis="low"
						kind="secondary"
						onClick={() => trackEvent('open')}
					>
						<IconOutlineDotsHorizontal />
					</Menu.Button>
				</Table.Discoverable>
				<Menu.List>
					<Menu.Item disabled={disableLeft} onClick={moveColumnLeft}>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidArrowLeft size={16} />
							Move to left column
						</Box>
					</Menu.Item>
					<Menu.Item
						disabled={disableRight}
						onClick={moveColumnRight}
					>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidArrowRight size={16} />
							Move to right column
						</Box>
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item onClick={handleLabelUpdateColumn}>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidCloudUpload size={16} />
							Update label
						</Box>
					</Menu.Item>
					<Menu.Item onClick={copyColumn}>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidClipboardCopy size={16} />
							Copy search key
						</Box>
					</Menu.Item>
					<Menu.Item onClick={resetSize}>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidRefresh size={16} />
							Reset size
						</Box>
					</Menu.Item>
					<Menu.Divider />
					<Menu.Item onClick={removeColumn}>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidXCircle size={16} />
							Hide {columnId}
						</Box>
					</Menu.Item>
				</Menu.List>
			</Menu>
			{labelModalOpen && (
				<LabelModal
					onHideModal={() => setLabelModalOpen(false)}
					column={selectedColumns[columnIndex]}
					handleSubmit={handleLabelUpdateSubmit}
				/>
			)}
		</>
	)
}

type LabelModalProps = {
	onHideModal: () => void
	column: ValidCustomColumn
	handleSubmit: (column: ValidCustomColumn) => void
}

const LabelModal: React.FC<LabelModalProps> = ({
	onHideModal,
	column,
	handleSubmit,
}) => {
	const formStore = Form.useStore({
		defaultValues: {
			id: column.id,
			label: column.label || '',
		},
	})

	const onSubmit = () => {
		const newColumn = {
			...column,
			label: formStore.getValue(formStore.names.label),
		}
		handleSubmit(newColumn)

		onHideModal()
	}

	return (
		<Modal title={`Update ${column.id} Label`} onClose={onHideModal}>
			<Stack py="8" px="12" style={{ width: 300 }}>
				<Form onSubmit={onSubmit} store={formStore}>
					<Form.Input
						name={formStore.names.label}
						label="Label Name"
						placeholder="Type name..."
						type="name"
						autoFocus
					/>
					<Box
						display="flex"
						justifyContent="flex-end"
						gap="8"
						pt="12"
					>
						<Button
							trackingId="CancelColumnLabelUpdate"
							kind="secondary"
							emphasis="medium"
							onClick={onHideModal}
						>
							Cancel
						</Button>
						<Button
							trackingId="SubmitColumnLabelUpdate"
							kind="primary"
							type="submit"
							disabled={
								!formStore.useValue(formStore.names.label)
							}
						>
							Update label
						</Button>
					</Box>
				</Form>
			</Stack>
		</Modal>
	)
}
