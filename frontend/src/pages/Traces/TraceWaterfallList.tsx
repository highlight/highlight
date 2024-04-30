import {
	Box,
	ButtonIcon,
	Form,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidSearch,
	IconSolidXCircle,
	Stack,
	Table,
	Text,
} from '@highlight-run/ui/components'
import useLocalStorage from '@rehooks/local-storage'
import { useMemo, useState } from 'react'

import { getSpanTheme } from '@/pages/Traces/TraceFlameGraphNode'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { FlameGraphSpan, getTraceDurationString } from '@/pages/Traces/utils'

import * as styles from './TraceWaterfallList.css'

const MINIMUM_COLUMN_WIDTH = 50
const ROW_HEIGHT = 28

const img = new Image()
img.src =
	'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

export const TraceWaterfallList: React.FC = () => {
	const { selectedSpan, spans, totalDuration, setSelectedSpan } = useTrace()
	const [query, setQuery] = useState('')
	const [columns, setColumns] = useLocalStorage(
		'highlight-trace-waterfall-list-column-sizes',
		[
			{ name: 'Span name', size: '175px' },
			{ name: 'Duration', size: '85px' },
			{ name: 'Waterfall', size: '1fr' },
		],
	)
	const gridColumns = columns.map((c) => c.size)
	const canRenderSpans = useMemo(
		() =>
			spans.some((span) => doesSpanOrDescendantsMatchQuery(span, query)),
		[spans, query],
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

				// Always make the last column take up the remaining space
				newColumns[2].size = '1fr'

				setColumns(newColumns)
			}
		}
	}

	return (
		<Box border="dividerWeak" borderRadius="6" overflow="hidden">
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
						placeholder="Search span names"
						name="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						outline={false}
						style={{
							background: 'transparent',
							flexGrow: 1,
							padding: '6px 0',
						}}
					/>
					{query && (
						<ButtonIcon
							kind="secondary"
							emphasis="low"
							size="xSmall"
							icon={<IconSolidXCircle />}
							onClick={() => setQuery('')}
						/>
					)}
				</Stack>
			</Form>

			<Table noBorder>
				<Table.Head>
					<Table.Row gridColumns={gridColumns}>
						<Table.Header>
							<Text lines="1">Span name</Text>
							<DragHandle name="Span name" onDrag={handleDrag} />
						</Table.Header>
						<Table.Header>
							<Text lines="1">Duration</Text>
							<DragHandle name="Duration" onDrag={handleDrag} />
						</Table.Header>
						<Table.Header>
							<Text lines="1">Waterfall</Text>
						</Table.Header>
					</Table.Row>
				</Table.Head>
				<Table.Body overflowY="auto" style={{ maxHeight: 280 }}>
					{canRenderSpans ? (
						spans.map((span) => (
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
						))
					) : (
						<Stack
							justifyContent="center"
							alignItems="center"
							style={{ height: ROW_HEIGHT }}
						>
							<Text>No spans match search query</Text>
						</Stack>
					)}
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
				selected={isSelected}
			>
				<Table.Cell
					borderRadius="0"
					style={{
						height: ROW_HEIGHT, // to avoid extra height from icon
						padding: `0 0 0 ${depth * 16 + 8}px`,
					}}
				>
					{hasChildren && (
						<ButtonIcon
							size="xSmall"
							emphasis="low"
							kind="secondary"
							onClick={(e) => {
								e.stopPropagation()

								if (hasChildren) {
									setOpen(!open)
								} else {
									setSelectedSpan(span)
								}
							}}
							icon={
								open ? (
									<IconSolidCheveronDown size={12} />
								) : (
									<IconSolidCheveronRight size={12} />
								)
							}
							style={{
								display: 'flex',
								flexShrink: 0,
							}}
						/>
					)}

					<Text
						color="strong"
						lines="1"
						title={`${span.spanName}${
							span.serviceName ? ` (${span.serviceName})` : ''
						}`}
					>
						<SpanName spanName={span.spanName} query={query} />{' '}
						{span.serviceName && `(${span.serviceName})`}
					</Text>
				</Table.Cell>
				<Table.Cell br="dividerWeak" borderRadius="0">
					<Text lines="1" size="xSmall">
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
							backgroundColor: spanTheme.selectedBackground,
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

const SpanName: React.FC<{ spanName: string; query: string }> = ({
	spanName,
	query,
}) => {
	if (!query) {
		return <>{spanName}</>
	}

	const lowerCaseSpanName = spanName.toLowerCase()
	const lowerCaseQuery = query.toLowerCase()

	const startIndex = lowerCaseSpanName.indexOf(lowerCaseQuery)
	if (startIndex === -1) {
		return <>{spanName}</>
	}

	const endIndex = startIndex + query.length
	const beforeMatch = spanName.slice(0, startIndex)
	const match = spanName.slice(startIndex, endIndex)
	const afterMatch = spanName.slice(endIndex)

	return (
		<>
			{beforeMatch}
			<b>{match}</b>
			{afterMatch}
		</>
	)
}

const DragHandle: React.FC<{
	name: string
	onDrag: (e: React.DragEvent, name: string) => void
}> = ({ name, onDrag }) => {
	return (
		<Box
			cssClass={styles.dragHandle}
			draggable
			onDrag={(e) => onDrag(e, name)}
			onDragStart={(e) => {
				e.dataTransfer.setDragImage(img, 0, 0) // hide ghost image
			}}
		/>
	)
}
