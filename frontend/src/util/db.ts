import {
	ApolloLink,
	FetchResult,
	NextLink,
	Observable,
	Operation,
} from '@apollo/client'
import Dexie, { Table } from 'dexie'

export class DB extends Dexie {
	requests!: Table<{
		key: string
		data: FetchResult<Record<string, any>>
	}>
	fetch!: Table<{
		key: string
		blob: Blob
		options: {
			status: number
			statusText: string
			headers: { [key: string]: string }
		}
	}>

	constructor() {
		super('highlight')
		this.version(1).stores({
			requests: 'key',
			fetch: 'key',
		})
	}
}

export const db = new DB()

export class IndexedDBCache {
	getItem: (key: string) => Promise<FetchResult<Record<string, any>> | null> =
		async function (key: string) {
			const result = await db.requests.where('key').equals(key).first()
			return result?.data ?? null
		}
	setItem: (
		key: string,
		value: FetchResult<Record<string, any>>,
	) => Promise<FetchResult<Record<string, any>>> | Promise<void> =
		async function (key: string, value: FetchResult<Record<string, any>>) {
			await db.requests.put({ key, data: value })
		}
	removeItem: (
		key: string,
	) => Promise<FetchResult<Record<string, any>>> | Promise<void> =
		async function (key: string) {
			await db.requests.delete(key)
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
							indexeddbCache.setItem(cacheKey, result)
							observer.next(result)
							observer.complete()
						})
					}
				}
			})
		})
	}
}

export const IndexedDBFetch = async function (
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
			blob: await response.blob(),
			options: {
				status: response.status,
				statusText: response.statusText,
				headers,
			},
		})
		return ret
	} else {
		return new Response(cached.blob, cached.options)
	}
}
