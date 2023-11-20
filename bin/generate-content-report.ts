import * as fs from 'fs'
import * as path from 'path'

/**
 * Esplin 2023.11.20
 * We have a problem with duplicate titles in our docs.
 * Delete this file whenever we've either refactored our docs
 * or settled into a better pattern for doc titles.
 */

const folderPath = path.resolve(__dirname, '../docs-content')

interface Frontmatter {
	filePath: string
	url: string
	localhost: string
	toc: string
	title: string
	heading: string
	keyValues: [string, string][]
}

function extractFrontmatterFromMarkdownFiles(
	folderPath: string,
): Frontmatter[] {
	const frontmatters: Frontmatter[] = []

	function crawlFolder(folderPath: string) {
		const files = fs.readdirSync(folderPath)

		files.forEach((file) => {
			const filePath = path.join(folderPath, file)
			const stats = fs.statSync(filePath)

			if (stats.isDirectory()) {
				crawlFolder(filePath)
			} else if (stats.isFile() && file.endsWith('.md')) {
				const content = fs.readFileSync(filePath, 'utf-8')
				const frontmatterRegex = /^---\n([\s\S]*?)\n---/
				const match = content.match(frontmatterRegex)
				const lines = match[1].split('\n')
				const keyValues = lines.map((line) =>
					line.split(':').map((s) => s.trim()),
				) as Frontmatter['keyValues']
				const url = filePath
					.replace(/\.md$/, '')
					.replace(/\d_/, '')
					.replace(/index$/g, '')
				const [, toc] = keyValues.find(([key]) => key === 'toc') || []
				const [, title] =
					keyValues.find(([key]) => key === 'title') || []
				const [, heading] =
					keyValues.find(([key]) => key === 'heading') || []

				frontmatters.push({
					filePath,
					url: url.replace(
						/^.+docs-content/,
						'https://www.highlight.io/docs',
					),
					localhost: url.replace(
						/^.+docs-content/,
						'http://localhost:4000/docs',
					),
					toc,
					title,
					heading,
					keyValues,
				})
			}
		})
	}

	crawlFolder(folderPath)

	return frontmatters
}

const frontmatters = extractFrontmatterFromMarkdownFiles(folderPath)
const frontmatterByTitles = frontmatters.reduce<Record<string, Frontmatter[]>>(
	(acc, frontmatter) => {
		const title = frontmatter.keyValues.find(
			([key]) => key === 'title',
		)?.[1]

		if (!acc[title]) {
			acc[title] = []
		}

		acc[title].push(frontmatter)

		return acc
	},
	{},
)
const sortedFrontmatterByTitles = Object.entries(frontmatterByTitles)
	.filter((entries) => entries[1].length > 1)
	.sort((a, b) => (a[1].length > b[1].length ? 1 : -1))
	.map(([title, frontmatters]) => ({
		title,
		filePaths: frontmatters.map(({ filePath }) => filePath),
	}))

fs.rmdirSync(path.resolve(__dirname, './reports'), { recursive: true })
fs.mkdirSync(path.resolve(__dirname, './reports'))

const duplicateTitlesFilepath = path.resolve(
	__dirname,
	'./reports/duplicate-title.json',
)
fs.writeFileSync(
	duplicateTitlesFilepath,
	JSON.stringify(sortedFrontmatterByTitles, null, 2),
)

console.info(`Duplicate titles report generated at ${duplicateTitlesFilepath}`)

const frontmatterFilepath = path.resolve(
	__dirname,
	'./reports/frontmatter.json',
)
fs.writeFileSync(
	frontmatterFilepath,
	JSON.stringify(
		frontmatters
			.sort((a, b) => (a.url.length < b.url.length ? -1 : 1))
			.map(({ keyValues: _, ...record }) => record),
		null,
		2,
	),
)

console.info(`Frontmatter report generated at ${frontmatterFilepath}`)
