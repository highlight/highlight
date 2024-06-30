import { useGetTimelineIndicatorEventsQuery } from '@graph/hooks'
import { Session, TimelineIndicatorEvent } from '@graph/schemas'
import { LoadingError } from '@pages/Player/ResourcesContext/ResourcesContext'
import { indexedDBFetch } from '@util/db'
import { checkResourceLimit } from '@util/preload'
import { H } from 'highlight.run'
import { useEffect, useState } from 'react'

interface TimelineIndicatorsContext {
	timelineIndicatorsLoading: boolean
	timelineIndicatorEvents: Pick<
		TimelineIndicatorEvent,
		'timestamp' | 'data' | 'type' | 'sid'
	>[]
	error?: LoadingError
}

export const useTimelineIndicators = (
	session: Pick<Session, 'timeline_indicators_url' | 'secure_id'> | undefined,
): TimelineIndicatorsContext => {
	const [error, setError] = useState<LoadingError>()

	const [loading, setLoading] = useState(false)
	const skipQuery = !session?.secure_id || !!session?.timeline_indicators_url

	const { data, loading: queryLoading } = useGetTimelineIndicatorEventsQuery({
		variables: {
			session_secure_id: session?.secure_id ?? '',
		},
		fetchPolicy: 'cache-and-network',
		skip: skipQuery,
	})

	useEffect(() => {
		if (!skipQuery) {
			setLoading(queryLoading && data === undefined)
		}
	}, [data, queryLoading, skipQuery])

	const [timelineIndicatorEvents, setTimelineIndicatorEvents] = useState<
		Pick<TimelineIndicatorEvent, 'timestamp' | 'data' | 'type' | 'sid'>[]
	>([])
	useEffect(() => {
		if (!session?.secure_id || !data?.timeline_indicator_events) return
		setError(undefined)
		setTimelineIndicatorEvents(
			data.timeline_indicator_events.map((e) => ({
				...e,
				session_secure_id: session.secure_id,
			})) ?? [],
		)
	}, [data?.timeline_indicator_events, session?.secure_id])

	useEffect(() => {
		if (!!session?.timeline_indicators_url) {
			setLoading(true)
			;(async () => {
				if (!session.timeline_indicators_url) return
				const limit = await checkResourceLimit(
					session.timeline_indicators_url,
				)
				if (limit) {
					setError(LoadingError.NetworkResourcesTooLarge)
					H.consumeError(new Error(limit.error), undefined, {
						fileSize: limit.fileSize.toString(),
						limit: limit.sizeLimit.toString(),
						sessionSecureID: session?.secure_id,
					})
					return
				}
				let response
				for await (const r of indexedDBFetch(
					session.timeline_indicators_url,
				)) {
					response = r
				}
				if (response) {
					response
						.json()
						.then((data) => {
							setError(undefined)
							setTimelineIndicatorEvents(
								(data as any[] | undefined)?.map(
									// convert the s3 file schema to what frontend expects
									(r) =>
										({
											timestamp: r.Timestamp,
											type: r.Type,
											sid: r.SID,
											data: r.data,
										} as Pick<
											TimelineIndicatorEvent,
											| 'timestamp'
											| 'data'
											| 'type'
											| 'sid'
										>),
								) ?? [],
							)
						})
						.catch((e) => {
							setError(LoadingError.NetworkResourcesFetchFailed)
							setTimelineIndicatorEvents([])
							H.consumeError(
								e,
								'Error direct downloading resources',
							)
						})
						.finally(() => setLoading(false))
				}
			})()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session?.secure_id])

	return {
		timelineIndicatorEvents,
		timelineIndicatorsLoading: loading,
		error,
	}
}
