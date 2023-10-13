import { Badge, Box, Heading, Stack, Tabs, Text } from '@highlight-run/ui'
import moment from 'moment'
import React, { useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { useGetTraceQuery } from '@/graph/generated/hooks'
import { Trace, TraceError } from '@/graph/generated/schemas'
import { TraceErrors } from '@/pages/Traces/TraceErrors'
import { TraceFlameGraph } from '@/pages/Traces/TraceFlameGraph'
import { TraceLogs } from '@/pages/Traces/TraceLogs'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'
import {
	getFirstSpan,
	getTraceDuration,
	getTraceDurationString,
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
	const [selectedSpan, setSelectedSpan] = useState<Trace>()
	const [hoveredSpan, setHoveredSpan] = useState<Trace>()
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

	if (!data?.trace || !data?.trace?.trace?.length) {
		return loading ? (
			<LoadingBox />
		) : (
			<Box>
				<Text>Trace not found</Text>
			</Box>
		)
	}

	const trace = data.trace.trace
	const errors = data.trace.errors
	const totalDuration = getTraceDuration(trace)
	const firstSpan = getFirstSpan(trace)
	const traceName = firstSpan?.spanName
	const startTime = moment(firstSpan.timestamp)
	const durationString = getTraceDurationString(totalDuration)

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
				</Stack>

				<TraceFlameGraph
					trace={trace}
					errors={errors}
					selectedSpan={selectedSpan}
					setHoveredSpan={setHoveredSpan}
					setSelectedSpan={setSelectedSpan}
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
