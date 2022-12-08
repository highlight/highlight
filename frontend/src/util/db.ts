import {
	ApolloLink,
	FetchResult,
	NextLink,
	Observable,
	Operation,
} from '@apollo/client'
import { Session } from '@graph/schemas'
import Dexie, { Table } from 'dexie'
import moment from 'moment'

const CLEANUP_CHECK_MS = 1000
const CLEANUP_DELAY_MS = 10000
const CLEANUP_THRESHOLD_MB = 4000

const getLocalStorage = function (): Storage | undefined {
	try {
		return localStorage ?? undefined
	} catch (e) {
		return undefined
	}
}

const isEnabledInDev = function () {
	const storage = getLocalStorage()
	if (!storage) {
		return true
	}
	if (storage.getItem('highlight-indexeddb-dev-enabled') === null) {
		storage.setItem('highlight-indexeddb-dev-enabled', 'false')
	}
	return storage.getItem('highlight-indexeddb-dev-enabled') === 'true'
}
export const indexeddbEnabled = !import.meta.env.DEV || isEnabledInDev()

export class DB extends Dexie {
	apollo!: Table<{
		key: string
		created: string
		updated: string
		data: FetchResult<Record<string, any>>
	}>
	fetch!: Table<{
		key: string
		created: string
		updated: string
		blob: Blob
		options: {
			status: number
			statusText: string
			headers: { [key: string]: string }
		}
	}>

	constructor() {
		super('highlight')
		this.version(5)
			.stores({
				apollo: 'key,updated',
				fetch: 'key,updated',
			})
			.upgrade((tx) => {
				tx.table('apollo').clear()
				tx.table('fetch').clear()
			})
	}
}

export const db = new DB()

export class IndexedDBCache {
	static expiryMS: { [op: string]: number } = {
		GetEventChunkURL: moment.duration(15, 'minutes').asMilliseconds(),
		GetSession: moment.duration(15, 'minutes').asMilliseconds(),
	}
	getItem = async function (key: { operation: string; variables: any }) {
		const result = await db.apollo
			.where('key')
			.equals(JSON.stringify(key))
			.first()
		if (result) {
			if (IndexedDBCache.expiryMS[key.operation]) {
				if (
					moment().diff(moment(result.created)) >=
					IndexedDBCache.expiryMS[key.operation]
				) {
					db.apollo.delete(result.key)
					return null
				}
			}
			db.apollo.update(result.key, { updated: moment().format() })
		}
		return result?.data ?? null
	}
	setItem = async function (
		key: {
			operation: string
			variables: any
		},
		value: FetchResult<Record<string, any>>,
	) {
		await db.apollo.put({
			key: JSON.stringify(key),
			created: moment().format(),
			updated: moment().format(),
			data: value,
		})
	}
	deleteItem = async function (key: { operation: string; variables: any }) {
		await db.apollo.delete(JSON.stringify(key))
	}
}

export const indexeddbCache = new IndexedDBCache()

export class IndexedDBLink extends ApolloLink {
	httpLink: ApolloLink
	static cachedOperations = new Set<string>([
		'GetEnhancedUserDetails',
		'GetErrorDistribution',
		'GetErrorGroup',
		'GetErrorInstance',
		'GetErrorGroupsOpenSearch',
		'GetErrorsHistogram',
		'GetEventChunks',
		'GetEventChunkURL',
		'GetRecentErrors',
		'GetSessionIntervals',
		'GetSession',
		'GetSessionPayload',
		'GetSessionsHistogram',
		'GetSessionsOpenSearch',
		'GetWebVitals',
	])

	constructor(httpLink: ApolloLink) {
		super()
		this.httpLink = httpLink
	}

	static isCached(operation: Operation) {
		return (
			indexeddbEnabled &&
			IndexedDBLink.cachedOperations.has(operation.operationName)
		)
	}

	/* determines whether an operation should be stored in the cache.
	GetSession should only be cached for non-live sessions since the data will change.
	* */
	static shouldCache(
		operation: Operation,
		result: FetchResult<Record<string, any>>,
	): boolean {
		if (operation.operationName === 'GetSession') {
			return !!result?.data?.session?.processed
		}
		return true
	}

	static async has(operationName: string, variables: any) {
		return !!(await indexeddbCache.getItem({
			operation: operationName,
			variables: variables,
		}))
	}

	request(
		operation: Operation,
		forward?: NextLink,
	): Observable<FetchResult<Record<string, any>>> | null {
		if (!IndexedDBLink.isCached(operation)) {
			return this.httpLink.request(operation, forward)
		}

		return new Observable((observer) => {
			indexeddbCache
				.getItem({
					operation: operation.operationName,
					variables: operation.variables,
				})
				.then((result) => {
					if (result?.data) {
						// GetSession cache entry is invalid if the `updated_at` value has changed.
						if (operation.operationName === 'GetSession') {
							// noinspection TypeScriptValidateJSTypes
							this.httpLink
								.request(operation, forward)!
								.subscribe((newResult) => {
									// if the cached result payload_updated_at matches a new result,
									// return the existing cached result
									if (
										result.data?.session
											?.payload_updated_at ===
										newResult.data?.session
											.payload_updated_at
									) {
										observer.next(result)
										observer.complete()
									} else {
										const sessionSecureID = (
											newResult.data?.session as
												| Session
												| undefined
										)?.secure_id
										// otherwise the payload_updated_at has changed
										// remove any other cache entries that may be related
										const promises = [
											indexeddbCache.deleteItem({
												operation: 'GetEventChunks',
												variables: {
													secure_id: sessionSecureID,
												},
											}),
											indexeddbCache.deleteItem({
												operation:
													'GetSessionIntervals',
												variables: {
													session_secure_id:
														sessionSecureID,
												},
											}),
											indexeddbCache.deleteItem({
												operation: 'GetSessionPayload',
												variables: {
													session_secure_id:
														sessionSecureID,
													skip_events: true,
												},
											}),
											indexeddbCache.deleteItem({
												operation: 'GetSessionPayload',
												variables: {
													session_secure_id:
														sessionSecureID,
													skip_events: false,
												},
											}),
											indexeddbCache.deleteItem({
												operation: 'GetWebVitals',
												variables: {
													session_secure_id:
														sessionSecureID,
												},
											}),
										]
										Promise.all(promises).then(() => {
											// store the new value and return it
											indexeddbCache
												.setItem(
													{
														operation:
															operation.operationName,
														variables:
															operation.variables,
													},
													newResult,
												)
												.then(() => {
													observer.next(newResult)
													observer.complete()
												})
										})
									}
								})
						} else {
							observer.next(result)
							observer.complete()
						}
					} else {
						// noinspection TypeScriptValidateJSTypes
						this.httpLink
							.request(operation, forward)!
							.subscribe((result) => {
								if (
									IndexedDBLink.shouldCache(operation, result)
								) {
									indexeddbCache
										.setItem(
											{
												operation:
													operation.operationName,
												variables: operation.variables,
											},
											result,
										)
										.then(() => {
											observer.next(result)
											observer.complete()
										})
								} else {
									observer.next(result)
									observer.complete()
								}
							})
					}
				})
		})
	}
}

export const indexedDBFetch = async function (
	input: RequestInfo,
	init?: RequestInit | undefined,
) {
	if (!indexeddbEnabled) {
		return await fetch(input, init)
	}
	const cacheKey = JSON.stringify({ input, init })
	const cached = await db.fetch.where('key').equals(cacheKey).first()
	if (!cached) {
		const response = await fetch(input, init)
		const ret = response.clone()
		const headers: { [key: string]: string } = {}
		response.headers.forEach((value: string, key: string) => {
			headers[key] = value
		})
		await db.fetch.put({
			key: cacheKey,
			created: moment().format(),
			updated: moment().format(),
			blob: await response.blob(),
			options: {
				status: response.status,
				statusText: response.statusText,
				headers,
			},
		})
		return ret
	} else {
		db.fetch.update(cached.key, { updated: moment().format() })
		return new Response(cached.blob, {
			...cached.options,
			status: cached.options.status || 200,
		})
	}
}

const cleanup = async () => {
	const fetchElems = await db.fetch.count()
	const apolloElems = await db.apollo.count()
	const totalElems = fetchElems + apolloElems
	const size = (await navigator.storage.estimate()) as {
		quota?: number
		usage?: number
		usageDetails?: { indexedDB?: number }
	}
	const usageMB =
		(size.usageDetails?.indexedDB || size.usage || 0) / 1000 / 1000
	const avgElemMB = usageMB / (fetchElems + apolloElems)
	const numElemsToRemove = (usageMB - CLEANUP_THRESHOLD_MB) / avgElemMB
	const numFetchElemsToRemove = (fetchElems / totalElems) * numElemsToRemove
	const numApolloElemsToRemove = (apolloElems / totalElems) * numElemsToRemove
	for (let i = 1; i < numFetchElemsToRemove; ++i) {
		const toDelete = await db.fetch.orderBy('updated').limit(1).first()
		if (toDelete) {
			await db.fetch.delete(toDelete.key)
		}
	}
	for (let i = 1; i < numApolloElemsToRemove; ++i) {
		const toDelete = await db.apollo.orderBy('updated').limit(1).first()
		if (toDelete) {
			await db.apollo.delete(toDelete.key)
		}
	}
	if (numFetchElemsToRemove > 1 || numApolloElemsToRemove > 1) {
		setTimeout(cleanup, CLEANUP_DELAY_MS)
	} else {
		setTimeout(cleanup, CLEANUP_CHECK_MS)
	}
}
if (indexeddbEnabled) {
	setTimeout(cleanup, CLEANUP_CHECK_MS)
}
