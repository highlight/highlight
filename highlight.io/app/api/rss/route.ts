import { promises as fsp } from 'fs'
import { getBlogPaths } from '../../../shared/blog'
import fm from 'front-matter'
import { withAppRouterHighlight } from '../../../highlight.app.config'
import path from 'path'

async function generateRSSXML(): Promise<string> {
	const githubBlogPosts = await getBlogPaths(fsp, '')
	const blogPosts = await Promise.all(
		githubBlogPosts.map(async (page) => {
			const content = await fsp.readFile(
				path.join(
					process.cwd(),
					'../blog-content',
					page.simple_path + '.md',
				),
				'utf-8',
			)

			/**
			 * Example:
			 *
			 *     title: 'Maximizing Our Machines: Worker Pools At Highlight',
			 *     createdAt: 2022-08-04T12:00:00.000Z,
			 *     readingTime: 3,
			 *     authorFirstName: 'Cameron',
			 *     authorLastName: 'Brill',
			 *     authorTitle: 'Software Engineer',
			 *     authorTwitter: 'https://twitter.com/c00brill',
			 *     authorLinkedIn: 'https://www.linkedin.com/in/cameronbrill/',
			 *     authorGithub: 'https://github.com/cameronbrill',
			 *     authorWebsite: 'https://www.cameronbrill.me/',
			 *     authorPFP: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FHj9YMnNCSUGwgR7KF3Cd&w=3840&q=75',
			 *     image: 'https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FXmbzglNdRhezMtFLt9TL&w=3840&q=75',
			 *     tags: 'Engineering',
			 *     metaTitle: 'How-To: Use Worker Pools To Scale Customer Requests Fast'
			 */
			const { attributes, body } = fm<{
				date: string
				authorFirstName: string
				authorLastName: string
				authorTitle: string
				authorTwitter: string
				authorLinkedIn: string
				authorGithub: string
				authorWebsite: string
				authorPFP: string
				title: string
				description: string
				image: string
				tags: string
			}>(content)

			return {
				date: attributes.date,
				author:
					attributes.authorFirstName +
					' ' +
					attributes.authorLastName,
				title: attributes.title,
				description: attributes.description,
				image: attributes.image,
				content: body,
				tags: attributes.tags.split(','),
				path: page.simple_path.split('/').pop()?.replace('.md', ''),
			}
		}),
	)

	const items = blogPosts
		.map((post) => {
			const date = new Date(post.date)
			const pubDate = !isNaN(date.getTime())
				? date.toUTCString()
				: new Date().toUTCString()

			const link = safeURL(`${baseURL}/blog/${post.path}`)
			const imageUrl = post.image ? safeURL(post.image) : ''

			const categories = post.tags
				? post.tags
						.map(
							(tag) =>
								`<category>${escapeXML(tag.trim())}</category>`,
						)
						.join('')
				: ''

			const authorEmail = post.author
				? `${escapeXML(post.author.replace(/\s+/g, '.').toLowerCase())}@highlight.io`
				: 'team@highlight.io'

			return `<item><title><![CDATA[${post.title || ''}]]></title><link>${link}</link><guid isPermaLink="true">${link}</guid><pubDate>${pubDate}</pubDate><description><![CDATA[${post.description || ''}]]></description><author>${authorEmail} (${post.author || 'Highlight.io Team'})</author>${categories}${imageUrl ? `<enclosure url="${imageUrl}" length="0" type="image/jpeg"/>` : ''}</item>`
		})
		.join('')

	return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Highlight.io Blog</title><link>${blogURL}</link><atom:link href="${rssURL}" rel="self" type="application/rss+xml"/><description>The latest updates from Highlight.io</description><language>en-US</language>${items}</channel></rss>`
}

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export const GET = withAppRouterHighlight(async function GET() {
	return new Response(await generateRSSXML(), {
		headers: {
			'Content-Type': 'text/xml',
			'Cache-control': 'stale-while-revalidate, s-maxage=3600',
		},
		status: 200,
	})
})

const safeURL = (url: string) => {
	if (!url) return ''

	// Basic XML character escaping
	const escapeChars = (str: string) =>
		str
			.replace(/&/g, '&amp;')
			.replace(/'/g, '&apos;')
			.replace(/"/g, '&quot;')

	try {
		let finalUrl = url

		// Handle relative URLs first
		if (url.startsWith('/')) {
			finalUrl = `${baseURL}${url}`
		}

		// Parse URL only once
		const urlObj = new URL(finalUrl)

		// Handle different URL types
		if (urlObj.pathname.includes('_next/image')) {
			const originalUrl = urlObj.searchParams.get('url')
			if (originalUrl) {
				return escapeChars(decodeURIComponent(originalUrl))
			}
		}

		if (urlObj.hostname === 'media.graphassets.com') {
			urlObj.search = ''
		}

		return escapeChars(urlObj.toString())
	} catch {
		// For unparseable URLs, just escape the original
		if (url.startsWith('/')) {
			return escapeChars(`${baseURL}${url}`)
		}
		return escapeChars(url)
	}
}

const escapeXML = (str: string) => {
	if (!str) return ''
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
		.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

const baseURL = process.env.WEBSITE_URL ?? 'https://www.highlight.io'
const rssURL = safeURL(`${baseURL}/blog/rss.xml`)
const blogURL = safeURL(`${baseURL}/blog`)
