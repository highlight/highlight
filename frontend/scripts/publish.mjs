import { exec as execAsync } from 'child_process'
import * as util from 'util'
const exec = util.promisify(execAsync)

const isPreview = process.env['PREVIEW'] === 'true'
const gitSHA = process.env['GIT_SHA']

const paths = [`s3://highlight-frontend`]
if (isPreview) {
	paths.push(`s3://highlight-frontend/preview/${gitSHA}`)
}

for (const path of paths) {
	try {
		console.log('Publishing frontend bundle', { isPreview, gitSHA, path })
		const { stdout, stderr } = await exec(
			`aws s3 cp --recursive build ${path}`,
		)
		console.log('Published', { stdout, stderr })
	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
