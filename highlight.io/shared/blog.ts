import { promises as fsp } from 'fs'
import path from 'path'
import { readMarkdown, removeOrderingPrefix } from './doc'

export interface BlogPath {
	// e.g. '[tips, sessions-search-deep-linking.md]'
	array_path: string[]
	// e.g. 'tips/sessions-search-deep-linking.md'
	simple_path: string
	// e.g. '[/tips, /getting-started/client-sdk]'
	embedded_links: string[]
	// e.g. /Users/jaykhatri/projects/highlight-landing/s/tips/sessions-search-deep-linking.md
	total_path: string
	// e.g. 'tips/sessions-search-deep-linking.md'
	rel_path: string
	// whether the path has an index.md file in it or a "homepage" of some sort for that directory.
	indexPath: boolean
	// metadata stored at the top of each md file.
	metadata: any
	isSdkDoc: boolean
	content: string
}

export const BLOG_CONTENT_PATH = path.join(process.cwd(), '../blog-content')

export const getBlogPaths = async (
	fs_api: any,
	base: string | undefined,
): Promise<BlogPath[]> => {
	base = base ?? ''
	const full_path = path.join(BLOG_CONTENT_PATH, base)
	const read = await fs_api.readdir(full_path)
	let paths: BlogPath[] = []
	for (var i = 0; i < read.length; i++) {
		const file_string = read[i]
		let total_path = path.join(full_path, file_string)
		const file_path = await fs_api.stat(total_path)
		if (file_string.includes('README')) continue
		if (file_path.isDirectory()) {
			paths = paths.concat(
				await getBlogPaths(fs_api, path.join(base, file_string)),
			)
		} else {
			const simple_path = path.join(base, file_string)
			const pp = removeOrderingPrefix(simple_path.replace('.md', ''))
			const { data, links, content } = await readMarkdown(
				fsp,
				path.join(total_path || ''),
			)
			const hasRequiredMetadata = ['title'].every((item) =>
				data.hasOwnProperty(item),
			)
			if (!hasRequiredMetadata) {
				throw new Error(
					`${total_path} does not contain all required metadata fields. Fields "title" are required. `,
				)
			}
			paths.push({
				simple_path: pp,
				array_path: pp.split('/'),
				embedded_links: Array.from(links),
				total_path,
				isSdkDoc: pp.startsWith('sdk/'),
				rel_path: total_path.replace(BLOG_CONTENT_PATH, ''),
				indexPath: file_string.includes('index.md'),
				metadata: data,
				content: content,
			})
		}
	}
	return paths
}
