import { GetStaticProps } from 'next'
import BlogPage from '../../components/Blog/BlogPage'
import { VALID_TAGS } from './tag/[tag]'
import matter from 'gray-matter'
import path from 'path'
import fs from 'fs'
import { Post, Author } from '../../components/Blog/BlogPost/BlogPost'
import { Tag } from '../../components/Blog/Tag'

export async function loadPostsFromGithub(): Promise<Post[]> {
	const blogDir = path.join(process.cwd(), 'blog-content')
	const files = fs.readdirSync(blogDir)
	const posts = []

	for (const file of files) {
		if (!file.endsWith('.md')) continue

		const filePath = path.join(blogDir, file)
		const content = fs.readFileSync(filePath, 'utf8')
		const { data, content: markdownContent } = matter(content)

		const tags = data.tags
			? data.tags
					.split(',')
					.map((tag: string) =>
						VALID_TAGS.find((t) => t.name === tag.trim()),
					)
					.filter((t: Tag | undefined): t is Tag => !!t)
			: []

		const author: Author | undefined = data.authorFirstName
			? {
					firstName: data.authorFirstName,
					lastName: data.authorLastName,
					title: data.authorTitle || '',
					twitterLink: data.authorTwitter || '',
					linkedInLink: data.authorLinkedIn || '',
					githubLink: data.authorGithub || '',
					personalWebsiteLink: data.authorWebsite || '',
					profilePhoto: {
						url: data.authorPFP || '',
					},
				}
			: undefined

		const post: Post = {
			title: data.title,
			description: data.description || '',
			tags,
			metaDescription: data.metaDescription || data.description || '',
			metaTitle: data.metaTitle || data.title || '',
			publishedAt: data.createdAt,
			postedAt: data.createdAt,
			readingTime: data.readingTime || 0,
			richcontent: {
				markdown: markdownContent,
			},
			publishedBy: {
				name: author ? `${author.firstName} ${author.lastName}` : '',
				picture: author?.profilePhoto.url || '',
			},
			image: {
				url: data.image || '',
			},
			youtubeVideoId: data.youtubeVideoId,
			author,
			slug: file.replace('.md', ''),
		}

		posts.push(post)
	}

	return posts
}

export const getStaticProps: GetStaticProps = async () => {
	let posts = await loadPostsFromGithub()
	posts.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))

	return {
		props: {
			posts,
			tags: VALID_TAGS,
			currentTagSlug: 'all',
		},
		revalidate: 60,
	}
}

export default BlogPage
