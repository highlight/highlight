import { exec as execAsync } from 'child_process'
import * as util from 'util'
const exec = util.promisify(execAsync)

const BUCKET = 'highlight-frontend'
const DISTRIBUTION = 'ERPS6ET782WO1'

const isPreview = process.env['PREVIEW'] === 'true'
const gitSHA = process.env['GIT_SHA']

let targetDir = ``
if (isPreview) {
	targetDir = `/preview/${gitSHA}`
}

try {
	console.log('Publishing frontend bundle', {
		isPreview,
		gitSHA,
		path: targetDir,
	})
	{
		const { stdout, stderr } = await exec(
			`aws s3 cp --recursive build s3://${BUCKET}${targetDir}`,
		)
		console.log('Published', { stdout, stderr })
	}
	{
		const { stdout, stderr } = await exec(
			`aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION} --paths '${targetDir}/*'`,
		)
		console.log('Cache invalidated', { stdout, stderr })
	}
} catch (e) {
	console.error(e)
	process.exit(1)
}
