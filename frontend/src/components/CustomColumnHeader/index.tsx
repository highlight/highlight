import {
	Box,
	IconSolidSortAscending,
	IconSolidSortDescending,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import { useMemo, useRef } from 'react'

import { CustomColumnActions } from '@/components/CustomColumnActions'
import { SerializedColumn } from '@/components/CustomColumnPopover'
import { SortDirection } from '@/graph/generated/schemas'

export type ColumnHeader = {
	id: string
	component: React.ReactNode
	showActions?: boolean
	noPadding?: boolean
	onSort?: (direction?: SortDirection | null) => void
}

type Props = {
	header: ColumnHeader
	selectedColumns: SerializedColumn[]
	setSelectedColumns: (columns: SerializedColumn[]) => void
	standardColumns: Record<string, SerializedColumn>
	trackingIdPrefix: string
	sortColumn?: string | null
	sortDirection?: string | null
}

const MINIMUM_COLUMN_WIDTH = 50

export const CustomColumnHeader: React.FC<Props> = ({
	header,
	selectedColumns,
	setSelectedColumns,
	standardColumns,
	trackingIdPrefix,
	sortColumn,
	sortDirection,
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
			style={
				header.showActions
					? {
							padding: '6px 4px 6px 8px',
						}
					: {}
			}
			ref={headerRef}
			cursor={header.onSort ? 'pointer' : 'default'}
			onClick={() => {
				if (!header.onSort) {
					return
				}

				header.onSort()
			}}
		>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Stack direction="row" gap="6" align="center">
					<Text lines="1">{header.component}</Text>
					{sortColumn === header.id &&
						sortDirection &&
						(sortDirection === SortDirection.Desc ? (
							<IconSolidSortDescending
								size={13}
								style={{ flexShrink: 0 }}
							/>
						) : (
							<IconSolidSortAscending
								size={13}
								style={{ flexShrink: 0 }}
							/>
						))}
				</Stack>

				{header.showActions && (
					<Stack align="center" direction="row" gap="6">
						<CustomColumnActions
							columnId={header.id}
							selectedColumns={selectedColumns}
							setSelectedColumns={setSelectedColumns}
							trackingId={trackingIdPrefix}
							standardColumns={standardColumns}
							onSort={header.onSort}
							sortColumn={sortColumn}
							sortDirection={sortDirection}
						/>
					</Stack>
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
