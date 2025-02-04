import { GetStaticProps } from 'next'
import { Tag } from '../../../components/Blog/Tag'
import { loadPostsFromGithub } from '../index'
import BlogPage from '../../../components/Blog/BlogPage'

export const VALID_TAGS: Tag[] = [
	{
		name: 'All posts',
		slug: 'all',
		description:
			'Welcome to the Highlight Blog, where the Highlight team talks about frontend engineering, observability and more!',
	},
	{
		name: 'Engineering',
		slug: 'engineering',
		description:
			'Deep dives into technical implementations, architecture decisions, and engineering best practices.',
	},
	{
		name: 'Frontend',
		slug: 'frontend',
		description:
			'Everything about frontend development, monitoring, debugging, and performance optimization.',
	},
	{
		name: 'Backend',
		slug: 'backend',
		description:
			'Backend development, distributed systems, databases, and server-side optimizations.',
	},
	{
		name: 'Observability',
		slug: 'observability',
		description:
			'Monitoring, logging, tracing, and understanding system behavior in production.',
	},
	{
		name: 'OpenTelemetry',
		slug: 'opentelemetry',
		description:
			'Articles about OpenTelemetry integration, implementation, and best practices.',
	},
	{
		name: 'Product Updates',
		slug: 'product-updates',
		description:
			'New features, improvements, and major updates to the Highlight platform.',
	},
	{
		name: 'Developer Experience',
		slug: 'developer-experience',
		description:
			'Tools, workflows, and practices that improve the developer experience.',
	},
	{
		name: 'Company',
		slug: 'company',
		description:
			'Company news, culture, events, and behind-the-scenes at Highlight.',
	},
] as const

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
	let posts = await loadPostsFromGithub()

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
