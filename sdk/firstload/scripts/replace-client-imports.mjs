import * as fs from 'node:fs'
import * as path from 'node:path'
import readdirp from 'readdirp'

const workingDirectory = path.join(process.cwd(), './dist/firstload')
const clientDirectory = path.join(process.cwd(), './dist/client')

const files = await readdirp.promise(workingDirectory, {
	fileFilter: '**/**.d.ts',
})

const text = ` from '@highlight-run/client/`
await Promise.all(
	files.map(async ({ fullPath }) => {
		const content = await fs.promises.readFile(fullPath, 'utf-8')

		if (!content.includes(text)) return

		return fs.promises.writeFile(
			fullPath,
			content.replaceAll(
				text,
				` from '${path.relative(
					path.dirname(fullPath),
					clientDirectory,
				)}/`,
			),
		)
	}),
)
