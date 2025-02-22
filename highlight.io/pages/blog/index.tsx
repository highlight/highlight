import { promises as fsp } from 'fs'
import { Post } from '../../components/Blog/BlogPost/BlogPost'
import { Tag } from '../../components/Blog/Tag'
import { GetStaticProps } from 'next'
import { BLOG_CONTENT_PATH, getBlogPaths } from '../../shared/blog'
import { readMarkdown } from '../../shared/doc'
import { VALID_TAGS } from './tag/[tag]'
import BlogPage from '../../components/Blog/BlogPage'

export async function loadPostsFromGithub() {
	let paths = await getBlogPaths(fsp, '')
	let posts: Post[] = []
	for (let index = 0; index < paths.length; index++) {
		const data = await readMarkdown(
			fsp,
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

export const getStaticProps: GetStaticProps = async () => {
	let posts = await loadPostsFromGithub()

	posts = posts
		.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
		.map((a) => {
			if (new Date().getTime() - Date.parse(a.postedAt) < 0) {
				console.log('hiding future post', {
					slug: a.slug,
					postedAt: a.postedAt,
					parsed: Date.parse(a.postedAt),
				})
			}
			return a
		})
		.filter((a) => new Date().getTime() - Date.parse(a.postedAt) >= 0)

	return {
		props: {
			posts,
			tags: VALID_TAGS,
			currentTagSlug: '',
		},

		revalidate: 60 * 60,
	}
}

export default BlogPage
