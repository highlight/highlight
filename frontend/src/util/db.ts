import {
	ApolloLink,
	FetchResult,
	NextLink,
	Observable,
	Operation,
} from '@apollo/client'
import Dexie, { Table } from 'dexie'
import moment from 'moment'

const CLEANUP_CHECK_MS = 1000
const CLEANUP_DELAY_MS = 10000
const CLEANUP_THRESHOLD_MB = 4000

export class DB extends Dexie {
	apollo!: Table<{
		key: string
		updated: string
		data: FetchResult<Record<string, any>>
	}>
	fetch!: Table<{
		key: string
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
		this.version(2).stores({
			apollo: 'key,updated',
			fetch: 'key,updated',
		})
	}
}

export const db = new DB()

export class IndexedDBCache {
	getItem: (key: string) => Promise<FetchResult<Record<string, any>> | null> =
		async function (key: string) {
			const result = await db.apollo.where('key').equals(key).first()
			if (result) {
				db.apollo.update(result.key, { updated: moment().format() })
			}
			return result?.data ?? null
		}
	setItem: (
		key: string,
		value: FetchResult<Record<string, any>>,
	) => Promise<FetchResult<Record<string, any>>> | Promise<void> =
		async function (key: string, value: FetchResult<Record<string, any>>) {
			await db.apollo.put({
				key,
				updated: moment().format(),
				data: value,
			})
		}
	removeItem: (
		key: string,
	) => Promise<FetchResult<Record<string, any>>> | Promise<void> =
		async function (key: string) {
			await db.apollo.delete(key)
		}
}

export const indexeddbCache = new IndexedDBCache()

export class IndexedDBLink extends ApolloLink {
	httpLink: ApolloLink
	constructor(httpLink: ApolloLink) {
		super()
		this.httpLink = httpLink
	}
	request(
		operation: Operation,
		forward?: NextLink,
	): Observable<FetchResult<Record<string, any>>> | null {
		return new Observable((observer) => {
			const cacheKey = JSON.stringify({
				operation: operation.operationName,
				variables: operation.variables,
			})
			indexeddbCache.getItem(cacheKey).then((result) => {
				if (result) {
					observer.next(result)
					observer.complete()
				} else {
					const req = this.httpLink.request(operation, forward)
					if (req) {
						req.subscribe((result) => {
							indexeddbCache
								.setItem(cacheKey, result)
								.then(() => {
									observer.next(result)
									observer.complete()
								})
						})
					}
				}
			})
		})
	}
}

export const indexedDBFetch = async function (
	input: RequestInfo,
	init?: RequestInit | undefined,
) {
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
		return new Response(cached.blob, cached.options)
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
		window.setTimeout(cleanup, CLEANUP_DELAY_MS)
	} else {
		window.setTimeout(cleanup, CLEANUP_CHECK_MS)
	}
}
window.setTimeout(cleanup, CLEANUP_CHECK_MS)
