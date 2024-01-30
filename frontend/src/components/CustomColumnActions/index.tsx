import {
	Box,
	IconOutlineDotsHorizontal,
	IconSolidArrowLeft,
	IconSolidArrowRight,
	IconSolidClipboardCopy,
	IconSolidXCircle,
	Menu,
	Table,
} from '@highlight-run/ui/components'
import { copyToClipboard } from '@util/string'
import * as React from 'react'
import { useMemo } from 'react'

import { ValidCustomColumn } from '@/components/CustomColumnPopover'
import analytics from '@/util/analytics'

type Props = {
	selectedColumns: ValidCustomColumn[]
	setSelectedColumns: (columns: ValidCustomColumn[]) => void
	columnId: string
	trackingId: string
}

export const CustomColumnActions: React.FC<Props> = ({
	selectedColumns,
	setSelectedColumns,
	columnId,
	trackingId,
}) => {
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

	const disableLeft = columnIndex === 0
	const disableRight = columnIndex === selectedColumns.length - 1

	return (
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
				<Menu.Item disabled={disableRight} onClick={moveColumnRight}>
					<Box display="flex" alignItems="center" gap="4">
						<IconSolidArrowRight size={16} />
						Move to right column
					</Box>
				</Menu.Item>
				<Menu.Item disabled={disableRight} onClick={copyColumn}>
					<Box display="flex" alignItems="center" gap="4">
						<IconSolidClipboardCopy size={16} />
						Copy search key
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
	)
}
