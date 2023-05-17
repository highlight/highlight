import * as fs from 'node:fs'
import * as path from 'node:path'

export const run = async ({ rootDirectory }) => {
	const packageJson = JSON.parse(
		await fs.promises.readFile(
			path.join(rootDirectory, 'package.json'),
			'utf-8',
		),
	)
	await fs.promises.mkdir(path.join(rootDirectory, 'src/__generated'), {
		recursive: true,
	})
	await fs.promises.writeFile(
		path.join(rootDirectory, 'src/__generated/version.ts'),
		`export default "${packageJson.version}"`,
	)
}
