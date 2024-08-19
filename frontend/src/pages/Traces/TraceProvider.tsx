import { ApolloError } from '@apollo/client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { useGetTraceQuery } from '@/graph/generated/hooks'
import { TraceError } from '@/graph/generated/schemas'
import {
	FlameGraphSpan,
	getFirstSpan,
	getTraceDurationString,
	getTraceTimes,
	organizeSpansForFlameGraph,
	organizeSpansWithChildren,
	traceSortFn,
} from '@/pages/Traces/utils'

type TraceContext = {
	traceName: string
	durationString: string
	startTime: number
	endTime: number
	totalDuration: number
	errors: TraceError[]
	hoveredSpan: FlameGraphSpan | undefined
	selectedSpan: FlameGraphSpan | undefined
	highlightedSpan: FlameGraphSpan | undefined
	loading: boolean
	traces: FlameGraphSpan[][]
	spans: FlameGraphSpan[]
	error?: ApolloError
	traceId?: string
	secureSessionId?: string
	setHoveredSpan: (span?: FlameGraphSpan) => void
	setSelectedSpan: (span?: FlameGraphSpan) => void
}

export const TraceContext = createContext<TraceContext>({} as TraceContext)

type Props = {
	projectId: string
	traceId?: string
	timestamp?: string
	secureSessionId?: string
	spanId?: string
}

export const TraceProvider: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	projectId,
	traceId,
	timestamp,
	secureSessionId,
	spanId,
}) => {
	const [hoveredSpan, setHoveredSpan] = useState<FlameGraphSpan>()
	const [selectedSpan, setSelectedSpan] = useState<FlameGraphSpan>()
	const highlightedSpan = hoveredSpan || selectedSpan

	const { data, error, loading } = useGetTraceQuery({
		variables: {
			project_id: projectId!,
			trace_id: traceId!,
			timestamp: timestamp!,
			session_secure_id: secureSessionId,
		},
		onCompleted: (data) => {
			if (spanId) {
				const selectedSpan = data.trace?.trace.find(
					(span) => span.spanID === spanId,
				)

				if (selectedSpan) {
					setSelectedSpan(selectedSpan as FlameGraphSpan)
				}
			}
		},
		skip: !projectId || !traceId || !timestamp,
		fetchPolicy: 'cache-and-network',
	})

	const {
		startTime,
		endTime,
		duration: totalDuration,
	} = useMemo(() => {
		if (!data?.trace) {
			return { startTime: 0, duration: 0, endTime: 0 }
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

	const traces = useMemo(() => {
		if (!data?.trace?.trace) return []
		const sortableTraces = [...data.trace.trace]
		const firstSpan = getFirstSpan(sortableTraces)
		const isNewTrace = selectedSpan?.traceID !== firstSpan?.traceID

		if (isNewTrace) {
			setSelectedSpan(firstSpan as FlameGraphSpan)
		}

		return organizeSpansForFlameGraph(sortableTraces)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data?.trace?.trace])

	const spans = useMemo(() => {
		if (!data?.trace?.trace) {
			return []
		}

		const spans = [...data.trace.trace].sort(traceSortFn)
		return organizeSpansWithChildren(spans)
	}, [data?.trace?.trace])

	useEffect(() => {
		if (spanId) {
			const selectedSpan = data?.trace?.trace.find(
				(span) => span.spanID === spanId,
			)

			if (selectedSpan) {
				setSelectedSpan(selectedSpan as FlameGraphSpan)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [spanId])

	return (
		<TraceContext.Provider
			value={{
				traceName,
				durationString,
				startTime,
				endTime,
				totalDuration,
				errors,
				hoveredSpan,
				selectedSpan,
				highlightedSpan,
				loading,
				traceId,
				traces,
				spans,
				error,
				secureSessionId: firstSpan?.secureSessionID,
				setHoveredSpan,
				setSelectedSpan,
			}}
		>
			{children}
		</TraceContext.Provider>
	)
}

export const useTrace = () => useContext(TraceContext)
