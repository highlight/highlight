import type { APIGatewayEvent } from 'aws-lambda'
import { readFileSync } from 'fs'
import { encodeGIF } from './ffmpeg'
import { getSessionSecureID } from './pg'
import { getRenderExport, uploadRenderExport } from './s3'
import { serialRender } from './serial'

interface Args {
	project?: string
	session?: string
	format?: string
	chunk?: string
	ts?: string
	tsEnd?: string
}

const screenshot = async (args?: Args) => {
	const { files } = await serialRender(
		Number(args?.project),
		Number(args?.session),
		{
			ts: Number(args?.ts),
			tsEnd: Number(args?.ts),
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

const media = async (args?: Args) => {
	const { project, session, format, ts, tsEnd } = {
		project: Number(args?.project),
		session: Number(args?.session),
		format: args?.format ?? 'video/mp4',
		ts: args?.ts ? Number(args.ts) : undefined,
		tsEnd: args?.tsEnd ? Number(args.tsEnd) : undefined,
	}
	let sessionSecureID = await getSessionSecureID(session)
	let key = await getRenderExport(project, session, format, ts, tsEnd)
	if (key === undefined) {
		const { dir, files } = await serialRender(project, session, {
			ts,
			tsEnd,
			fps: 60,
			video: args?.format === 'video/mp4',
		})
		let path = ''
		if (args?.format === 'image/gif') {
			path = await encodeGIF(dir ?? '')
		} else {
			path = files[0]
		}
		key = await uploadRenderExport(
			project,
			sessionSecureID,
			format,
			path,
			ts,
			tsEnd,
		)
	}

	return {
		statusCode: 200,
		body: key,
	}
}

export const handler = (event?: APIGatewayEvent) => {
	let args = event?.queryStringParameters as unknown as Args | undefined
	if (args?.session === undefined) {
		args = event as unknown as Args | undefined
	}
	if (args?.format === 'image/gif' || args?.format === 'video/mp4') {
		return media(args)
	}
	return screenshot(args)
}

if (process.env.DEV?.length) {
	await Promise.all([
		handler({
			queryStringParameters: {
				format: 'video/mp4',
				project: '1',
				session: '617599894',
			},
		} as unknown as APIGatewayEvent),
	])
}
