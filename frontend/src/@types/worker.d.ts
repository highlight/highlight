declare module 'web-worker:*' {
	const WorkerFactory: new () => Worker
	export default WorkerFactory
}

declare type WorkerParams =
	| {
			type: 'errors'
			page: number
	  }
	| {
			type: 'sessions'
			page: number
	  }
	| {
			type: 'fetch'
			url: string
	  }

declare type WorkerResponse = {}
