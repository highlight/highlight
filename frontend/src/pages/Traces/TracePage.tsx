import { Box, Heading, Stack, Text, Tooltip } from '@highlight-run/ui'
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

				<Box py="10" borderBottom="dividerWeak">
					{traces.map((span) => {
						const width =
							(span.duration / 1000 / totalDuration) * 100
						const diff = moment(span.timestamp)
							.diff(startTime, 'ms')
							.valueOf()
						const marginLeft = (diff / totalDuration) * 100

						return (
							<Tooltip
								key={span.spanID}
								trigger={
									<Box
										borderRadius="4"
										p="4"
										py="6"
										mb="2"
										display="flex"
										alignItems="center"
										justifyContent="space-between"
										style={{
											marginLeft,
											width: `${width}%`,
										}}
										cssClass={clsx(styles.span, {
											[styles.selectedSpan]:
												span === selectedSpan,
											[styles.hoveredSpan]:
												span === hoveredSpan,
										})}
										onClick={() => setSelectedSpan(span)}
										onMouseOver={() => setHoveredSpan(span)}
										onMouseOut={() =>
											setHoveredSpan(undefined)
										}
									>
										<>
											<Text size="xSmall" lines="1">
												{span?.spanName}
											</Text>
											<Box flexShrink={0}>
												<Text size="xSmall">
													{getTraceDurationString(
														span.duration / 1000,
													)}
												</Text>
											</Box>
										</>
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
												highlightedSpan.duration / 1000,
											)}
										</Text>
									</Box>
								)}
							</Tooltip>
						)
					})}
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
