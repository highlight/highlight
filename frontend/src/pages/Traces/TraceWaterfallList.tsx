import { Box, Form, IconSolidSearch, Stack } from '@highlight-run/ui/components'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState } from 'react'

import { getSpanTheme } from '@/pages/Traces/TraceFlameGraphNode'
import { useTrace } from '@/pages/Traces/TraceProvider'
import { getTraceDurationString } from '@/pages/Traces/utils'

type Props = {}

export const TraceWaterfallList: React.FC<Props> = () => {
	const { spans, totalDuration } = useTrace()
	const scrollableRef = useRef<HTMLTableSectionElement>(null)
	const [query, setQuery] = useState('')

	const filteredSpans = useMemo(
		() =>
			[...spans]
				.sort((a, b) => a.startTime - b.startTime)
				.filter((span) =>
					span.spanName.toLowerCase().includes(query.toLowerCase()),
				),
		[query, spans],
	)

	const rowVirtualizer = useVirtualizer({
		count: filteredSpans.length,
		estimateSize: () => 22,
		getScrollElement: () => scrollableRef.current,
		overscan: 50,
	})
	const virtualRows = rowVirtualizer.getVirtualItems()

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
				<Box
					ref={scrollableRef}
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					{virtualRows.map((row) => {
						const span = filteredSpans[row.index]
						const spanTheme = getSpanTheme(span)
						console.log(
							span.duration,
							totalDuration,
							`${span.duration / totalDuration}%`,
						)

						return (
							<Stack
								direction="row"
								gap="4"
								align="center"
								p="8"
								key={row.key}
								style={{
									position: 'absolute',
									top: 0,
									left: 0,
									width: '100%',
									height: `${row.size}px`,
									transform: `translateY(${row.start}px)`,
								}}
							>
								<Box style={{ width: 100 }}>
									{span.spanName}
								</Box>
								<Box style={{ width: 100 }}>
									{getTraceDurationString(span.duration)}
								</Box>
								<Box flexGrow={1}>
									<Box
										style={{
											display: 'block',
											height: 10,
											width: `${Math.min(
												(span.duration /
													totalDuration) *
													100,
												100,
											)}%`,
											backgroundColor:
												spanTheme.selectedBackground,
										}}
									/>
								</Box>
							</Stack>
						)
					})}
				</Box>
			</Box>
		</Box>
	)
}
