import { DEFAULT_PAGE_SIZE } from '@components/Pagination/Pagination'
import {
	useGetEnhancedUserDetailsLazyQuery,
	useGetErrorDistributionLazyQuery,
	useGetErrorGroupLazyQuery,
	useGetErrorGroupsOpenSearchQuery,
	useGetErrorsHistogramQuery,
	useGetEventChunksLazyQuery,
	useGetEventChunkUrlQuery,
	useGetRecentErrorsLazyQuery,
	useGetSessionCommentsLazyQuery,
	useGetSessionIntervalsLazyQuery,
	useGetSessionLazyQuery,
	useGetSessionPayloadLazyQuery,
	useGetSessionsOpenSearchQuery,
	useGetTimelineIndicatorEventsLazyQuery,
	useGetWebVitalsLazyQuery,
} from '@graph/hooks'
import { OpenSearchCalendarInterval } from '@graph/schemas'
import { useErrorSearchContext } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { useSearchContext } from '@pages/Sessions/SearchContext/SearchContext'
import { IndexedDBFetch } from '@util/db'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import moment from 'moment'
import { useMemo, useRef } from 'react'

const CONCURRENT_PRELOADS = 1

export const usePreloadSessions = function () {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const endDate = useRef<moment.Moment>(
		moment(moment().format('MM/DD/YYYY HH:mm')),
	)
	const preloadedPage = useRef<number>()

	const { page } = useSearchContext()
	const pageToLoad = page ?? 1
	const query = JSON.stringify({
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
										gte: endDate.current
											.clone()
											.subtract(30, 'days')
											.format(),
										lte: endDate.current.format(),
									},
								},
							},
						],
					},
				},
			],
		},
	})

	const { data: sessions } = useGetSessionsOpenSearchQuery({
		variables: {
			query,
			count: DEFAULT_PAGE_SIZE,
			page: pageToLoad,
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
	const [fetchEnhanced] = useGetEnhancedUserDetailsLazyQuery()
	const [fetchWebVitals] = useGetWebVitalsLazyQuery()
	const { refetch: fetchEventChunkURL } = useGetEventChunkUrlQuery({
		skip: true,
	})

	useMemo(async () => {
		if (
			!sessions?.sessions_opensearch.sessions.length ||
			!fetchEventChunkURL ||
			!fetchEventChunks ||
			!fetchIndicatorEvents ||
			!fetchIntervals ||
			!fetchSession ||
			!fetchSessionComments ||
			!fetchSessionPayload ||
			!fetchEnhanced ||
			!fetchWebVitals ||
			preloadedPage.current === pageToLoad
		)
			return false
		preloadedPage.current = pageToLoad
		const promises: Promise<void>[] = []
		for (const _s of sessions?.sessions_opensearch.sessions || []) {
			const preloadPromise = (async (secureID: string) => {
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
						await IndexedDBFetch(sess.direct_download_url)
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
					fetchEnhanced({
						variables: {
							session_secure_id: secureID,
						},
					})
					fetchWebVitals({
						variables: {
							session_secure_id: secureID,
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
			})(_s.secure_id)
			promises.push(preloadPromise)
			if (promises.length === CONCURRENT_PRELOADS) {
				await Promise.all(promises)
				promises.length = 0
			}
		}
		await Promise.all(promises)
	}, [
		fetchEnhanced,
		fetchEventChunkURL,
		fetchEventChunks,
		fetchIndicatorEvents,
		fetchIntervals,
		fetchSession,
		fetchSessionComments,
		fetchSessionPayload,
		fetchWebVitals,
		pageToLoad,
		sessions,
	]).then()
}

export const usePreloadErrors = function () {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const endDate = useRef<moment.Moment>(
		moment(moment().format('MM/DD/YYYY HH:mm')),
	)
	const preloadedPage = useRef<number>()

	const { page } = useErrorSearchContext()
	const pageToLoad = page ?? 1
	const query = JSON.stringify({
		bool: {
			must: [
				{
					bool: {
						must: [
							{
								bool: {
									should: [
										{
											term: {
												'state.keyword': 'OPEN',
											},
										},
									],
								},
							},
						],
					},
				},
				{
					has_child: {
						type: 'child',
						query: {
							bool: {
								must: [
									{
										bool: {
											should: [
												{
													range: {
														timestamp: {
															gte: endDate.current
																.clone()
																.subtract(
																	30,
																	'days',
																)
																.format(),
															lte: endDate.current.format(),
														},
													},
												},
											],
										},
									},
								],
							},
						},
					},
				},
			],
		},
	})
	const { data: errors } = useGetErrorGroupsOpenSearchQuery({
		variables: {
			query,
			count: DEFAULT_PAGE_SIZE,
			page: pageToLoad,
			project_id,
		},
	})
	const {} = useGetErrorsHistogramQuery({
		variables: {
			query,
			project_id,
			histogram_options: {
				bounds: {
					start_date: endDate.current
						.clone()
						.subtract(30, 'days')
						.format(),
					end_date: endDate.current.format(),
				},
				bucket_size: {
					calendar_interval: OpenSearchCalendarInterval.Day,
					multiple: 1,
				},
				time_zone: '',
			},
		},
	})

	const [fetchErrorGroup] = useGetErrorGroupLazyQuery()
	const [fetchRecentErrors] = useGetRecentErrorsLazyQuery()
	const [fetchErrorGroupDistribution] = useGetErrorDistributionLazyQuery()

	useMemo(async () => {
		if (
			!fetchErrorGroup ||
			!fetchRecentErrors ||
			!fetchErrorGroupDistribution ||
			!errors?.error_groups_opensearch.error_groups.length ||
			preloadedPage.current === pageToLoad
		)
			return false
		preloadedPage.current = pageToLoad
		const promises: Promise<void>[] = []
		for (const _eg of errors?.error_groups_opensearch.error_groups || []) {
			const preloadPromise = (async (secureID: string) => {
				console.log(`preloading error group ${secureID}`)
				try {
					await fetchErrorGroup({
						variables: {
							secure_id: secureID,
						},
					})
					await fetchRecentErrors({
						variables: {
							secure_id: secureID,
						},
					})
					await fetchErrorGroupDistribution({
						variables: {
							error_group_secure_id: secureID,
							project_id,
							property: 'os',
						},
					})
					await fetchErrorGroupDistribution({
						variables: {
							error_group_secure_id: secureID,
							project_id,
							property: 'browser',
						},
					})
					console.log(`preloaded error group ${secureID}`)
				} catch (e: any) {
					const msg = `failed to preload error group ${secureID}`
					console.warn(msg)
					H.consumeError(e, msg)
				}
			})(_eg.secure_id)
			promises.push(preloadPromise)
			if (promises.length === CONCURRENT_PRELOADS) {
				await Promise.all(promises)
				promises.length = 0
			}
		}
		await Promise.all(promises)
	}, [
		project_id,
		errors,
		fetchErrorGroup,
		fetchRecentErrors,
		fetchErrorGroupDistribution,
		pageToLoad,
	]).then()
}
