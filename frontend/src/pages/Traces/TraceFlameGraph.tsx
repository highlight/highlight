import { Box, Text } from '@highlight-run/ui'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import React from 'react'
import { FlameGraph } from 'react-flame-graph'

import { Trace, TraceError } from '@/graph/generated/schemas'
import {
	getFirstSpan,
	getTraceDuration,
	getTraceDurationString,
	organizeSpans,
} from '@/pages/Traces/utils'

type Props = {
	errors: TraceError[]
	trace: Trace[]
	selectedSpan: Trace | undefined
	setHoveredSpan: (span?: Trace) => void
	setSelectedSpan: (span?: Trace) => void
}

const MAX_TICKS = 6

export const TraceFlameGraph: React.FC<Props> = ({
	errors,
	trace,
	selectedSpan,
	setHoveredSpan,
	setSelectedSpan,
}) => {
	console.log('::: selectedSpan', selectedSpan?.spanID)
	const organizedSpans = React.useMemo(() => {
		const sortableTraces = [...trace]

		if (!selectedSpan) {
			const firstSpan = getFirstSpan(sortableTraces)
			setSelectedSpan(firstSpan)
		}

		return organizeSpans(sortableTraces, errors, selectedSpan)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trace, selectedSpan?.spanID])

	const totalDuration = getTraceDuration(trace)

	const ticks = Array.from({ length: MAX_TICKS }).map((_, index) => {
		const percent = index / (MAX_TICKS - 1)
		const tickDuration = totalDuration * percent
		const time = getTraceDurationString(tickDuration)

		return {
			time: time.trim() === '' ? '0ms' : time,
			percent,
		}
	})

	return (
		<Box>
			<Box backgroundColor="raised" borderRadius="6" border="dividerWeak">
				<Box
					borderBottom="dividerWeak"
					pt="6"
					px="4"
					display="flex"
					alignItems="center"
					flexDirection="row"
					justifyContent="space-between"
					style={{
						height: 21,
					}}
				>
					{ticks.map((tick) => (
						<Box key={tick.time} position="relative" pb="8">
							<Text color="weak" size="xxSmall">
								{tick.time ?? '0ms'}
							</Text>
							<Box
								backgroundColor="weak"
								position="absolute"
								style={{
									backgroundColor:
										themeVars.static.divider.weak,
									bottom: 0,
									height: 6,
									left:
										tick.percent === 0
											? 0
											: tick.percent < 1
											? '50%'
											: '100%',
									width: 1,
								}}
							/>
						</Box>
					))}
				</Box>

				<Box p="4">
					{/* TODO: Consider using https://github.com/pyatyispyatil/flame-chart-js
					instead of this React lib which isn't maintained anymore - it says
					they have support for react, so seems worth a shot */}
					<FlameGraph
						data={organizedSpans}
						// TODO: Make height dynamic
						height={300}
						// TODO: Use autosizer
						width={654}
						onChange={(data: { source: Trace }) => {
							setSelectedSpan(data.source)
						}}
						onMouseOver={(_: any, span: Trace) => {
							setHoveredSpan(span)
						}}
					/>
				</Box>
			</Box>
		</Box>
	)
}
