import {
	Box,
	Form,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidSearch,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import { useMemo, useState } from 'react'

import { getSpanTheme } from '@/pages/Traces/TraceFlameGraphNode'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { FlameGraphSpan, getTraceDurationString } from '@/pages/Traces/utils'

const MINIMUM_COLUMN_WIDTH = 50

const img = new Image()
img.src =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

export const TraceWaterfallList: React.FC = () => {
	const { selectedSpan, spans, totalDuration, setSelectedSpan } = useTrace()
	const [query, setQuery] = useState('')
	const [columns, setColumns] = useState([
		{ name: 'Span name', size: '1fr' },
		{ name: 'Duration', size: '85px' },
		{ name: 'Waterfall', size: '3fr' },
	])
	const gridColumns = columns.map((c) => c.size)

	const filteredSpans = useMemo(
		() => [...spans].sort((a, b) => a.startTime - b.startTime),
		[spans],
	)

	const handleDrag = (e: React.DragEvent, name: string) => {
		const headerRef = e.currentTarget.parentElement?.parentElement
		const leftElementCoord = headerRef?.getBoundingClientRect()
		const rightElementCoord =
			headerRef?.nextElementSibling?.getBoundingClientRect()

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

			const columnIndex = columns.findIndex((c) => c.name === name)
			if (columnIndex < columns.length - 1) {
				const newColumns = [...columns]
				newColumns[columnIndex] = {
					...newColumns[columnIndex],
					size: `${leftElementNewWidth}px`,
				}
				newColumns[columnIndex + 1] = {
					...newColumns[columnIndex + 1],
					size: `${rightElementNewWidth}px`,
				}

				setColumns(newColumns)
			}
		}
	}

	return (
		<Box border="dividerWeak" borderRadius="4">
			<Form>
				<Stack
					align="center"
					direction="row"
					gap="8"
					px="8"
					bb="dividerWeak"
				>
					<IconSolidSearch />
					<Form.Input
						placeholder="Search"
						name="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						outline={false}
						style={{
							background: 'transparent',
							padding: '4px 0',
						}}
					/>
				</Stack>
			</Form>

			<Table noBorder>
				<Table.Head>
					<Table.Row gridColumns={gridColumns}>
						<Table.Header>
							<Text>Span name</Text>
							<DragHandle name="Span name" onDrag={handleDrag} />
						</Table.Header>
						<Table.Header>
							<Text>Duration</Text>
							<DragHandle name="Duration" onDrag={handleDrag} />
						</Table.Header>
						<Table.Header>
							<Text>Waterfall</Text>
						</Table.Header>
					</Table.Row>
				</Table.Head>
				<Table.Body overflowY="auto" style={{ height: 280 }}>
					{filteredSpans.map((span) => (
						<WaterfallRow
							key={span.spanID}
							depth={0}
							gridColumns={gridColumns}
							selectedSpan={selectedSpan}
							span={span}
							totalDuration={totalDuration}
							query={query}
							setSelectedSpan={setSelectedSpan}
						/>
					))}
				</Table.Body>
			</Table>
		</Box>
	)
}

const WaterfallRow: React.FC<{
	depth: number
	gridColumns: string[]
	selectedSpan: FlameGraphSpan | undefined
	span: FlameGraphSpan
	totalDuration: number
	query: string
	setSelectedSpan: (span: FlameGraphSpan | undefined) => void
}> = ({
	depth,
	gridColumns,
	selectedSpan,
	span,
	totalDuration,
	query,
	setSelectedSpan,
}) => {
	const spanTheme = getSpanTheme(span)
	const [open, setOpen] = useState(true)
	const hasChildren = span.children && span.children.length > 0
	const isSelected = selectedSpan?.spanID === span.spanID

	const matchQuery = useMemo(
		() => doesSpanOrDescendantsMatchQuery(span, query),
		[span, query],
	)

	if (!matchQuery) {
		return null
	}

	return (
		<>
			<Table.Row
				gridColumns={gridColumns}
				cursor="pointer"
				onClick={() => setSelectedSpan(span)}
			>
				<Table.Cell
					borderRadius="0"
					onClick={(e) => {
						e.stopPropagation()

						if (hasChildren) {
							setOpen(!open)
						} else {
							setSelectedSpan(span)
						}
					}}
					style={{ paddingLeft: depth * 16 + 8 }}
				>
					{hasChildren && (
						<Box display="flex" flexShrink={0}>
							{open ? (
								<IconSolidCheveronDown size={12} />
							) : (
								<IconSolidCheveronRight size={12} />
							)}
						</Box>
					)}

					<Text
						color="strong"
						lines="1"
						weight={isSelected ? 'bold' : 'regular'}
						title={`${span.spanName}${
							span.serviceName ? ` (${span.serviceName})` : ''
						}`}
					>
						{span.spanName}{' '}
						{span.serviceName && `(${span.serviceName})`}
					</Text>
				</Table.Cell>
				<Table.Cell br="dividerWeak" borderRadius="0">
					<Text
						lines="1"
						size="xSmall"
						weight={isSelected ? 'bold' : 'regular'}
					>
						{getTraceDurationString(span.duration)}
					</Text>
				</Table.Cell>
				<Table.Cell py="4" borderRadius="0">
					<Box
						borderRadius="4"
						p="2"
						style={{
							height: 16,
							marginLeft: `${
								(span.startTime / totalDuration) * 100
							}%`,
							width: `${Math.min(
								Math.max(
									(span.duration / totalDuration) * 100,
									1,
								),
								100,
							)}%`,
							backgroundColor: isSelected
								? spanTheme.selectedBackground
								: spanTheme.background,
						}}
					/>
				</Table.Cell>
			</Table.Row>

			{hasChildren && open && (
				<>
					{span.children?.map((childSpan, index) => (
						<WaterfallRow
							key={index}
							depth={depth + 1}
							gridColumns={gridColumns}
							selectedSpan={selectedSpan}
							span={childSpan}
							totalDuration={totalDuration}
							query={query}
							setSelectedSpan={setSelectedSpan}
						/>
					))}
				</>
			)}
		</>
	)
}

const doesSpanOrDescendantsMatchQuery = (
	span: FlameGraphSpan,
	query: string,
): boolean => {
	const checkSpan = (span: FlameGraphSpan): boolean => {
		if (span.spanName.toLowerCase().includes(query.toLowerCase())) {
			return true
		}

		if (span.children) {
			return span.children.some(checkSpan)
		}

		return false
	}

	return checkSpan(span)
}

const DragHandle: React.FC<{
	name: string
	onDrag: (e: React.DragEvent, name: string) => void
}> = ({ onDrag }) => {
	return (
		<Box
			draggable
			onDrag={(e) => onDrag(e, 'Duration')}
			onDragStart={(e) => {
				e.dataTransfer.setDragImage(img, 0, 0) // hide ghost image
			}}
			style={{
				position: 'absolute',
				top: 0,
				bottom: 0,
				right: 0,
				width: 3,
				cursor: 'col-resize',
			}}
		/>
	)
}
