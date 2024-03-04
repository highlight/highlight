import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { NodeHttpHandler } from '@aws-sdk/node-http-handler'
import * as https from 'https'
import { Readable } from 'stream'
import zlib from 'zlib'

const east_client = new S3Client({
	region: 'us-east-2',
	requestHandler: new NodeHttpHandler({
		socketTimeout: 10000,
		connectionTimeout: 5000,
		httpsAgent: new https.Agent({ secureProtocol: 'TLSv1_2_method' }),
	}),
	maxAttempts: 2,
})

export async function compressedStreamToString(
	stream: Readable,
): Promise<string> {
	return await new Promise((resolve, reject) => {
		const chunks: Uint8Array[] = []
		stream.on('data', (chunk) => chunks.push(chunk as Uint8Array))
		stream.on('error', reject)
		stream.on('end', () =>
			resolve(
				zlib
					.brotliDecompressSync(Buffer.concat(chunks))
					.toString('utf-8'),
			),
		)
	})
}

export async function getEvents(
	project: number,
	session: number,
	chunk?: number,
) {
	let key = `v2/${project}/${session}/session-contents-compressed`
	if (chunk !== undefined) {
		key = `${key}-${chunk.toString().padStart(4, '0')}`
	}
	const command = new GetObjectCommand({
		Bucket: 'highlight-session-data',
		Key: key,
	})
	const response = await east_client.send(command)
	if (!response.Body) {
		throw new Error(`no body downloaded from s3 for ${key}`)
	}
	return await compressedStreamToString(response.Body as Readable)
}
