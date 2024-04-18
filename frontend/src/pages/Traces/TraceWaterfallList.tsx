import {
	Box,
	Form,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidSearch,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getSpanTheme } from '@/pages/Traces/TraceFlameGraphNode'
import { useTrace } from '@/pages/Traces/TraceProvider'
import * as styles from '@/pages/Traces/TraceWaterfallList.css'
import { FlameGraphSpan, getTraceDurationString } from '@/pages/Traces/utils'

export const TraceWaterfallList: React.FC = () => {
	const [attributesWidth, setAttributesWidth] = useState(250)
	const [dragging, setDragging] = useState(false)
	const dragHandleRef = useRef<HTMLDivElement>(null)
	const { spans, totalDuration } = useTrace()
	const scrollableRef = useRef<HTMLTableSectionElement>(null)
	const [query, setQuery] = useState('')

	const filteredSpans = useMemo(
		() => spans.sort((a, b) => a.startTime - b.startTime),
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
			{/* TODO: Make height dynamic */}
			<Box
				position="relative"
				overflowY="auto"
				ref={scrollableRef}
				style={{ height: 300 }}
			>
				<Box
					br="dividerWeak"
					ref={dragHandleRef}
					cssClass={styles.dragHandle}
					onMouseDown={(e) => {
						e.preventDefault()
						setDragging(true)
					}}
					style={{ left: attributesWidth + 1 }}
				/>

				{filteredSpans.map((span) => (
					<WaterfallRow
						key={span.spanID}
						attributesWidth={attributesWidth}
						depth={0}
						span={span}
						totalDuration={totalDuration}
						query={query}
					/>
				))}
			</Box>
		</Box>
	)
}

const WaterfallRow: React.FC<{
	attributesWidth: number
	depth: number
	span: FlameGraphSpan
	totalDuration: number
	query: string
}> = ({ attributesWidth, depth, span, totalDuration, query }) => {
	const spanTheme = getSpanTheme(span)
	const [open, setOpen] = useState(true)
	const hasChildren = span.children && span.children.length > 0

	const matchQuery = useMemo(
		() => doesSpanOrDescendantsMatchQuery(span, query),
		[span, query],
	)

	if (!matchQuery) {
		return null
	}

	return (
		<>
			<Stack direction="row" gap="4" align="center" px="8">
				<Stack
					py="8"
					position="relative"
					align="center"
					direction="row"
					gap="2"
					pl="16"
					cursor="pointer"
					onClick={() => setOpen(!open)}
					style={{ width: attributesWidth - depth * 13 }}
				>
					<Box
						style={{
							position: 'absolute',
							left: -2,
							top: 3,
						}}
					>
						{hasChildren &&
							(open ? (
								<IconSolidCheveronDown />
							) : (
								<IconSolidCheveronRight />
							))}
					</Box>
					<Text color="strong" lines="1">
						{span.spanName}{' '}
						{span.serviceName && `(${span.serviceName})`}
					</Text>
				</Stack>
				<Stack flexGrow={1} gap="6" align="center" direction="row">
					<Box
						borderRadius="4"
						style={{
							height: 10,
							marginLeft: `${
								(span.startTime / totalDuration) * 100
							}%`,
							width: `${Math.min(
								(span.duration / totalDuration) * 100,
								100,
							)}%`,
							backgroundColor: spanTheme.selectedBackground,
						}}
					/>

					<Text size="xSmall">
						{getTraceDurationString(span.duration)}
					</Text>
				</Stack>
			</Stack>

			{hasChildren && open && (
				<Box
					style={{
						borderLeft: `1px solid ${spanTheme.border}`,
						marginLeft: 12,
					}}
				>
					{span.children?.map((childSpan, index) => (
						<WaterfallRow
							key={index}
							attributesWidth={attributesWidth}
							depth={depth + 1}
							span={childSpan}
							totalDuration={totalDuration}
							query={query}
						/>
					))}
				</Box>
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
