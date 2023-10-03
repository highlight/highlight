import { Box, Heading, Stack, Text, Tooltip } from '@highlight-run/ui'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import clsx from 'clsx'
import moment from 'moment'
import React, { useState } from 'react'

import JsonViewer from '@/components/JsonViewer/JsonViewer'
import LoadingBox from '@/components/LoadingBox'
import { useGetTraceQuery } from '@/graph/generated/hooks'
import { Trace } from '@/graph/generated/schemas'
import {
	getFirstSpan,
	getTraceDuration,
	getTraceDurationString,
	sortTrace,
} from '@/pages/Traces/utils'
import { useParams } from '@/util/react-router/useParams'

import * as styles from './TracePage.css'

type Props = {}

const MAX_TICKS = 6

export const TracePage: React.FC<Props> = () => {
	const [selectedSpan, setSelectedSpan] = useState<Trace>()
	const [hoveredSpan, setHoveredSpan] = useState<Trace>()
	const highlightedSpan = hoveredSpan || selectedSpan

	const { project_id: projectId, trace_id: traceId } = useParams<{
		project_id: string
		trace_id: string
	}>()

	const { data, loading } = useGetTraceQuery({
		variables: {
			project_id: projectId!,
			trace_id: traceId!,
		},
		skip: !projectId || !traceId,
	})

	const traces = React.useMemo(() => {
		if (!data?.trace) return []
		const sortableTraces = [...data.trace]

		if (!selectedSpan) {
			const firstSpan = getFirstSpan(sortableTraces)
			setSelectedSpan(firstSpan)
		}

		return sortTrace(sortableTraces)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.trace])

	if (!data?.trace || !data?.trace?.length) {
		return loading ? (
			<LoadingBox />
		) : (
			<Box>
				<Text>Trace not found</Text>
			</Box>
		)
	}

	const totalDuration = getTraceDuration(data.trace)
	const firstSpan = getFirstSpan(data.trace)
	const traceName = firstSpan?.spanName
	const startTime = moment(firstSpan.timestamp)
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
												p="4"
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

				{highlightedSpan && (
					<Box mt="10">
						<SpanAttributes span={highlightedSpan} />
					</Box>
				)}
			</Box>
		</Box>
	)
}

const SpanAttributes: React.FC<{ span: Trace }> = ({ span }) => {
	const attributes = { ...span }

	// Drop any attributes we don't want to display
	delete attributes.__typename

	return <JsonViewer src={attributes} collapsed={false} />
}
