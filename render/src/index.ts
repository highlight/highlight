import { APIGatewayEvent } from 'aws-lambda'
import { serialRender } from './serial'
import { readFileSync } from 'fs'
import { encodeGIF, encodeMP4 } from './ffmpeg'

interface Args {
	project?: string
	session?: string
	ts?: string
	chunk?: string
}

const screenshot = async (event?: APIGatewayEvent) => {
	const args = event?.queryStringParameters as unknown as Args | undefined
	const { files } = await serialRender(
		Number(args?.project),
		Number(args?.session),
		Number(args?.ts),
		undefined,
		args?.chunk?.length ? Number(args?.chunk) : undefined,
	)
	const file = readFileSync(files[0])
	return {
		statusCode: 200,
		isBase64Encoded: true,
		body: Buffer.from(file).toString('base64'),
		path: files[0],
		headers: {
			'content-type': 'image/png',
		},
	}
}

const gif = async (event?: APIGatewayEvent) => {
	const args = event?.queryStringParameters as unknown as Args | undefined
	const { dir } = await serialRender(
		Number(args?.project),
		Number(args?.session),
		undefined,
		1,
	)
	// const gif = await encodeGIF(dir)
	const mp4 = await encodeMP4(dir)
	console.log({ mp4 })

	const file = readFileSync(mp4)
	return {
		statusCode: 200,
		isBase64Encoded: true,
		body: Buffer.from(file).toString('base64'),
		path: gif,
		headers: {
			'content-type': 'video/mp4',
		},
	}
}

export const handler = (event?: APIGatewayEvent) => {
	const args = event?.queryStringParameters as unknown as Args | undefined
	if (!args?.ts) {
		return gif(event)
	}
	return screenshot(event)
}

if (process.env.DEV?.length) {
	screenshot({
		queryStringParameters: {
			project: '1',
			session: '239571781',
			ts: '1',
			chunk: '0',
		},
	} as unknown as APIGatewayEvent).then(console.info)
}
