import {
	GetEnhancedUserDetailsDocument,
	GetEventChunksDocument,
	GetEventChunkUrlDocument,
	GetSessionDocument,
	GetSessionIntervalsDocument,
	GetSessionPayloadDocument,
	GetWebVitalsDocument,
} from '@graph/hooks'
import { LoadingError } from '@pages/Player/ResourcesContext/ResourcesContext'
import { indexedDBFetch, IndexedDBLink } from '@util/db'
import { client } from '@util/graph'
import log from '@util/log'
import { H } from 'highlight.run'

// Max brotlied resource file allowed. Note that a brotli file with some binary data
// has a compression ratio of >5x, so unbrotlied this file will take up much more memory.
const RESOURCE_FILE_SIZE_LIMIT_BYTES = 32 * 1024 * 1024

export const checkResourceLimit = async function (resources_url: string) {
	const r = await fetch(resources_url, {
		method: 'HEAD',
	})
	const fileSize = Number(r.headers.get('Content-Length'))
	if (fileSize > RESOURCE_FILE_SIZE_LIMIT_BYTES) {
		return {
			error: LoadingError.NetworkResourcesTooLarge,
			fileSize: fileSize,
			sizeLimit: RESOURCE_FILE_SIZE_LIMIT_BYTES,
		}
	}
	return undefined
}

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
		if (sess.resources_url) {
			const limit = await checkResourceLimit(sess.resources_url)
			if (!limit) {
				for await (const _ of indexedDBFetch(sess.resources_url)) {
				}
			}
		}
		if (sess.timeline_indicators_url) {
			const limit = await checkResourceLimit(sess.timeline_indicators_url)
			if (!limit) {
				for await (const _ of indexedDBFetch(
					sess.timeline_indicators_url,
				)) {
				}
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
