import { Badge, Box, Heading, Stack, Tabs, Text } from '@highlight-run/ui'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import moment from 'moment'
import React, { useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { useGetTraceQuery } from '@/graph/generated/hooks'
import { Trace, TraceError } from '@/graph/generated/schemas'
import { TraceErrors } from '@/pages/Traces/TraceErrors'
import { TraceFlameGraphNode } from '@/pages/Traces/TraceFlameGraphNode'
import { TraceLogs } from '@/pages/Traces/TraceLogs'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'
import {
	getFirstSpan,
	getTraceDuration,
	getTraceDurationString,
	organizeSpans,
} from '@/pages/Traces/utils'
import { useParams } from '@/util/react-router/useParams'

import * as styles from './TracePage.css'

enum TraceTabs {
	Info = 'Info',
	Errors = 'Errors',
	Logs = 'Logs',
}

type Props = {}

const MAX_TICKS = 6

export const TracePage: React.FC<Props> = () => {
	const {
		project_id: projectId,
		trace_id: traceId,
		span_id: spanId,
	} = useParams<{
		project_id: string
		trace_id: string
		span_id?: string
	}>()
	const [activeTab, setActiveTab] = useState<TraceTabs>(TraceTabs.Info)
	const [selectedSpan, setSelectedSpan] = useState<Trace>()
	const [hoveredSpan, setHoveredSpan] = useState<Trace>()
	const [zoom, setZoom] = useState(100)
	const highlightedSpan = hoveredSpan || selectedSpan

	const { data, loading } = useGetTraceQuery({
		variables: {
			project_id: projectId!,
			trace_id: traceId!,
		},
		onCompleted: (data) => {
			if (spanId) {
				const span = data.trace?.trace.find(
					(span) => span.spanID === spanId,
				)
				if (span) {
					setSelectedSpan(span)
				}
			}
		},
		skip: !projectId || !traceId,
	})

	const traces = React.useMemo(() => {
		if (!data?.trace?.trace) return []
		const sortableTraces = [...data.trace.trace]

		if (!selectedSpan) {
			const firstSpan = getFirstSpan(sortableTraces)
			setSelectedSpan(firstSpan)
		}

		return organizeSpans(sortableTraces)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.trace])

	if (!data?.trace || !data?.trace?.trace?.length) {
		return loading ? (
			<LoadingBox />
		) : (
			<Box>
				<Text>Trace not found</Text>
			</Box>
		)
	}

	const totalDuration = getTraceDuration(data.trace.trace)
	const firstSpan = getFirstSpan(data.trace.trace)
	const traceName = firstSpan?.spanName
	const startTime = moment(firstSpan.timestamp)
	const errors = data.trace?.errors
	const durationString = getTraceDurationString(totalDuration)
	const ticks = Array.from({ length: MAX_TICKS }).map((_, index) => {
		const percent = index / (MAX_TICKS - 1)
		const tickDuration = totalDuration * percent
		const time = getTraceDurationString(tickDuration)

		return {
			time: time.trim() === '' ? '0ms' : time,
			percent,
		}
	})
	console.log('::: traces', traces)

	return (
		<Box overflow="scroll">
			<Box cssClass={styles.container}>
				<Stack direction="column" gap="16" mb="12" mt="8">
					<Heading>{traceName}</Heading>
					<Box
						display="flex"
						alignItems="center"
						flexDirection="row"
						gap="8"
					>
						<Text color="moderate">
							{startTime.format('MMM D HH:mm:ss.SSS')}
						</Text>
						<Text weight="bold">{durationString}</Text>
					</Box>

					<button onClick={() => setZoom(zoom - 10)}>Zoom In</button>
					<button onClick={() => setZoom(zoom + 10)}>Zoom Out</button>
				</Stack>

				<Box
					backgroundColor="raised"
					borderRadius="6"
					border="dividerWeak"
				>
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
					<Box
						p="6"
						style={{
							maxHeight: 300,
							overflowY: 'scroll',
						}}
					>
						<svg
							viewBox={`0 0 ${zoom} ${zoom}`}
							xmlns="http://www.w3.org/2000/svg"
							height="100%"
							width="100%"
						>
							{traces.map((span, index) => {
								return (
									<TraceFlameGraphNode
										key={index}
										errors={errors}
										span={span}
										totalDuration={totalDuration}
										startTime={startTime}
										depth={0}
									/>
								)
							})}
						</svg>
					</Box>
				</Box>

				<Box mt="12">
					<Tabs<TraceTabs>
						tab={activeTab}
						setTab={(tab) => setActiveTab(tab)}
						containerClass={styles.tabs}
						tabsContainerClass={styles.tabsContainer}
						pageContainerClass={styles.tabsPageContainer}
						pages={{
							[TraceTabs.Info]: {
								page: (
									<TraceSpanAttributes
										span={highlightedSpan!}
									/>
								),
							},
							[TraceTabs.Errors]: {
								badge:
									errors?.length > 0 ? (
										<Badge
											variant="gray"
											label={String(errors.length)}
										/>
									) : undefined,
								page: (
									<TraceErrors
										errors={(errors ?? []) as TraceError[]}
									/>
								),
							},
							[TraceTabs.Logs]: {
								page: <TraceLogs />,
							},
						}}
						noHandle
					/>
				</Box>
			</Box>
		</Box>
	)
}
