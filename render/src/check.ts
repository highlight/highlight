import { exec as execAsync } from 'child_process'
import * as util from 'util'
const exec = util.promisify(execAsync)

const unzippedSizeLimitBytes = 123213184
const unzippedSizeLimitMB = 123213184 / (1024 * 1024)

let unzippedSizeBytes = unzippedSizeLimitBytes + 1
// we must unzip the lambda code payload before checking the size
// because AWS lambda sets a limit on the unzipped payload, rather than the zip size.
try {
	await exec(
		'mkdir out && cp function.zip out && cd out && unzip -q function.zip && rm function.zip',
	)
	const { stdout } = await exec('du -b -d0 out')
	unzippedSizeBytes = Number(stdout.split('\t')[0])
} finally {
	await exec('rm -rf out')
}

const unzippedSizeMB = unzippedSizeBytes / (1024 * 1024)
if (unzippedSizeBytes >= unzippedSizeLimitBytes) {
	console.error(
		`zipped file too large at ${unzippedSizeMB} MB >= ${unzippedSizeLimitMB} MB.`,
	)
	process.exit(1)
} else {
	console.log(
		`unzipped file ok at ${unzippedSizeMB} MB < ${unzippedSizeLimitMB} MB`,
	)
}
