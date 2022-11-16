import { DEFAULT_PAGE_SIZE } from '@components/Pagination/Pagination'
import {
	useGetEventChunksLazyQuery,
	useGetEventChunkUrlQuery,
	useGetSessionCommentsLazyQuery,
	useGetSessionIntervalsLazyQuery,
	useGetSessionLazyQuery,
	useGetSessionPayloadLazyQuery,
	useGetSessionsOpenSearchLazyQuery,
	useGetTimelineIndicatorEventsLazyQuery,
} from '@graph/hooks'
import { Session } from '@graph/schemas'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { IndexedDBFetch } from '@util/db'
import log from '@util/log'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import { useMemo, useRef } from 'react'

export const usePreloadData = function () {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const preloaded = useRef<boolean>(false)
	const [fetchSessions] = useGetSessionsOpenSearchLazyQuery()
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
	const { backendSearchQuery } = useSearchContext()

	// session preload
	useMemo(async () => {
		if (
			!backendSearchQuery?.searchQuery ||
			!project_id ||
			!fetchEventChunkURL ||
			!fetchEventChunks ||
			!fetchIndicatorEvents ||
			!fetchIntervals ||
			!fetchSession ||
			!fetchSessionComments ||
			!fetchSessionPayload ||
			!fetchSessions ||
			preloaded.current
		)
			return
		preloaded.current = true
		const sessions = await fetchSessions({
			variables: {
				query: backendSearchQuery?.searchQuery || '',
				count: DEFAULT_PAGE_SIZE,
				page: 1,
				project_id,
				sort_desc: true,
			},
		})
		const promises: Promise<void>[] = []
		for (const session of sessions?.data?.sessions_opensearch?.sessions ||
			[]) {
			promises.push(
				(async (s: Session) => {
					try {
						const session = await fetchSession({
							variables: {
								secure_id: s.secure_id,
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
								session_secure_id: sess.secure_id,
							},
						})
						fetchIndicatorEvents({
							variables: {
								session_secure_id: sess.secure_id,
							},
						})
						fetchEventChunks({
							variables: {
								secure_id: sess.secure_id,
							},
						})
						fetchSessionComments({
							variables: {
								session_secure_id: sess.secure_id,
							},
						})
						fetchSessionPayload({
							variables: {
								session_secure_id: sess.secure_id,
								skip_events: true,
							},
						})
						const response = await fetchEventChunkURL({
							secure_id: sess.secure_id,
							index: 0,
						})
						await IndexedDBFetch(response.data.event_chunk_url)
					} catch (e: any) {
						const msg = `failed to preload session ${session.secure_id}`
						console.warn(msg)
						H.consumeError(e, msg)
					}
				})(session),
			)
		}
		return await Promise.all(promises)
	}, [
		backendSearchQuery?.searchQuery,
		fetchEventChunkURL,
		fetchEventChunks,
		fetchIndicatorEvents,
		fetchIntervals,
		fetchSession,
		fetchSessionComments,
		fetchSessionPayload,
		fetchSessions,
		project_id,
	]).then((r) => {
		if (r) log('preload.ts', `preloaded ${r?.length} sessions`)
	})
}
