import {
	Badge,
	Box,
	Heading,
	Stack,
	Tabs,
	Text,
	Tooltip,
} from '@highlight-run/ui'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import clsx from 'clsx'
import moment from 'moment'
import React, { useState } from 'react'

import LoadingBox from '@/components/LoadingBox'
import { useGetTraceQuery } from '@/graph/generated/hooks'
import { Trace, TraceError } from '@/graph/generated/schemas'
import { TraceErrors } from '@/pages/Traces/TraceErrors'
import { TraceLogs } from '@/pages/Traces/TraceLogs'
import { TraceSpanAttributes } from '@/pages/Traces/TraceSpanAttributes'
import {
	getFirstSpan,
	getTraceDuration,
	getTraceDurationString,
	sortTrace,
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

		return sortTrace(sortableTraces)
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
						{traces.map((span) => {
							const width =
								(span.duration / 1000 / totalDuration) * 100
							const diff = moment(span.timestamp)
								.diff(startTime, 'ms')
								.valueOf()
							const marginLeft = (diff / totalDuration) * 100
							const error = data.trace?.errors.find(
								(error) => error.span_id === span.spanID,
							)

							return (
								<Box
									key={span.spanID}
									onClick={() => setSelectedSpan(span)}
									onMouseOver={() => setHoveredSpan(span)}
									onMouseOut={() => setHoveredSpan(undefined)}
									style={{
										marginLeft: `${marginLeft}%`,
										width: `${width}%`,
									}}
								>
									<Tooltip
										trigger={
											<Box
												borderRadius="3"
												p="3"
												py="6"
												mb="2"
												display="flex"
												alignItems="center"
												justifyContent="space-between"
												overflow="hidden"
												width="full"
												cssClass={clsx(styles.span, {
													[styles.selectedSpan]:
														span === selectedSpan,
													[styles.hoveredSpan]:
														span === hoveredSpan,
													[styles.errorSpan]: !!error,
												})}
											>
												<Text size="xSmall" lines="1">
													{span?.spanName}
												</Text>
												<Box flexShrink={0}>
													<Text size="xSmall">
														{getTraceDurationString(
															span.duration /
																1000,
														)}
													</Text>
												</Box>
											</Box>
										}
									>
										{highlightedSpan && (
											<Box
												display="flex"
												gap="6"
												flexDirection="column"
											>
												<Text color="moderate">
													{highlightedSpan.spanName}
												</Text>
												<Text weight="bold">
													{getTraceDurationString(
														highlightedSpan.duration /
															1000,
													)}
												</Text>
											</Box>
										)}
									</Tooltip>
								</Box>
							)
						})}
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
