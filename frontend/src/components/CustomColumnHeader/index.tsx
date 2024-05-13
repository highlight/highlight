import { Box, Table, Text } from '@highlight-run/ui/components'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CustomColumnActions } from '@/components/CustomColumnActions'
import { ValidCustomColumn } from '@/components/CustomColumnPopover'

import * as styles from './styles.css'

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
	rowWidth?: number
}

const MINIMUM_COLUMN_WIDTH = 50

export const CustomColumnHeader: React.FC<Props> = ({
	header,
	selectedColumns,
	setSelectedColumns,
	standardColumns,
	trackingIdPrefix,
	rowWidth,
}) => {
	const headerRef = useRef<HTMLDivElement>(null)

	const columnIndex = useMemo(
		() => selectedColumns.findIndex((c) => c.id === header.id),
		[selectedColumns, header.id],
	)

	const dragHandleRef = useRef<HTMLDivElement>(null)
	const [dragging, setDragging] = useState(false)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragging) {
				return
			}
			e.stopPropagation()
			e.preventDefault()

			const leftElementCoord = headerRef.current?.getBoundingClientRect()
			const rightElementCoord =
				headerRef.current?.nextElementSibling?.getBoundingClientRect()

			if (
				rowWidth &&
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

				const leftElementNewWidthPecentage =
					(leftElementNewWidth / rowWidth) * 100
				const rightElementNewWidthPercentage =
					(rightElementNewWidth / rowWidth) * 100

				const newSelectedColumns = [...selectedColumns]
				newSelectedColumns[columnIndex] = {
					...newSelectedColumns[columnIndex],
					size: `${leftElementNewWidthPecentage}%`,
				}
				newSelectedColumns[columnIndex + 1] = {
					...newSelectedColumns[columnIndex + 1],
					size: `${rightElementNewWidthPercentage}%`,
				}

				setSelectedColumns(newSelectedColumns)
			}
		},
		[columnIndex, dragging, rowWidth, selectedColumns, setSelectedColumns],
	)

	const handleMouseUp = useCallback(() => {
		setDragging(false)
	}, [])

	useEffect(() => {
		if (dragging) {
			window.addEventListener('mousemove', handleMouseMove, true)
			window.addEventListener('mouseup', handleMouseUp, true)
		} else {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}
	}, [dragging, handleMouseMove, handleMouseUp])

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
					ref={dragHandleRef}
					cssClass={styles.panelDragHandle}
					onMouseDown={(e) => {
						e.preventDefault()
						setDragging(true)
					}}
				/>
			)}
		</Table.Header>
	)
}
