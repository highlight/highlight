import { DEFAULT_PAGE_SIZE } from '@components/Pagination/Pagination'
import {
	GetEnhancedUserDetailsDocument,
	GetErrorDistributionDocument,
	GetErrorGroupDocument,
	GetErrorGroupsOpenSearchDocument,
	GetErrorsHistogramDocument,
	GetEventChunksDocument,
	GetEventChunkUrlDocument,
	GetRecentErrorsDocument,
	GetSessionCommentsDocument,
	GetSessionDocument,
	GetSessionIntervalsDocument,
	GetSessionPayloadDocument,
	GetSessionsOpenSearchDocument,
	GetTimelineIndicatorEventsDocument,
	GetWebVitalsDocument,
} from '@graph/hooks'
import { OpenSearchCalendarInterval } from '@graph/schemas'
import { indexeddbEnabled, IndexedDBLink } from '@util/db'
import { client } from '@util/graph'
import log from '@util/log'
import { useParams } from '@util/react-router/useParams'
import { H } from 'highlight.run'
import moment from 'moment'
import { useEffect, useRef } from 'react'

import { worker } from '../index'

const CONCURRENT_PRELOADS = 1

export const preloadSession = async (secureID: string) => {
	if (
		await IndexedDBLink.has('GetSession', {
			secure_id: secureID,
		})
	) {
		log('preload.ts', `skipping loaded session ${secureID}`)
		return
	}
	const start = window.performance.now()
	log('preload.ts', `preloading session ${secureID}`)
	try {
		const session = await client.query({
			query: GetSessionDocument,
			variables: {
				secure_id: secureID,
			},
		})
		const sess = session?.data?.session
		if (!sess) return
		if (sess.resources_url) {
			worker.postMessage({
				type: 'fetch',
				url: sess.resources_url,
			})
		}
		if (sess.messages_url) {
			worker.postMessage({
				type: 'fetch',
				url: sess.messages_url,
			})
		}
		if (sess.direct_download_url) {
			worker.postMessage({
				type: 'fetch',
				url: sess.direct_download_url,
			})
		}
		await client.query({
			query: GetSessionIntervalsDocument,
			variables: {
				session_secure_id: secureID,
			},
		})
		await client.query({
			query: GetTimelineIndicatorEventsDocument,
			variables: {
				session_secure_id: secureID,
			},
		})
		await client.query({
			query: GetEventChunksDocument,
			variables: {
				secure_id: secureID,
			},
		})
		await client.query({
			query: GetSessionCommentsDocument,
			variables: {
				session_secure_id: secureID,
			},
		})
		await client.query({
			query: GetSessionPayloadDocument,
			variables: {
				session_secure_id: secureID,
				skip_events: true,
			},
		})
		await client.query({
			query: GetEnhancedUserDetailsDocument,
			variables: {
				session_secure_id: secureID,
			},
		})
		await client.query({
			query: GetWebVitalsDocument,
			variables: {
				session_secure_id: secureID,
			},
		})
		const response = await client.query({
			query: GetEventChunkUrlDocument,
			variables: {
				secure_id: secureID,
				index: 0,
			},
		})
		worker.postMessage({
			type: 'fetch',
			url: response.data.event_chunk_url,
		})
		const preloadTime = window.performance.now() - start
		log(
			'preload.ts',
			`preloaded session ${secureID} in ${preloadTime / 1000} s.`,
		)
		H.metrics([
			{
				name: 'preload-session-ms',
				value: preloadTime,
				tags: [
					{
						name: 'SecureID',
						value: secureID,
					},
				],
			},
		])
	} catch (e: any) {
		const msg = `failed to preload session ${secureID}`
		console.warn(msg)
		H.consumeError(e, msg)
	}
}

export const usePreloadSessions = function ({ page }: { page: number }) {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const endDate = useRef<moment.Moment>(
		moment(moment().format('MM/DD/YYYY HH:mm')),
	)
	const preloadedPages = useRef<Set<number>>(new Set<number>())

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

	useEffect(() => {
		;(async () => {
			if (!indexeddbEnabled || preloadedPages.current.has(pageToLoad)) {
				return false
			}
			const { data: sessions } = await client.query({
				query: GetSessionsOpenSearchDocument,
				variables: {
					query,
					count: DEFAULT_PAGE_SIZE,
					page: pageToLoad,
					project_id,
					sort_desc: true,
				},
			})
			if (!sessions?.sessions_opensearch.sessions.length) return false
			preloadedPages.current.add(pageToLoad)

			const promises: Promise<void>[] = []
			for (const _s of sessions?.sessions_opensearch.sessions || []) {
				const preloadPromise = preloadSession(_s.secure_id)
				promises.push(preloadPromise)
				if (promises.length === CONCURRENT_PRELOADS) {
					await Promise.all(promises)
					promises.length = 0
				}
			}
			await Promise.all(promises)
		})()
	}, [pageToLoad, project_id, query])
}

export const usePreloadErrors = function ({ page }: { page: number }) {
	const { project_id } = useParams<{
		project_id: string
	}>()
	const endDate = useRef<moment.Moment>(
		moment(moment().format('MM/DD/YYYY HH:mm')),
	)
	const preloadedPages = useRef<Set<number>>(new Set<number>())

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

	useEffect(() => {
		;(async () => {
			if (!indexeddbEnabled || preloadedPages.current.has(pageToLoad))
				return false
			const { data: errors } = await client.query({
				query: GetErrorGroupsOpenSearchDocument,
				variables: {
					query,
					count: DEFAULT_PAGE_SIZE,
					page: pageToLoad,
					influx: false,
					project_id,
				},
			})

			if (!errors?.error_groups_opensearch.error_groups.length)
				return false
			preloadedPages.current.add(pageToLoad)

			client.query({
				query: GetErrorGroupsOpenSearchDocument,
				variables: {
					query,
					count: DEFAULT_PAGE_SIZE,
					page: pageToLoad,
					influx: true,
					project_id,
				},
			})
			client.query({
				query: GetErrorsHistogramDocument,
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
			const promises: Promise<void>[] = []
			for (const _eg of errors?.error_groups_opensearch.error_groups ||
				[]) {
				const preloadPromise = (async (secureID: string) => {
					if (
						await IndexedDBLink.has('GetErrorGroup', {
							secure_id: secureID,
						})
					) {
						log(
							'preload.ts',
							`skipping loaded error group ${secureID}`,
						)
						return
					}
					const start = window.performance.now()
					log('preload.ts', `preloading error group ${secureID}`)
					try {
						await client.query({
							query: GetErrorGroupDocument,
							variables: {
								secure_id: secureID,
							},
						})
						await client.query({
							query: GetRecentErrorsDocument,
							variables: {
								secure_id: secureID,
							},
						})
						await client.query({
							query: GetErrorDistributionDocument,
							variables: {
								error_group_secure_id: secureID,
								project_id,
								property: 'os',
							},
						})
						await client.query({
							query: GetErrorDistributionDocument,
							variables: {
								error_group_secure_id: secureID,
								project_id,
								property: 'browser',
							},
						})
						const preloadTime = window.performance.now() - start
						log(
							'preload.ts',
							`preloaded error group ${secureID} in ${
								preloadTime / 1000
							} s.`,
						)
						H.metrics([
							{
								name: 'preload-error-ms',
								value: preloadTime,
								tags: [
									{
										name: 'SecureID',
										value: secureID,
									},
								],
							},
						])
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
		})()
	}, [project_id, pageToLoad, query])
}
