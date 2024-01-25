import matter from 'gray-matter'
import yaml from 'js-yaml'
import path from 'path'

export const parseMarkdown = (
	fileContents: string,
): { content: string; data: { [key: string]: any }; links: Set<string> } => {
	const { content, data } = matter(fileContents, {
		delimiters: ['---', '---'],
		engines: {
			yaml: (s: any) =>
				yaml.load(s, { schema: yaml.JSON_SCHEMA }) as Object,
		},
	})
	const regex = /(.)\[(.*?)\]\((.*?)\)/g
	const links = new Set<string>(
		[...content.matchAll(regex)]
			.filter((m) => m[1] !== '!')
			.map((m) => {
				return m[3]
			}),
	)

	return {
		content,
		data,
		links,
	}
}

export const readMarkdown = async (fs_api: any, filePath: string) => {
	const fileContents = await fs_api.readFile(path.join(filePath))
	return parseMarkdown(fileContents)
}

export const removeOrderingPrefix = (path: string) => {
	const arrayPath = path.split('/')
	const cleanPath = arrayPath.map((p) => {
		const prefixLocation = p.indexOf('_')
		return prefixLocation === -1 ? p : p.slice(prefixLocation + 1)
	})
	return cleanPath.join('/')
}
