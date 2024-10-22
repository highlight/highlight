import {
	GetEnhancedUserDetailsDocument,
	GetEventChunksDocument,
	GetEventChunkUrlDocument,
	GetSessionDocument,
	GetSessionIntervalsDocument,
	GetSessionPayloadDocument,
	GetWebVitalsDocument,
} from '@graph/hooks'
import { indexedDBFetch, IndexedDBLink } from '@util/db'
import { client } from '@util/graph'
import log from '@util/log'
import { H } from 'highlight.run'

export const loadSession = async function (secureID: string) {
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
		if (sess.timeline_indicators_url) {
			for await (const _ of indexedDBFetch(
				sess.timeline_indicators_url,
			)) {
			}
		}
		if (sess.direct_download_url) {
			for await (const _ of indexedDBFetch(sess.direct_download_url)) {
			}
		}
		await client.query({
			query: GetSessionIntervalsDocument,
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
		await indexedDBFetch(response.data.event_chunk_url)
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
		log('preload.ts', `failed to preload session ${secureID}`)
	}
}
