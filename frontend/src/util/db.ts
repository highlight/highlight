import { PersistentStorage } from 'apollo3-cache-persist'
import Dexie, { Table } from 'dexie'

export interface CachedRequest {
	key: string
	data: string
}

export class DB extends Dexie {
	requests!: Table<CachedRequest>

	constructor() {
		super('highlight')
		this.version(1).stores({
			requests: 'key, data',
		})
	}
}

export class ApolloCache implements PersistentStorage<string> {
	db: DB
	constructor(db: DB) {
		this.db = db
	}
	getItem: (key: string) => string | Promise<string | null> | null =
		async function (key: string) {
			const result = await db.requests.where('key').equals(key).first()
			return result?.data ?? null
		}
	setItem: (
		key: string,
		value: string,
	) => string | void | Promise<string> | Promise<void> = async function (
		key: string,
		value: string,
	) {
		await db.requests.put({ key, data: value })
	}
	removeItem: (key: string) => void | Promise<string> | Promise<void> =
		async function (key: string) {
			await db.requests.delete(key)
		}
}

export const db = new DB()
export const apolloCache = new ApolloCache(db)
