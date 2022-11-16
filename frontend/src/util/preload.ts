import { DEFAULT_PAGE_SIZE } from '@components/Pagination/Pagination'
import {
	useGetEventChunksLazyQuery,
	useGetEventChunkUrlQuery,
	useGetSessionCommentsLazyQuery,
	useGetSessionIntervalsLazyQuery,
	useGetSessionLazyQuery,
	useGetSessionPayloadLazyQuery,
	useGetSessionsOpenSearchQuery,
	useGetTimelineIndicatorEventsLazyQuery,
} from '@graph/hooks'
import { IndexedDBFetch } from '@util/db'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import moment from 'moment'
import { useMemo, useRef } from 'react'

export const usePreloadData = function () {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const startDate = useRef<moment.Moment>(
		moment(moment().format('MM/DD/YYYY HH:mm:SS')),
	)
	const preloaded = useRef<boolean>(false)

	const { data: sessions } = useGetSessionsOpenSearchQuery({
		variables: {
			query: JSON.stringify({
				bool: {
					must: [
						{
							bool: {
								should: [
									{
										term: {
											processed: 'true',
										},
									},
								],
							},
						},
						{
							bool: {
								should: [
									{
										range: {
											created_at: {
												gte: startDate.current
													.clone()
													.subtract(30, 'days')
													.format(),
												lte: startDate.current.format(),
											},
										},
									},
								],
							},
						},
					],
				},
			}),
			count: DEFAULT_PAGE_SIZE,
			page: 1,
			project_id,
			sort_desc: true,
		},
	})
	const [fetchSession] = useGetSessionLazyQuery()
	const [fetchIntervals] = useGetSessionIntervalsLazyQuery()
	const [fetchIndicatorEvents] = useGetTimelineIndicatorEventsLazyQuery()
	const [fetchEventChunks] = useGetEventChunksLazyQuery()
	const [fetchSessionComments] = useGetSessionCommentsLazyQuery()
	const [fetchSessionPayload] = useGetSessionPayloadLazyQuery()
	const { refetch: fetchEventChunkURL } = useGetEventChunkUrlQuery({
		fetchPolicy: 'no-cache',
		skip: true,
	})

	// session preload
	useMemo(async () => {
		if (
			!project_id ||
			!fetchEventChunkURL ||
			!fetchEventChunks ||
			!fetchIndicatorEvents ||
			!fetchIntervals ||
			!fetchSession ||
			!fetchSessionComments ||
			!fetchSessionPayload ||
			!sessions?.sessions_opensearch.sessions.length ||
			preloaded.current
		)
			return false
		preloaded.current = true
		const promises: Promise<void>[] = []
		for (const _s of sessions?.sessions_opensearch.sessions || []) {
			promises.push(
				(async (secureID: string) => {
					console.log(`preloading session ${secureID}`)
					try {
						const session = await fetchSession({
							variables: {
								secure_id: secureID,
							},
						})
						const sess = session?.data?.session
						if (!sess) return
						if (sess.resources_url) {
							await IndexedDBFetch(sess.resources_url)
						}
						if (sess.messages_url) {
							await IndexedDBFetch(sess.messages_url)
						}
						if (sess.direct_download_url) {
							IndexedDBFetch(sess.direct_download_url)
						}
						fetchIntervals({
							variables: {
								session_secure_id: secureID,
							},
						})
						fetchIndicatorEvents({
							variables: {
								session_secure_id: secureID,
							},
						})
						fetchEventChunks({
							variables: {
								secure_id: secureID,
							},
						})
						fetchSessionComments({
							variables: {
								session_secure_id: secureID,
							},
						})
						fetchSessionPayload({
							variables: {
								session_secure_id: secureID,
								skip_events: true,
							},
						})
						const response = await fetchEventChunkURL({
							secure_id: secureID,
							index: 0,
						})
						await IndexedDBFetch(response.data.event_chunk_url)
						console.log(`preloaded session ${secureID}`)
					} catch (e: any) {
						const msg = `failed to preload session ${secureID}`
						console.warn(msg)
						H.consumeError(e, msg)
					}
				})(_s.secure_id),
			)
		}
		await Promise.all(promises)
		console.log(`preloaded ${promises.length} sessions`)
	}, [
		fetchEventChunkURL,
		fetchEventChunks,
		fetchIndicatorEvents,
		fetchIntervals,
		fetchSession,
		fetchSessionComments,
		fetchSessionPayload,
		project_id,
		sessions?.sessions_opensearch.sessions,
	]).then()
}
