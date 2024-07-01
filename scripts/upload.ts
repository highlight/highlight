import {
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3'
import { exec } from 'child_process'
import * as fs from 'fs'
import { statSync } from 'fs'
import * as path from 'path'
import { dirname, join } from 'path'
import { gt, gte } from 'semver'
import { fileURLToPath } from 'url'
import yargs from 'yargs'

const S3_BUCKET = `highlight-client-bundle`
const FIRSTLOAD_PACKAGE_JSON = './sdk/firstload/package.json'
const DOCS_DIR = './docs'

const client = new S3Client({ region: 'us-east-2' })
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const docsDir = join(rootDir, DOCS_DIR)

const highlightRunPackageJson = JSON.parse(
	fs.readFileSync(join(rootDir, FIRSTLOAD_PACKAGE_JSON), {
		encoding: 'utf-8',
	}),
)

interface Options {
	workspace: string
	buildDir: string
	replace?: boolean
	validate?: boolean
	preview?: string
	has_sdk_changes?: boolean
}

const publish = async function (opts: Options) {
	const publishedVersion = (
		await new Promise<string>((r) =>
			exec(
				`npm show ${highlightRunPackageJson.name} version`,
				(_, stdout) => r(stdout),
			),
		)
	).split('\n')[0]!
	// if --validate, ensure that a new firstload version is created
	if (opts.validate) {
		if (opts.has_sdk_changes) {
			if (!gt(highlightRunPackageJson.version, publishedVersion)) {
				console.error(
					`Current highlight.run version ${highlightRunPackageJson.version} must be > published version ${publishedVersion}`,
				)
				process.exit(1)
			}
		} else {
			if (!gte(highlightRunPackageJson.version, publishedVersion)) {
				console.error(
					`Current highlight.run version ${highlightRunPackageJson.version} must be >= published version ${publishedVersion}`,
				)
				process.exit(1)
			}
		}
		if (!changelogExists(highlightRunPackageJson.version)) {
			console.error(
				`Current highlight.run version ${highlightRunPackageJson.version} must have a changelog in ${docsDir}`,
			)
			process.exit(1)
		}

		console.log(
			`Validated highlight.run package version ${highlightRunPackageJson.version}`,
		)
		process.exit(0)
	} else if (!opts.replace) {
		if (!gt(highlightRunPackageJson.version, publishedVersion)) {
			console.info(
				`Current highlight.run version ${highlightRunPackageJson.version} is <= published version ${publishedVersion}. Not uploading!`,
			)
			process.exit(0)
		}
	}

	const buildDir = join(opts.workspace, opts.buildDir)
	const promises = []
	for await (const file of getFiles(join(rootDir, buildDir))) {
		let version = `v${highlightRunPackageJson.version}`
		if (opts.preview) {
			version = `dev-${opts.preview}`
		}
		promises.push(upload(version, file, opts))
	}
	await Promise.all(promises)
}

const getFiles = async function* (
	dir: string,
): AsyncGenerator<string, void, void> {
	if (!statSync(dir).isDirectory()) {
		console.error('build directory is not valid')
		process.exit(1)
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

const changelogExists = function (version: string) {
	// no verification of changelogs for now
	return true
}

const upload = async function (
	version: string,
	fileAbsPath: string,
	opts: Options,
) {
	const fileRelPath = fileAbsPath
		.split(`${join(opts.workspace, opts.buildDir)}/`)
		.pop()!
	const key = `${version}/${fileRelPath}`

	// if --no-replace, check that the files do not exist
	if (!opts.replace) {
		const get = new GetObjectCommand({
			Bucket: S3_BUCKET,
			Key: key,
		})
		let exists = false
		try {
			await client.send(get)
			exists = true
		} catch (e: any) {
			if (e.name === 'NoSuchKey' || e.name === 'AccessDenied') {
				exists = false
			} else {
				throw e
			}
		}
		if (exists) {
			console.error(`File ${key} already exists!`)
			process.exit(1)
		}
	}

	const put = new PutObjectCommand({
		Bucket: S3_BUCKET,
		Key: key,
		Body: fs.readFileSync(fileAbsPath),
		CacheControl: 'public, immutable, max-age=31536000',
		ContentType: 'application/javascript',
	})
	await client.send(put)
	console.log(`Uploaded ${key}`)
}

await yargs(process.argv.slice(2))
	.command(
		'publish <workspace>',
		'Publish client bundle to static.highlight.io',
		{},
		// @ts-ignore-error
		publish,
	)
	.option('buildDir', {
		type: 'string',
		describe: 'the build directory in the workspace',
		default: 'dist',
	})
	.option('preview', { type: 'string', describe: 'the preview version' })
	.boolean('replace')
	.boolean('validate')
	.boolean('has-sdk-changes')
	.help('help').argv
