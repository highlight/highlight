import { GetStaticProps } from 'next'
import { Tag } from '../../../components/Blog/Tag'
import BlogPage from '../../../components/Blog/BlogPage'
import { loadPostsFromGithub, VALID_TAGS } from '../../../shared/blog'

export async function getStaticPaths(): Promise<{
	paths: string[]
	fallback: string
}> {
	return {
		paths: VALID_TAGS.map((tag) => `/blog/tag/${tag.slug}`),
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	console.log('rendering blog tag posts', params)
	const { promises: fsp } = await import('fs')
	let posts = await loadPostsFromGithub(fsp)
	console.log('blog posts loaded', params)

	posts = posts.filter((post) => {
		return post.tags.some((tag: Tag) => {
			return tag.slug === (params!.tag as string)
		})
	})

	posts.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))

	return {
		props: {
			posts,
			tags: VALID_TAGS,
			currentTagSlug: params!.tag,
		},
		revalidate: 60,
	}
}

export default BlogPage
