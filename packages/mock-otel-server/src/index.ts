import express from 'express'
import zlib from 'zlib'

import {
	IEvent,
	IExportTraceServiceRequest,
	IResourceSpans,
	ISpan,
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
				const resourceSpans = getResourceSpansByPort(port)
				const spanNames = trace.resourceSpans.flatMap(
					(resourceSpan) =>
						resourceSpan.scopeSpans.flatMap((scopeSpan) =>
							scopeSpan.spans?.flatMap((span) => span.name),
						) ?? [],
				)

				resourceSpans.push(...trace.resourceSpans)

				setResourceSpansByPort(port, resourceSpans)
			}
		} catch (error) {
			console.error(error)
		}
		next()
	})

	app.post('/v1/traces', (req, res) => {
		res.status(200).send('OK')
	})

	const server = app.listen(port, () => {
		console.info(`Server is running on ${port}`)
	})

	return () => server.close()
}

export function getResourceSpans(port = DEFAULT_PORT, names: string[] = []) {
	return new Promise<{
		details: ReturnType<typeof aggregateAttributes>
		resourceSpans: IResourceSpans[]
	}>((resolve, reject) => {
		const interval = setInterval(() => {
			const resourceSpans = getResourceSpansByPort(port)
			const details = aggregateAttributes(resourceSpans)
			const hasSessionId = details.some(
				(detail) => detail.attributes['highlight.session_id'],
			)
			const hasName =
				!names.length ||
				details
					.flatMap((detail) => detail.events)
					.some((event) => names.includes(event.name))

			if (hasSessionId && hasName) {
				clearInterval(interval)

				resolve({ details, resourceSpans })
			}
		}, 250)
	})
}

export function clearResourceSpans(port = DEFAULT_PORT) {
	setResourceSpansByPort(port, [])
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
		events: IEvent[]
		attributes: Record<string, string>
	}[] = []

	resourceSpans?.forEach((resourceSpan) => {
		const filteredSpans = resourceSpan.scopeSpans
			.flatMap((scopeSpan) => scopeSpan.spans)
			.filter((span) => span?.name.includes('highlight')) as ISpan[]
		const spanNames = filteredSpans.map((span) => span.name)

		const resourceAttributes =
			resourceSpan.resource?.attributes.reduce<Record<string, string>>(
				(acc, attribute) => {
					acc[attribute.key] =
						attribute.value.stringValue ||
						attribute.value.boolValue?.toString() ||
						attribute.value.intValue?.toString() ||
						attribute.value.arrayValue?.toString() ||
						''

					return acc
				},
				{},
			) || {}
		const events = filteredSpans.flatMap((span) => span.events) as IEvent[]
		const attributes = events.reduce<Record<string, string>>(
			(acc, event) => {
				event.attributes.forEach((attribute) => {
					acc[attribute.key] =
						attribute.value.stringValue ||
						attribute.value.boolValue?.toString() ||
						attribute.value.intValue?.toString() ||
						attribute.value.arrayValue?.toString() ||
						''
				})

				return acc
			},
			resourceAttributes,
		)

		aggregatedAttributes.push({
			spanNames,
			attributes,
			events,
		})
	})

	return aggregatedAttributes
}

function getResourceSpansByPort(port = DEFAULT_PORT) {
	return RESOURCE_SPANS_BY_PORT.get(port) || []
}

function setResourceSpansByPort(port = DEFAULT_PORT, resourceSpans: any[]) {
	RESOURCE_SPANS_BY_PORT.set(port, resourceSpans)
}

export function getOtlpEndpoint(port = DEFAULT_PORT) {
	return `http://127.0.0.1:${port}`
}

export function filterEventsByName(
	details: ReturnType<typeof aggregateAttributes>,
	name: string,
) {
	const events = details.flatMap((detail) => detail.events)

	return events.filter((event) => event.name === name)
}

export function filterDetailsBySessionId(
	details: ReturnType<typeof aggregateAttributes>,
	sessionId: string,
) {
	return details.filter(
		(detail) => detail.attributes['highlight.session_id'] === sessionId,
	)
}

export function logDetails(
	details: Awaited<ReturnType<typeof getResourceSpans>>['details'],
) {
	console.info(details.flatMap((d) => d.spanNames))
	console.info(details.flatMap((d) => d.events.map((e) => e.name)))
}
