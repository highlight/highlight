import {
	PutObjectCommand,
	GetObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import * as fs from 'fs'
import { statSync } from 'fs'
import * as path from 'path'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const S3_BUCKET = `highlight-client-bundle`
const CLIENT_ROOT_REL = '../..'
const FIRSTLOAD_PACKAGE_JSON = '../../../firstload/package.json'
const BUILD_DIR = `dist`
const BUILD_DIR_REL = `${CLIENT_ROOT_REL}/${BUILD_DIR}`

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientDir = join(__dirname, CLIENT_ROOT_REL)

const client = new S3Client({ region: 'us-east-2' })

const highlightRunPackageJson = JSON.parse(
	fs.readFileSync(join(__dirname, FIRSTLOAD_PACKAGE_JSON), {
		encoding: 'utf-8',
	}),
)

const publish = async function () {
	const promises = []
	for await (const file of getFiles(join(__dirname, BUILD_DIR_REL))) {
		promises.push(upload(highlightRunPackageJson.version, file))
	}
	await Promise.all(promises)
}

const getFiles = async function* (
	dir: string,
): AsyncGenerator<string, void, void> {
	if (!statSync(dir).isDirectory()) {
		throw new Error('build directory is not valid')
	}
	for (const d of fs.readdirSync(dir)) {
		const filePath = path.join(dir, d)
		const stat = fs.statSync(filePath)
		if (stat.isFile()) {
			yield filePath
		} else if (stat.isDirectory()) {
			yield* getFiles(filePath)
		}
	}
}

const upload = async function (version: string, fileAbsPath: string) {
	let fileRelPath = fileAbsPath.split(clientDir).pop()!
	fileRelPath = fileRelPath.split(`${BUILD_DIR}/`).pop()!
	const key = `v${version}/${fileRelPath}`

	const get = new GetObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
	})
	let exists = false
	try {
		await client.send(get)
		exists = true
	} catch (e: any) {
		if (e.name === 'NoSuchKey') {
			exists = false
		} else {
			throw e
		}
	}
	if (exists) {
		throw new Error(`File ${key} already exists!`)
	}

	const put = new PutObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
		Body: fs.readFileSync(fileAbsPath),
	})
	await client.send(put)
	console.log(`Uploaded ${key}`)
}

await publish()
