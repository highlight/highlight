import {
	Box,
	Form,
	IconSolidCheveronDown,
	IconSolidCheveronRight,
	IconSolidSearch,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import { useMemo, useRef, useState } from 'react'

import { getSpanTheme } from '@/pages/Traces/TraceFlameGraphNode'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { FlameGraphSpan, getTraceDurationString } from '@/pages/Traces/utils'

export const TraceWaterfallList: React.FC = () => {
	const { spans, totalDuration } = useTrace()
	const scrollableRef = useRef<HTMLTableSectionElement>(null)
	const [query, setQuery] = useState('')

	const filteredSpans = useMemo(
		() => spans.sort((a, b) => a.startTime - b.startTime),
		[spans],
	)

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
			<Box style={{ height: 300, overflowY: 'auto' }}>
				<Box ref={scrollableRef}>
					{filteredSpans.map((span) => (
						<WaterfallRow
							key={span.spanID}
							depth={0}
							span={span}
							totalDuration={totalDuration}
							query={query}
						/>
					))}
				</Box>
			</Box>
		</Box>
	)
}

const WaterfallRow: React.FC<{
	depth: number
	span: FlameGraphSpan
	totalDuration: number
	query: string
}> = ({ depth, span, totalDuration, query }) => {
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
					br="dividerWeak"
					position="relative"
					align="center"
					direction="row"
					gap="2"
					pl="16"
					cursor="pointer"
					onClick={() => setOpen(!open)}
					style={{ width: 250 - depth * 13 }}
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
					<Text color="strong">{span.spanName} </Text>
					{span.serviceName && (
						<Text weight="bold" size="xSmall">
							({span.serviceName})
						</Text>
					)}
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
