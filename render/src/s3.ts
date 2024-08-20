import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { readFileSync, statSync } from 'fs'
import { Readable } from 'stream'
import * as zlib from 'zlib'

const DATA_BUCKET = 'highlight-session-data'
const RENDER_BUCKET = 'highlight-session-render'

const east_client = new S3Client({
	region: 'us-east-2',
	maxAttempts: 5,
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
		Bucket: DATA_BUCKET,
		Key: key,
	})
	const response = await east_client.send(command)
	if (!response.Body) {
		throw new Error(`no body downloaded from s3 for ${key}`)
	}
	return await compressedStreamToString(response.Body as Readable)
}

export async function getRenderExport(
	project: number,
	session: number,
	format: string,
	ts?: number,
	tsEnd?: number,
) {
	const ext = format.split('/').pop()
	let key = `${project}/${session}${ts ? '-' : ''}${ts ?? ''}${
		tsEnd ? '-' : ''
	}${tsEnd ?? ''}.${ext}`
	const command = new GetObjectCommand({
		Bucket: RENDER_BUCKET,
		Key: key,
	})
	try {
		const response = await east_client.send(command)
		if (response?.ContentLength ?? 0 > 0) {
			return `https://highlight-session-render.s3.us-east-2.amazonaws.com/${key}`
		}
	} catch (e) {}
}

export async function uploadRenderExport(
	project: number,
	sessionSecureID: string,
	format: string,
	localPath: string,
	ts?: number,
	tsEnd?: number,
) {
	const stat = statSync(localPath)
	console.log(`uploading file ${localPath} size ${stat.size}`)
	const ext = format.split('/').pop()
	let key = `${project}/${sessionSecureID}${ts ? '-' : ''}${ts ?? ''}${
		tsEnd ? '-' : ''
	}${tsEnd ?? ''}.${ext}`
	const command = new PutObjectCommand({
		Bucket: RENDER_BUCKET,
		Key: key,
		Body: Buffer.from(readFileSync(localPath)),
		ContentType: format,
	})
	await east_client.send(command)
	return `https://highlight-session-render.s3.us-east-2.amazonaws.com/${key}`
}
