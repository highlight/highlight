import Dexie, { Table } from 'dexie'

export interface Doc {
	slug: string
	content: string
	metadata: any
}

export class DB extends Dexie {
	docs!: Table<Doc>

	constructor() {
		super('highlight-docs')
		this.version(1).stores({
			docs: 'slug, content', // Primary key and indexed props
		})
	}
}

export const db = new DB()
