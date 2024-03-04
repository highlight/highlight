import { H } from '@highlight-run/node'
import { default as createNextServer } from 'next'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlainObject<T = any> = { [key: string]: T }

// class used by `next` as a proxy to the real server; see
// https://github.com/vercel/next.js/blob/4443d6f3d36b107e833376c2720c1e206eee720d/packages/next/server/next.ts#L32
interface NextServer {
	server: Server
	createServer: (options: PlainObject) => Server
}

// `next`'s main server class; see
// https://github.com/vercel/next.js/blob/4443d6f3d36b107e833376c2720c1e206eee720d/packages/next/next-server/server/next-server.ts#L132
interface Server {
	dir: string
	publicDir: string
}

export const instrumentServer = () => {
	const nextServerPrototype = Object.getPrototypeOf(createNextServer({}))
	fill(
		nextServerPrototype,
		'getServerRequestHandler',
		makeWrappedHandlerGetter,
	)
}

let liveServer: Server
let instrumented = false

function makeWrappedHandlerGetter(origHandlerGetter: any): any {
	return async function (this: NextServer): Promise<any> {
		if (!instrumented) {
			// stash this in the closure so that `makeWrappedReqHandler` can use it
			liveServer = this.server
			const serverPrototype = Object.getPrototypeOf(liveServer)
			// Wrap as a way to grab the parameterized request URL to use as the transaction name for API requests and page
			// requests, respectively. These methods are chosen because they're the first spot in the request-handling process
			// where the parameterized path is provided as an argument, so it's easy to grab.
			fill(serverPrototype, 'ensureApiPage', wrap('ensureApiPage'))
			fill(
				serverPrototype,
				'findPageComponents',
				wrap('findPageComponents'),
			)

			instrumented = true
		}

		return origHandlerGetter.call(this)
	}
}

function wrap(name: string) {
	return function (origMethod: any): any {
		return async function (
			this: Server,
			parameterizedPath: string,
			...args: any[]
		): Promise<any> {
			const start = performance.now()
			const result = origMethod.call(this, parameterizedPath, ...args)
			const h = H.parseHeaders({})
			if (h?.secureSessionId) {
				H.recordMetric(
					h?.secureSessionId,
					name,
					performance.now() - start,
					parameterizedPath,
				)
			}
			return result
		}
	}
}

function fill(
	source: { [key: string]: any },
	name: string,
	replacementFactory: (...args: any[]) => any,
): void {
	if (!(name in source)) {
		return
	}

	const original = source[name] as () => any
	source[name] = replacementFactory(original)
}

// inspired by https://github.com/getsentry/sentry-javascript/blob/e1e5b4914324b23cf137553915ce47fb9406969a/packages/nextjs/src/utils/instrumentServer.ts
