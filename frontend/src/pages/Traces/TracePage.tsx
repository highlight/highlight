import { Badge, Box, Heading, Stack, Tabs, Text } from '@highlight-run/ui'
import moment from 'moment'
import React, { useMemo, useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { useGetTraceQuery } from '@/graph/generated/hooks'
import { TraceError } from '@/graph/generated/schemas'
import { TraceErrors } from '@/pages/Traces/TraceErrors'
import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { TraceLogs } from '@/pages/Traces/TraceLogs'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'
import {
	FlameGraphSpan,
	getFirstSpan,
	getTraceDurationString,
	getTraceTimes,
} from '@/pages/Traces/utils'
import { useParams } from '@/util/react-router/useParams'

import * as styles from './TracePage.css'

enum TraceTabs {
	Info = 'Info',
	Errors = 'Errors',
	Logs = 'Logs',
}

type Props = {}

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
	const [hoveredSpan, setHoveredSpan] = useState<FlameGraphSpan>()
	const [selectedSpan, setSelectedSpan] = useState<FlameGraphSpan>()
	const highlightedSpan = hoveredSpan || selectedSpan

	const { data, loading } = useGetTraceQuery({
		variables: {
			project_id: projectId!,
			trace_id: traceId!,
		},
		onCompleted: (data) => {
			if (spanId) {
				const selectedSpan = data.trace?.trace.find(
					(span) => span.spanID === spanId,
				)

				if (selectedSpan) {
					setSelectedSpan(selectedSpan as FlameGraphSpan)
				} else {
					const rootSpan = getFirstSpan(data.trace?.trace ?? [])

					if (rootSpan) {
						setSelectedSpan(rootSpan as FlameGraphSpan)
					}
				}
			}
		},
		skip: !projectId || !traceId,
	})

	const { startTime, duration: totalDuration } = useMemo(() => {
		if (!data?.trace) {
			return { startTime: 0, endTime: 0, duration: 0 }
		}

		return getTraceTimes(data.trace.trace)
	}, [data?.trace])

	const firstSpan = useMemo(() => {
		if (!data?.trace) {
			return undefined
		}

		return getFirstSpan(data.trace.trace)
	}, [data?.trace])

	const traceName = useMemo(
		() => (firstSpan ? firstSpan.spanName : ''),
		[firstSpan],
	)

	const errors = useMemo(() => {
		if (!data?.trace?.errors) {
			return [] as TraceError[]
		}

		return data.trace.errors
	}, [data?.trace?.errors])

	const durationString = getTraceDurationString(totalDuration)

	if (!data?.trace || !data?.trace?.trace?.length) {
		return loading ? (
			<LoadingBox />
		) : (
			<Box>
				<Text>Trace not found</Text>
			</Box>
		)
	}

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
							{moment(startTime).format('MMM D HH:mm:ss.SSS')}
						</Text>
						<Text weight="bold">{durationString}</Text>
					</Box>
				</Stack>

				<TraceFlameGraph
					trace={data.trace.trace}
					errors={data.trace.errors}
					hoveredSpan={hoveredSpan}
					selectedSpan={selectedSpan}
					startTime={startTime}
					totalDuration={totalDuration}
					onSpanSelect={setSelectedSpan}
					onSpanMouseEnter={setHoveredSpan}
				/>

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
