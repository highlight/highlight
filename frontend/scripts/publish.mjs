import { exec as execAsync } from 'child_process'
import * as util from 'util'
const exec = util.promisify(execAsync)

const isPreview = process.env['PREVIEW'] === 'true'
const gitSHA = process.env['GIT_SHA']

try {
	let path = `s3://highlight-frontend`
	if (isPreview) {
		path = `${path}/preview/${gitSHA}`
	}
	console.log('Publishing frontend bundle', { isPreview, gitSHA, path })
	await exec(`aws s3 cp --recursive build ${path}`)
} catch (e) {
	console.error(e)
	process.exit(1)
}
