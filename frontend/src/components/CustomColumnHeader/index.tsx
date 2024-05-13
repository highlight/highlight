import { Box, Table, Text } from '@highlight-run/ui/components'
import { useMemo, useRef } from 'react'

import { CustomColumnActions } from '@/components/CustomColumnActions'
import { ValidCustomColumn } from '@/components/CustomColumnPopover'

export type ColumnHeader = {
	id: string
	component: React.ReactNode
	showActions?: boolean
	noPadding?: boolean
}

type Props = {
	header: ColumnHeader
	selectedColumns: ValidCustomColumn[]
	setSelectedColumns: (columns: ValidCustomColumn[]) => void
	standardColumns: Record<string, ValidCustomColumn>
	trackingIdPrefix: string
}

const MINIMUM_COLUMN_WIDTH = 50

export const CustomColumnHeader: React.FC<Props> = ({
	header,
	selectedColumns,
	setSelectedColumns,
	standardColumns,
	trackingIdPrefix,
}) => {
	const headerRef = useRef<HTMLDivElement>(null)

	const columnIndex = useMemo(
		() => selectedColumns.findIndex((c) => c.id === header.id),
		[selectedColumns, header.id],
	)

	const handleDrag = (e: React.MouseEvent) => {
		const leftElementCoord = headerRef.current?.getBoundingClientRect()
		const rightElementCoord =
			headerRef.current?.nextElementSibling?.getBoundingClientRect()

		if (
			leftElementCoord &&
			rightElementCoord &&
			e.pageX > leftElementCoord.left + MINIMUM_COLUMN_WIDTH &&
			e.pageX < rightElementCoord.right - MINIMUM_COLUMN_WIDTH
		) {
			const leftElementWidth = leftElementCoord.width
			const rightElementWidth = rightElementCoord.width
			const leftElementNewWidth = e.pageX - leftElementCoord.left
			const rightElementNewWidth =
				rightElementWidth - (leftElementNewWidth - leftElementWidth)

			const newSelectedColumns = [...selectedColumns]
			newSelectedColumns[columnIndex] = {
				...newSelectedColumns[columnIndex],
				size: `${leftElementNewWidth}px`,
			}
			newSelectedColumns[columnIndex + 1] = {
				...newSelectedColumns[columnIndex + 1],
				size: `${rightElementNewWidth}px`,
			}

			setSelectedColumns(newSelectedColumns)
		}
	}

	const resizeable =
		header.showActions && columnIndex !== selectedColumns.length - 1

	return (
		<Table.Header
			key={header.id}
			noPadding={header.noPadding}
			ref={headerRef}
		>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Text lines="1">{header.component}</Text>
				{header.showActions && (
					<CustomColumnActions
						columnId={header.id}
						selectedColumns={selectedColumns}
						setSelectedColumns={setSelectedColumns}
						trackingId={trackingIdPrefix}
						standardColumns={standardColumns}
					/>
				)}
			</Box>
			{resizeable && (
				<Box
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						right: 0,
						width: 3,
						cursor: 'col-resize',
					}}
					draggable
					onDrag={handleDrag}
				/>
			)}
		</Table.Header>
	)
}
