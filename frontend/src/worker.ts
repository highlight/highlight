// noinspection ES6PreferShortImport

import { indexedDBFetch } from './util/db'
import log from './util/log'

export interface RequestWorker {
	postMessage: (message: WorkerParams) => void
	onmessage: null | ((message: MessageEvent<WorkerResponse>) => void)
}

interface ResponseWorker {
	onmessage: null | ((message: MessageEvent<WorkerParams>) => void)
	postMessage(e: WorkerResponse): void
}

const worker: ResponseWorker = self
{
	worker.onmessage = async function (e) {
		log('frontend-worker', 'received message', e)
		if (e.data.type === 'fetch') {
			await indexedDBFetch(e.data.url)
		}
	}
}
