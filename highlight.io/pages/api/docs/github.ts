import yaml from 'js-yaml'
import path from 'path'

// ignored files from docs
export const IGNORED_DOCS_PATHS = new Set<string>([
	'.git',
	'.github',
	'.gitignore',
	'.husky',
	'.vscode',
	'.prettierrc',
	'node_modules',
	'package.json',
	'yarn.lock',
	'CHANGELOG.md',
	'CODE_OF_CONDUCT.md',
	'CONTRIBUTING.md',
	'LICENSE',
	'README.md',
	'SECURITY.md',
])

const token = process.env.GITHUB_TOKEN
const githubHeaders = {
	accept: 'application/vnd.github+json',
	authorization: `Bearer ${token}`,
}

type GithubTree = {
	name: string
	path: string
	sha: string
	size: number
	url: string
	html_url: string
	git_url: string
	_links: {
		self: string
		git: string
		html: string
	}
} & (
	| {
			type: 'dir'
			download_url: null
	  }
	| {
			type: 'file'
			download_url: string
			content: string
			encoding: 'base64'
	  }
)

interface DocMeta {
	title: string
	slug: string
	createdAt: string
	updatedAt: string
}

export const removeOrderingPrefix = (path: string) => {
	const arrayPath = path.split('/')
	const cleanPath = arrayPath.map((p) => {
		const prefixLocation = p.indexOf('_')
		return prefixLocation === -1 ? p : p.slice(prefixLocation + 1)
	})
	return cleanPath.join('/')
}

export const processDocPath = function (
	base: string,
	fileString: string,
): string {
	const simple_path = path.join(base, fileString)
	let pp: string
	if (fileString.includes('index.md')) {
		// index.md contains the title of a subheading, which can't have content. get rid of "index.md" at the end
		pp = simple_path.split('/').slice(0, -1).join('/')
	} else {
		// strip out any notion of ".md"
		pp = simple_path.replace('.md', '')
		const pp_array = pp.split('/')
	}
	return removeOrderingPrefix(pp)
}

export const getGithubDocsPaths = async (path: string = 'docs-content/') => {
	const url = `https://api.github.com/repos/highlight/highlight/contents/${path}`
	const response = await fetch(url, {
		headers: githubHeaders,
	})
	const json = (await response.json()) as GithubTree[]
	const childPromises = []
	let docs = new Map<string, DocMeta>()
	if (!json?.length) return docs
	for (const path of json) {
		if (IGNORED_DOCS_PATHS.has(path.path)) {
			continue
		}
		if (path.type === 'dir') {
			childPromises.push(getGithubDocsPaths(path.path))
		} else if (path.type === 'file') {
			childPromises.push(
				(async () => {
					const slug = processDocPath('', path.path)
					const file = await fetch(path.download_url, {
						headers: { ...githubHeaders, accept: '' },
					})
					const text = await file.text()
					const sections = text.split('---')
					docs.set(
						slug,
						yaml.load(sections[1], {
							schema: yaml.JSON_SCHEMA,
						}) as DocMeta,
					)
				})(),
			)
		}
	}
	for (const childDocs of await Promise.all(childPromises)) {
		if (childDocs) {
			for (const [path, doc] of childDocs.entries()) {
				docs.set(path, doc)
			}
		}
	}
	return docs
}

export const getGithubDoc = async (
	slug: string,
): Promise<{
	meta: DocMeta
	content: string
} | null> => {
	const response = await fetch(
		`https://api.github.com/repos/highlight/highlight/contents/docs-content/${slug}.md`,
		{
			headers: githubHeaders,
		},
	)
	if (response.ok) {
		const json = (await response.json()) as GithubTree
		if (json.type === 'file') {
			const text = new Buffer(json.content, json.encoding).toString(
				'ascii',
			)
			const sections = text.split('---')
			return {
				meta: yaml.load(sections[1], {
					schema: yaml.JSON_SCHEMA,
				}) as DocMeta,
				content: sections[2],
			}
		} else {
			throw Error(`slug ${slug} is a directory; expected a file`)
		}
	} else if (!slug.endsWith('/index')) {
		return getGithubDoc(`${slug}/index`)
	} else {
		return null
	}
}
