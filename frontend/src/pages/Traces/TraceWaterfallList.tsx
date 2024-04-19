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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getSpanTheme } from '@/pages/Traces/TraceFlameGraphNode'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { FlameGraphSpan, getTraceDurationString } from '@/pages/Traces/utils'

const gridColumns = ['1fr', '1fr', '3fr']

export const TraceWaterfallList: React.FC = () => {
	const [attributesWidth, setAttributesWidth] = useState(250)
	const [dragging, setDragging] = useState(false)
	const { selectedSpan, spans, totalDuration, setSelectedSpan } = useTrace()
	const scrollableRef = useRef<HTMLTableSectionElement>(null)
	const [query, setQuery] = useState('')

	const filteredSpans = useMemo(
		() => [...spans].sort((a, b) => a.startTime - b.startTime),
		[spans],
	)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragging) {
				return
			}

			const scrollableRect =
				scrollableRef.current!.getBoundingClientRect()

			// width is distance between left edge of scrollableRef and mouse position
			const newWidth = Math.max(
				Math.min(
					scrollableRect.width - 200,
					e.clientX - scrollableRect.left,
				),
				100,
			)

			setAttributesWidth(newWidth)
		},
		[dragging, setAttributesWidth],
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
						<Table.Header>Span name</Table.Header>
						<Table.Header>Duration</Table.Header>
						<Table.Header>Waterfall</Table.Header>
					</Table.Row>
				</Table.Head>
				<Table.Body overflowY="auto" style={{ height: 280 }}>
					{filteredSpans.map((span) => (
						<WaterfallRow
							key={span.spanID}
							attributesWidth={attributesWidth}
							depth={0}
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
	attributesWidth: number
	depth: number
	selectedSpan: FlameGraphSpan | undefined
	span: FlameGraphSpan
	totalDuration: number
	query: string
	setSelectedSpan: (span: FlameGraphSpan | undefined) => void
}> = ({
	attributesWidth,
	depth,
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
					onClick={(e) => {
						e.stopPropagation()
						setOpen(!open)
					}}
					style={{ paddingLeft: depth * 16 + 8 }}
				>
					{hasChildren &&
						(open ? (
							<IconSolidCheveronDown size={12} />
						) : (
							<IconSolidCheveronRight size={12} />
						))}

					<Text
						color="strong"
						lines="1"
						weight={isSelected ? 'bold' : 'regular'}
					>
						{span.spanName}{' '}
						{span.serviceName && `(${span.serviceName})`}
					</Text>
				</Table.Cell>
				<Table.Cell>
					<Text
						lines="1"
						size="xSmall"
						weight={isSelected ? 'bold' : 'regular'}
					>
						{getTraceDurationString(span.duration)}
					</Text>
				</Table.Cell>
				<Table.Cell py="4">
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
							attributesWidth={attributesWidth}
							depth={depth + 1}
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
