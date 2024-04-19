import { promises as fsp } from 'fs'
import { gql } from 'graphql-request'
import pino from 'pino'
import { createWriteStream } from 'pino-http-send'
import { COMPETITORS } from '../../../components/Competitors/competitors'
import { FEATURES, iFeature } from '../../../components/Features/features'
import { iProduct, PRODUCTS } from '../../../components/Products/products'
import { withAppRouterHighlight } from '../../../highlight.app.config'
import { getGithubDocsPaths } from '../../../pages/api/docs/github'
import { getBlogPaths } from '../../../shared/blog'
import { GraphQLRequest } from '../../../utils/graphql'

const stream = createWriteStream({
	url: 'https://pub.highlight.io/v1/logs/json',
	headers: {
		'x-highlight-project': '2',
		'x-highlight-service': 'next-suspense',
	},
})

const logger = pino({ level: 'trace' }, stream)

async function generateXML(): Promise<string> {
	logger.info('generating sitemap')

	const [{ customers }, docs, githubBlogPosts] = await Promise.all([
		await GraphQLRequest<{ customers: { slug: string }[] }>(gql`
            query GetCustomers() {
                customers() {
                    slug
                }
            }
        `),
		await getGithubDocsPaths(),
		await getBlogPaths(fsp, ''),
	])
	logger.info('got remote data')

	const githubBlogPages = githubBlogPosts.map(
		(path) => `blog/${path.simple_path}`,
	)

	const customerPages = customers.map(
		(customer: { slug: string }) => `customers/${customer.slug}`,
	)
	const docsPages = Array.from(docs.keys()).map(
		(d) => `docs/${d.split('docs-content/').pop()}`,
	)
	const productPages = Object.values(PRODUCTS).map(
		(product: iProduct) => `for/${product.slug}`,
	)
	const featurePages = Object.values(FEATURES).map(
		(feature: iFeature) => `${feature.slug}`,
	)

	const competitorPages = Object.keys(COMPETITORS).map(
		(competitorSlug: string) => competitorSlug,
	)

	const staticPagePaths = process.env.staticPages?.split(', ') || []
	const staticPages = staticPagePaths.map((path) => {
		return `${path.replace('pages', '').replace('index.tsx', '')}`
	})

	const pages = [
		...staticPages,
		...githubBlogPages,
		...customerPages,
		...docsPages,
		...productPages,
		...featurePages,
		...competitorPages,
	]
	logger.info({ numPages: pages.length }, 'build pages')

	const addPage = (page: string) => {
		return `    <url>
	      <loc>${`${process.env.WEBSITE_URL}/${page}`}</loc>
	      <changefreq>hourly</changefreq>
	    </url>`
	}

	return `<?xml version="1.0" encoding="UTF-8"?>
	  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	${pages.map(addPage).join('\n')}
	  </urlset>`
}

export const maxDuration = 300
export const dynamic = 'force-dynamic'

export const GET = withAppRouterHighlight(async function GET() {
	return new Response(await generateXML(), {
		headers: {
			'Content-Type': 'text/xml',
			'Cache-control': 'stale-while-revalidate, s-maxage=3600',
		},
		status: 200,
	})
})
