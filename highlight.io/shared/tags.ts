import { gql } from 'graphql-request'
import pino from 'pino'
import { stream } from '../app/api/sitemap/route'
import { Tag } from '../components/Blog/Tag'
import { GraphQLRequest } from '../utils/graphql'

export const VALID_TAGS: Record<string, Omit<Tag, 'posts'>> = {
	'All posts': {
		name: 'All posts',
		slug: 'all',
		description:
			'Welcome to the Highlight Blog, where the Highlight team talks about frontend engineering, observability and more!',
	},
	AI: {
		name: 'AI',
		slug: 'ai',
		description:
			'Exploring artificial intelligence applications in developer tools and observability.',
	},
	ClickHouse: {
		name: 'ClickHouse',
		slug: 'clickhouse',
		description:
			'Technical deep dives into our ClickHouse implementation and optimizations.',
	},
	'Debugging & Troubleshooting': {
		name: 'Debugging & Troubleshooting',
		slug: 'debugging-and-troubleshooting',
		description:
			'Tips, techniques, and tools for effective debugging and troubleshooting in modern web applications.',
	},
	Design: {
		name: 'Design',
		slug: 'design',
		description:
			'Insights into our design process, UI/UX decisions, and design system.',
	},
	'Developer Tooling': {
		name: 'Developer Tooling',
		slug: 'developer-tooling',
		description:
			'Exploring the latest in developer tools, productivity enhancements, and building better software.',
	},
	Development: {
		name: 'Development',
		slug: 'development',
		description:
			'General software development practices, patterns, and techniques.',
	},
	'.NET': {
		name: '.NET',
		slug: 'dotnet',
		description:
			'Development, monitoring, and observability in .NET applications.',
	},
	Edge: {
		name: 'Edge',
		slug: 'edge',
		description:
			'Edge computing, serverless, and edge runtime implementations.',
	},
	'Frontend Monitoring': {
		name: 'Frontend Monitoring',
		slug: 'frontend-monitoring',
		description:
			'Best practices for monitoring frontend applications, error tracking, and improving user experience.',
	},
	Grafana: {
		name: 'Grafana',
		slug: 'grafana',
		description:
			'Integration with Grafana for metrics visualization and dashboards.',
	},
	'Highlight Engineering': {
		name: 'Highlight Engineering',
		slug: 'highlight-engineering',
		description:
			'Deep dives into how we build and scale Highlight, our technical decisions, and lessons learned along the way.',
	},
	Java: {
		name: 'Java',
		slug: 'java',
		description:
			'Java development, monitoring, and observability best practices.',
	},
	'Launch Week 1': {
		name: 'Launch Week 1',
		slug: 'launch-week-1',
		description: 'Updates and announcements from our first Launch Week.',
	},
	'Launch Week 2': {
		name: 'Launch Week 2',
		slug: 'launch-week-2',
		description: 'Updates and announcements from our second Launch Week.',
	},
	'Launch Week 3': {
		name: 'Launch Week 3',
		slug: 'launch-week-3',
		description: 'Updates and announcements from our third Launch Week.',
	},
	'Launch Week 4': {
		name: 'Launch Week 4',
		slug: 'launch-week-4',
		description: 'Updates and announcements from our fourth Launch Week.',
	},
	'Launch Week 5': {
		name: 'Launch Week 5',
		slug: 'launch-week-5',
		description: 'Updates and announcements from our fifth Launch Week.',
	},
	Logging: {
		name: 'Logging',
		slug: 'logging',
		description:
			'Best practices and implementations for application logging.',
	},
	Mobile: {
		name: 'Mobile',
		slug: 'mobile',
		description:
			'Mobile development topics, focusing on monitoring and debugging mobile applications.',
	},
	Monitoring: {
		name: 'Monitoring',
		slug: 'monitoring',
		description:
			'General monitoring concepts, strategies, and best practices.',
	},
	'Next.js': {
		name: 'Next.js',
		slug: 'nextjs',
		description:
			'Next.js development, monitoring, and observability implementations.',
	},
	Observability: {
		name: 'Observability',
		slug: 'observability',
		description:
			'Understanding and implementing observability in modern applications.',
	},
	OpenTelemetry: {
		name: 'OpenTelemetry',
		slug: 'opentelemetry',
		description:
			'Everything about OpenTelemetry integration, implementation, and best practices.',
	},
	'Performance Monitoring': {
		name: 'Performance Monitoring',
		slug: 'performance-monitoring',
		description:
			'Insights into web performance monitoring, metrics that matter, and how to optimize your application.',
	},
	Podcast: {
		name: 'Podcast',
		slug: 'podcast',
		description: 'Episodes and transcripts from the Highlight podcast.',
	},
	Privacy: {
		name: 'Privacy',
		slug: 'privacy',
		description:
			'Everything about privacy, data protection, and user data.',
	},
	Programming: {
		name: 'Programming',
		slug: 'programming',
		description:
			'General programming concepts, patterns, and best practices.',
	},
	Python: {
		name: 'Python',
		slug: 'python',
		description:
			'Python development, monitoring, and observability best practices.',
	},
	'React Native': {
		name: 'React Native',
		slug: 'react-native',
		description:
			'Implementing Highlight and observability in React Native applications.',
	},
	Ruby: {
		name: 'Ruby',
		slug: 'ruby',
		description:
			'Ruby development, monitoring, and observability best practices.',
	},
	'Session Replay': {
		name: 'Session Replay',
		slug: 'session-replay',
		description:
			'Everything about session replay technology, implementation details, and best practices for debugging user sessions.',
	},
	'The Startup Stack': {
		name: 'The Startup Stack',
		slug: 'the-startup-stack',
		description:
			'Exploring the tools, technologies, and practices that power modern startups.',
	},
	Tracing: {
		name: 'Tracing',
		slug: 'tracing',
		description:
			'Distributed tracing concepts, implementation, and best practices.',
	},
	Tutorial: {
		name: 'Tutorial',
		slug: 'tutorial',
		description:
			'Step-by-step guides and tutorials for implementing Highlight and related technologies.',
	},
	Vercel: {
		name: 'Vercel',
		slug: 'vercel',
		description:
			'Deployment, monitoring, and observability with Vercel platform.',
	},
}

export function validateTag(tagName: string): boolean {
	return tagName in VALID_TAGS
}

export function getTagFromName(tagName: string): Omit<Tag, 'posts'> | null {
	const normalizedName = tagName.toLowerCase().trim()
	return VALID_TAGS[normalizedName] || null
}

export function getTagFromSlug(slug: string): Omit<Tag, 'posts'> | null {
	return Object.values(VALID_TAGS).find((tag) => tag.slug === slug) || null
}

export function getAllTags(): Omit<Tag, 'posts'>[] {
	return Object.values(VALID_TAGS)
}

export const kebabCase = (str: string) => {
	return str
		.replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase -> kebab
		.replace(/\s+/g, '-') // spaces -> hyphens
		.replace(/[^a-zA-Z0-9-]/g, '') // remove non-alphanumeric (except hyphens)
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // UPPERCASE -> kebab
		.toLowerCase()
}
