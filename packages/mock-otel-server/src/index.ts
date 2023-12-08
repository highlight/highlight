import express from 'express'
import zlib from 'zlib'

import {
	IExportTraceServiceRequest,
	IResourceSpans,
} from '@opentelemetry/otlp-transformer'

import {
	getExportRequestProto,
	ServiceClientType,
} from '@opentelemetry/otlp-proto-exporter-base/build/esm/index'

const DEFAULT_PORT = 3101
const RESOURCE_SPANS_BY_PORT = new Map<number, IResourceSpans[]>()
const shouldStart = !!process.argv.find((arg) => arg.includes('--start'))

if (shouldStart) {
	const portFlag =
		process.argv.find((arg) => arg.includes('--port')) ||
		`--port=${DEFAULT_PORT}`
	const port = +portFlag.split('=')[1]

	startMockOtelServer({ port })
}

export function startMockOtelServer({
	port = DEFAULT_PORT,
}: {
	port?: number
}) {
	const proto = getExportRequestProto(ServiceClientType.SPANS)
	const app = express()
	app.use(unzipBody)

	app.use((req, res, next) => {
		try {
			const trace = proto.decode(req.body) as IExportTraceServiceRequest

			if (trace.resourceSpans) {
				let resourceSpans = RESOURCE_SPANS_BY_PORT.get(port) || []

				resourceSpans.push(...trace.resourceSpans)

				RESOURCE_SPANS_BY_PORT.set(port, resourceSpans)

				/**
				 * Esplin 2023/12/8
				 *
				 * This is a load-bearing console.info. Removing it will cause tests to fail.
				 */
				console.info(
					`Received ${trace.resourceSpans.length} resource spans to port ${port}`,
				)
			}
		} catch (error) {
			console.error(error)
		}
		next()
	})

	const server = app.listen(port, () => {
		console.info(`Server is running on ${port}`)
	})

	return () => server.close()
}

export function getOtlpEndpoint(port = DEFAULT_PORT) {
	return `http://127.0.0.1:${port}`
}

export function getResourceSpans(
	expectedLength: number = 1,
	port = DEFAULT_PORT,
) {
	return new Promise<{
		details: ReturnType<typeof aggregateAttributes>
		resourceSpans: IResourceSpans[]
	}>((resolve, reject) => {
		const interval = setInterval(() => {
			const resourceSpans = RESOURCE_SPANS_BY_PORT.get(port) || []

			if (resourceSpans.length >= expectedLength) {
				clearInterval(interval)
				resolve({
					details: aggregateAttributes(resourceSpans),
					resourceSpans,
				})
			}
		}, 100)

		setTimeout(() => {
			clearInterval(interval)

			reject('getResourceSpans timed out')
		}, 5000)
	})
}

export function clearResourceSpans(port = DEFAULT_PORT) {
	RESOURCE_SPANS_BY_PORT.delete(port)
}

function unzipBody(
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) {
	if (req.headers['content-encoding'] === 'gzip') {
		const unzip = zlib.createGunzip()
		const stream = req.pipe(unzip)
		const buffers: Buffer[] = []

		stream.on('data', (chunk) => {
			buffers.push(chunk)
		})

		stream.on('end', () => {
			req.body = Buffer.concat(buffers)
			next()
		})
	} else {
		next()
	}
}

function aggregateAttributes(resourceSpans: IResourceSpans[]) {
	const aggregatedAttributes: {
		spanNames: string[]
		attributes: Record<string, string>
	}[] = []

	resourceSpans?.forEach((resourceSpan) => {
		const spanNames =
			resourceSpan.scopeSpans[0].spans?.map((span) => span.name) ?? []
		const attributes = resourceSpan.resource?.attributes.reduce<
			Record<string, string>
		>((acc, attribute) => {
			acc[attribute.key] =
				attribute.value.stringValue ||
				attribute.value.boolValue?.toString() ||
				attribute.value.intValue?.toString() ||
				attribute.value.arrayValue?.toString() ||
				''

			return acc
		}, {})

		attributes && aggregatedAttributes.push({ spanNames, attributes })
	})

	return aggregatedAttributes
}
