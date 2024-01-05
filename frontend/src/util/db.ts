import {
	ApolloLink,
	FetchResult,
	NextLink,
	Observable,
	Operation,
} from '@apollo/client'
import Dexie, { Table } from 'dexie'
import moment from 'moment'

import log from './log'

let indexedDBKillswitch = false
const CLEANUP_CHECK_MS = 1000
const CLEANUP_DELAY_MS = 10000
const CLEANUP_THRESHOLD_MB = 4000
export const INDEXEDDB_ENABLED_LOCAL_STORAGE_PREFIX =
	'highlight-indexeddb-enabled-v2-'

const getLocalStorage = function (): Storage | undefined {
	try {
		return localStorage ?? undefined
	} catch (e) {
		return undefined
	}
}

export const isIndexedDBEnabled = function () {
	if (indexedDBKillswitch) {
		return false
	}

	// disabled indexeddb altogether if we cannot read indexeddb memory usage
	if (!navigator?.storage?.estimate) {
		return false
	}
	const defaultEnabled = false
	const storage = getLocalStorage()
	if (!storage) {
		return defaultEnabled
	}
	const key = `${INDEXEDDB_ENABLED_LOCAL_STORAGE_PREFIX}${
		import.meta.env.MODE
	}`
	if (storage.getItem(key) === null) {
		storage.setItem(key, defaultEnabled ? 'true' : 'false')
	}
	return storage.getItem(key) === 'true'
}

export const setIndexedDBEnabled = function (value: boolean) {
	localStorage.setItem(
		`${INDEXEDDB_ENABLED_LOCAL_STORAGE_PREFIX}${import.meta.env.MODE}`,
		value ? 'true' : 'false',
	)
}

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
	map!: Table<{
		key: string
		created: string
		updated: string
		value: string
	}>

	constructor() {
		super('highlight')
		this.version(7)
			.stores({
				apollo: 'key,updated',
				fetch: 'key,updated',
				map: 'key,updated',
			})
			.upgrade((tx) => {
				tx.table('apollo').clear()
				tx.table('fetch').clear()
				tx.table('map').clear()
			})
	}
}

export const db = new DB()

export class IndexedDBCache {
	static expiryMS: { [op: string]: number } = {
		FetchEventChunkURL: moment.duration(15, 'minutes').asMilliseconds(),
		GetEventChunkURL: moment.duration(15, 'minutes').asMilliseconds(),
		GetSession: moment.duration(15, 'minutes').asMilliseconds(),
	}
	getItem = async function (key: { operation: string; variables: any }) {
		try {
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
		} catch {
			indexedDBKillswitch = true
			return null
		}
	}
	setItem = async function (
		key: {
			operation: string
			variables: any
		},
		value: FetchResult<Record<string, any>>,
	) {
		try {
			await db.apollo.put({
				key: JSON.stringify(key),
				created: moment().format(),
				updated: moment().format(),
				data: value,
			})
		} catch {
			indexedDBKillswitch = true
		}
	}
	deleteItem = async function (key: { operation: string; variables: any }) {
		try {
			const q = db.apollo.where('key').equals(JSON.stringify(key))
			log('db.ts', 'IndexedDBLink cache deleting', {
				key,
				count: await q.count(),
			})
			await q.delete()
		} catch {
			indexedDBKillswitch = true
		}
	}
}

export const indexeddbCache = new IndexedDBCache()

export class IndexedDBLink extends ApolloLink {
	static excluded = new Set<string>([
		'GetAdmin',
		'GetBillingDetails',
		'GetCustomerPortalURL',
		'GetProject',
		'GetSubscriptionDetails',
	])
	httpLink: ApolloLink

	constructor(httpLink: ApolloLink) {
		super()
		this.httpLink = httpLink
	}

	static isCached({ operation }: { operation: Operation }) {
		if (
			operation.query.definitions.find(
				(d) =>
					d.kind === 'OperationDefinition' &&
					d.operation === 'mutation',
			)
		) {
			return false
		}

		if (IndexedDBLink.excluded.has(operation.operationName)) {
			return false
		}

		return isIndexedDBEnabled()
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
		if (!IndexedDBLink.isCached({ operation })) {
			log('db.ts', 'IndexedDBLink cache bypass', {
				operation,
			})
			return this.httpLink.request(operation, forward)
		}

		return new Observable((observer) => {
			const req = this.httpLink.request(operation, forward)!
			indexeddbCache
				.getItem({
					operation: operation.operationName,
					variables: operation.variables,
				})
				.then((result) => {
					if (result?.data) {
						log('db.ts', 'IndexedDBLink cache hit', {
							operation,
							data: result?.data,
						})
						observer.next(result)
					} else {
						log('db.ts', 'IndexedDBLink cache miss', { operation })
					}
					// noinspection TypeScriptValidateJSTypes
					req.subscribe((result) => {
						observer.next(result)
						indexeddbCache.setItem(
							{
								operation: operation.operationName,
								variables: operation.variables,
							},
							result,
						)
						observer.complete()
					})
				})
		})
	}
}

export const indexedDBString = async function* ({
	key,
	operation,
	fn,
}: {
	key: string
	operation: string
	fn: () => Promise<string>
}) {
	if (!isIndexedDBEnabled()) {
		yield await fn()
		return
	}
	const cached = await db.map.where('key').equals(key).first()
	if (cached) {
		if (
			IndexedDBCache.expiryMS[operation] &&
			moment().diff(moment(cached.created)) >=
				IndexedDBCache.expiryMS[operation]
		) {
			log('db.ts', 'indexedDBString cache expired', { key, cached })
			db.apollo.delete(cached.key)
		} else {
			log('db.ts', 'indexedDBString cache hit', { key, cached })
			yield cached.value
		}
	} else {
		log('db.ts', 'indexedDBString cache miss', { key })
	}
	const response = await fn()
	await db.map.put({
		key,
		created: moment().format(),
		updated: moment().format(),
		value: response,
	})
	yield response
}

export const indexedDBWrap = async function* ({
	key,
	operation,
	fn,
}: {
	key: string
	operation: string
	fn: () => Promise<Response>
}) {
	if (!isIndexedDBEnabled()) {
		yield await fn()
		return
	}
	const cached = await db.fetch.where('key').equals(key).first()
	if (cached) {
		if (
			IndexedDBCache.expiryMS[operation] &&
			moment().diff(moment(cached.created)) >=
				IndexedDBCache.expiryMS[operation]
		) {
			log('db.ts', 'indexedDBWrap cache expired', { key, cached })
			db.apollo.delete(cached.key)
		} else {
			log('db.ts', 'indexedDBWrap cache hit', { key, cached })
			yield new Response(cached.blob, {
				...cached.options,
				status: cached.options.status || 200,
			})
		}
	} else {
		log('db.ts', 'indexedDBWrap cache miss', { key })
	}
	const response = await fn()
	const ret = response.clone()
	const headers: { [key: string]: string } = {}
	response.headers.forEach((value: string, key: string) => {
		headers[key] = value
	})
	await db.fetch.put({
		key,
		created: moment().format(),
		updated: moment().format(),
		blob: await response.blob(),
		options: {
			status: response.status,
			statusText: response.statusText,
			headers,
		},
	})
	yield ret
}

export const indexedDBFetch = async function* (
	input: RequestInfo,
	init?: RequestInit | undefined,
) {
	yield* indexedDBWrap({
		key: JSON.stringify({ input, init }),
		operation: 'fetch',
		fn: async () => await fetch(input, init),
	})
}

const cleanup = async () => {
	const fetchElems = await db.fetch.count()
	const mapElems = await db.map.count()
	const apolloElems = await db.apollo.count()
	const totalElems = fetchElems + mapElems + apolloElems
	const size = (await navigator.storage.estimate()) as {
		quota?: number
		usage?: number
		usageDetails?: { indexedDB?: number }
	}
	const usageMB =
		(size.usageDetails?.indexedDB || size.usage || 0) / 1000 / 1000
	const avgElemMB = usageMB / (fetchElems + mapElems + apolloElems)
	const numElemsToRemove = (usageMB - CLEANUP_THRESHOLD_MB) / avgElemMB
	const numFetchElemsToRemove = (fetchElems / totalElems) * numElemsToRemove
	const numMapElemsToRemove = (mapElems / totalElems) * numElemsToRemove
	const numApolloElemsToRemove = (apolloElems / totalElems) * numElemsToRemove
	for (let i = 1; i < numFetchElemsToRemove; ++i) {
		const toDelete = await db.fetch.orderBy('updated').limit(1).first()
		if (toDelete) {
			await db.fetch.delete(toDelete.key)
		}
	}
	for (let i = 1; i < numMapElemsToRemove; ++i) {
		const toDelete = await db.map.orderBy('updated').limit(1).first()
		if (toDelete) {
			await db.map.delete(toDelete.key)
		}
	}
	for (let i = 1; i < numApolloElemsToRemove; ++i) {
		const toDelete = await db.apollo.orderBy('updated').limit(1).first()
		if (toDelete) {
			await db.apollo.delete(toDelete.key)
		}
	}
	if (
		numFetchElemsToRemove > 1 ||
		numMapElemsToRemove > 1 ||
		numApolloElemsToRemove > 1
	) {
		setTimeout(cleanup, CLEANUP_DELAY_MS)
	} else {
		setTimeout(cleanup, CLEANUP_CHECK_MS)
	}
}
if (isIndexedDBEnabled()) {
	setTimeout(cleanup, CLEANUP_CHECK_MS)
}
