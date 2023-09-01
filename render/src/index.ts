import type { APIGatewayEvent } from 'aws-lambda'
import { serialRender } from './serial'
import { readFileSync } from 'fs'
import { encodeGIF } from './ffmpeg'
import { getRenderExport, uploadRenderExport } from './s3'
import { saveSessionScreenshot } from './pg'

interface Args {
	project?: string
	session?: string
	ts?: string
	tsEnd?: string
	chunk?: string
	format?: string
}

const screenshot = async (event?: APIGatewayEvent) => {
	const args = event?.queryStringParameters as unknown as Args | undefined
	const { files } = await serialRender(
		Number(args?.project),
		Number(args?.session),
		{
			ts: Number(args?.ts),
			chunk: args?.chunk?.length ? Number(args?.chunk) : undefined,
		},
	)
	return {
		statusCode: 200,
		isBase64Encoded: true,
		body: Buffer.from(readFileSync(files[0])).toString('base64'),
		path: files[0],
		headers: {
			'content-type': 'image/png',
		},
	}
}

const media = async (event?: APIGatewayEvent) => {
	const args = event?.queryStringParameters as unknown as Args | undefined
	const { project, session, format, ts, tsEnd } = {
		project: Number(args?.project),
		session: Number(args?.session),
		format: args?.format ?? 'video/mp4',
		ts: args?.ts ? Number(args.ts) : undefined,
		tsEnd: args?.tsEnd ? Number(args.tsEnd) : undefined,
	}
	let key = await getRenderExport(project, session, format, ts, tsEnd)
	if (key === undefined) {
		try {
			const { dir, files } = await serialRender(project, session, {
				ts,
				tsEnd,
				fps: 60,
				video: args?.format === 'video/mp4',
			})
			let path = ''
			if (args?.format === 'image/gif') {
				path = await encodeGIF(dir)
			} else {
				path = files[0]
			}
			key = await uploadRenderExport(
				project,
				session,
				format,
				path,
				ts,
				tsEnd,
			)
			await saveSessionScreenshot(session, key)
		} catch (e) {
			// TODO(vkorolik) save error
			await saveSessionScreenshotError(session, e)
		}
	}

	return {
		statusCode: 200,
		body: key,
	}
}

export const handler = (event?: APIGatewayEvent) => {
	const args = event?.queryStringParameters as unknown as Args | undefined
	if (args?.format === 'image/gif' || args?.format === 'video/mp4') {
		return media(event)
	}
	return screenshot(event)
}

if (process.env.DEV?.length) {
	await Promise.all([
		handler({
			queryStringParameters: {
				project: '1',
				session: '239571781',
				ts: '1',
				chunk: '0',
			},
		} as unknown as APIGatewayEvent),
		handler({
			queryStringParameters: {
				format: 'image/gif',
				project: '1',
				session: '239571781',
				ts: '15000',
				tsEnd: '20000',
			},
		} as unknown as APIGatewayEvent),
		handler({
			queryStringParameters: {
				format: 'video/mp4',
				project: '1',
				session: '306361953',
			},
		} as unknown as APIGatewayEvent),
	])
}
