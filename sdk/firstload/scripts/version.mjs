import * as fs from 'node:fs'

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
fs.mkdirSync('src/__generated', { recursive: true })
fs.writeFileSync(
	'src/__generated/version.ts',
	`export default "${packageJson.version}"`,
)
