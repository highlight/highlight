import * as fs from 'fs'
import * as path from 'path'
import matter from 'gray-matter'

// Tag mapping from old to new
const tagMapping: Record<string, string[]> = {
	// Frontend related
	'Frontend Monitoring': ['Frontend'],
	'Session Replay': ['Frontend'],
	'Performance Monitoring': ['Frontend'],
	'Chrome DevTools': ['Frontend'],
	'React Native': ['Frontend'],
	'Next.js': ['Frontend'],
	'Web Development': ['Frontend'],

	// Backend related
	ClickHouse: ['Backend'],
	OpenSearch: ['Backend'],
	Kafka: ['Backend'],
	Database: ['Backend'],
	'API Design': ['Backend'],
	Edge: ['Backend'],
	'.NET': ['Backend'],
	Java: ['Backend'],
	Python: ['Backend'],
	Ruby: ['Backend'],
	'Node.js': ['Backend'],
	Go: ['Backend'],
	Django: ['Backend'],

	// Observability related
	Observability: ['Observability'],
	OpenTelemetry: ['Observability'],
	Logging: ['Observability'],
	Tracing: ['Observability'],
	Monitoring: ['Observability'],
	'Debugging & Troubleshooting': ['Observability'],
	'Error Monitoring': ['Observability'],

	// Engineering related
	AI: ['Engineering'],
	'Developer Tooling': ['Engineering'],
	Development: ['Engineering'],
	Programming: ['Engineering'],
	Architecture: ['Engineering'],
	Performance: ['Engineering'],
	Testing: ['Engineering'],

	// Developer Experience
	'Developer Experience': ['Developer Experience'],
	Tooling: ['Developer Experience'],
	Workflow: ['Developer Experience'],
	Documentation: ['Developer Experience'],

	// Product Updates
	'Launch Week 1': ['Product Updates'],
	'Launch Week 2': ['Product Updates'],
	'Launch Week 3': ['Product Updates'],
	'Launch Week 4': ['Product Updates'],
	'Launch Week 5': ['Product Updates'],
	'Product Updates': ['Product Updates'],
	Feature: ['Product Updates'],

	// Company
	Podcast: ['Company'],
	Design: ['Company'],
	Privacy: ['Company'],
	'Company News': ['Company'],
	Culture: ['Company'],
}

const BLOG_DIR = path.join(process.cwd(), 'blog-content')

function mapTags(oldTags: string): string {
	// Split tags and trim whitespace
	const tags = oldTags.split(',').map((t) => t.trim())

	// Map each tag to new categories, flatten array and remove duplicates
	const newTags = [
		...new Set(
			tags.flatMap((tag) => tagMapping[tag] || ['Engineering']), // Default to Engineering if no mapping
		),
	]

	return newTags.join(', ')
}

async function migrateBlogTags() {
	const files = fs.readdirSync(BLOG_DIR)

	for (const file of files) {
		if (!file.endsWith('.md')) continue

		const filePath = path.join(BLOG_DIR, file)
		const content = fs.readFileSync(filePath, 'utf8')

		// Parse frontmatter
		const { data, content: markdownContent } = matter(content)

		if (data.tags) {
			// Map old tags to new ones
			data.tags = mapTags(data.tags)

			// Convert back to markdown with new frontmatter
			const newContent = matter.stringify(markdownContent, data)

			// Write back to file
			fs.writeFileSync(filePath, newContent)

			console.log(`Updated tags for ${file}`)
		}
	}
}

migrateBlogTags().catch(console.error)
