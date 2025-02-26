import { promises as fsp } from 'fs'
import path from 'path'
import { readMarkdown, removeOrderingPrefix } from './doc'
import { Post } from '../components/Blog/BlogPost/BlogPost'
import { Tag } from '../components/Blog/Tag'

export const VALID_TAGS: Tag[] = [
	{
		name: 'All',
		slug: 'all',
		description:
			'Explore the latest insights on frontend engineering, observability, and developer tools from the Highlight engineering team. Learn best practices, tips, and industry trends.',
	},
	{
		name: 'Engineering',
		slug: 'engineering',
		description:
			'In-depth technical articles covering system architecture, scalability solutions, performance optimization, and engineering best practices. Learn from real-world implementations and expert insights.',
	},
	{
		name: 'Frontend',
		slug: 'frontend',
		description:
			'Master frontend development with guides on React, Next.js, performance optimization, debugging tools, and modern web development techniques. Improve your web applications with expert tips.',
	},
	{
		name: 'Backend',
		slug: 'backend',
		description:
			'Expert insights on backend development, including distributed systems design, database optimization, API development, and scalable architecture patterns. Learn modern backend engineering practices.',
	},
	{
		name: 'Observability',
		slug: 'observability',
		description:
			'Learn about modern observability practices including monitoring, logging, tracing, and debugging production systems. Master tools and techniques for maintaining reliable applications.',
	},
	{
		name: 'OpenTelemetry',
		slug: 'opentelemetry',
		description:
			'Comprehensive guides on implementing OpenTelemetry for application monitoring, distributed tracing, and observability. Learn integration patterns, best practices, and practical use cases.',
	},
	{
		name: 'Product Updates',
		slug: 'product-updates',
		description:
			'Stay up to date with the latest Highlight platform features, improvements, and product announcements. Discover new tools and capabilities to enhance your development workflow.',
	},
	{
		name: 'Developer Experience',
		slug: 'developer-experience',
		description:
			'Discover tools, workflows, and best practices that enhance developer productivity and code quality. Learn about modern development environments, testing strategies, and automation techniques.',
	},
	{
		name: 'Company',
		slug: 'company',
		description:
			'Get to know the Highlight team, our culture, and our mission. Read about company news, events, engineering culture, and our journey building developer tools.',
	},
] as const

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
	tags: string[]
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
				tags: data.tags || [],
			})
		}
	}
	return paths
}

export async function loadPostsFromGithub(fs_api?: any) {
	let paths = await getBlogPaths(fs_api ?? fsp, '')
	let posts: Post[] = []
	for (let index = 0; index < paths.length; index++) {
		const data = await readMarkdown(
			fs_api ?? fsp,
			BLOG_CONTENT_PATH + paths[index].rel_path,
		)
		const posty = markdownToPost(data.content, data.data)
		posty.slug = paths[index].rel_path.split('/').at(-1)?.replace('.md', '')
		posts.push(posty)
	}

	return posts
}

export function markdownToPost(
	content: string,
	data: {
		[key: string]: any
	},
): Post {
	let tags: Tag[] = []

	if (data.tags) {
		data.tags.split(',').forEach((tag: string) => {
			const tempTag = VALID_TAGS.find((t) => t.name === tag.trim())

			if (tempTag) {
				tags.push(tempTag)
			} else {
				throw new Error(
					`Invalid tag: ${tag} - see VALID_TAGS for details`,
				)
			}
		})
	} else {
		throw new Error(
			`Tags are required, but none found for post: ${data.title}`,
		)
	}

	let post: Post = {
		title: data.title,
		description: data.description || null,
		tags,
		metaDescription: data.metaDescription || data.description || null,
		metaTitle: data.metaTitle || data.title || null,
		publishedAt: data.createdAt,
		postedAt: data.createdAt || new Date().toISOString(),
		readingTime: data.readingTime || '12',
		richcontent: {
			markdown: content,
		},
		publishedBy: {
			name: data.authorFirstName + ' ' + data.authorLastName,
			picture: data.authorPFP || null,
		},
		image: {
			url: data.image || null,
		},
		youtubeVideoId: data.youtubeVideoId || null,
		author: {
			firstName: data.authorFirstName,
			lastName: data.authorLastName,
			title: data.authorTitle,
			twitterLink: data.authorTwitter,
			linkedInLink: data.authorLinkedIn,
			githubLink: data.authorGithub,
			personalWebsiteLink: data.authorWebsite,
			profilePhoto: {
				url: data.authorPFP || null,
			},
		},
	}

	return post
}
