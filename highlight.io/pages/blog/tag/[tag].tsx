import { GetStaticProps } from 'next'
import { Tag } from '../../../components/Blog/Tag'
import { loadPostsFromGithub } from '../index'
import BlogPage from '../../../components/Blog/BlogPage'

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
