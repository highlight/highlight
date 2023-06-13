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
	)
	const gif = await encodeGIF(dir)
	const mp4 = await encodeMP4(dir)
	console.log({ gif, mp4 })

	const file = readFileSync(gif)
	return {
		statusCode: 200,
		isBase64Encoded: true,
		body: Buffer.from(file).toString('base64'),
		path: gif,
		headers: {
			'content-type': 'image/gif',
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
			project: '122',
			session: '33249578',
			ts: '208392',
			chunk: '3',
		},
	} as unknown as APIGatewayEvent).then(console.info)
}
