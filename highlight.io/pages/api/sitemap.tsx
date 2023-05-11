import { promises as fsp } from 'fs'
import { gql, GraphQLClient } from 'graphql-request'
import { NextApiRequest, NextApiResponse } from 'next'
import { COMPETITORS } from '../../components/Competitors/competitors'
import { FEATURES, iFeature } from '../../components/Features/features'
import { iProduct, PRODUCTS } from '../../components/Products/products'
import { getBlogPaths } from '../blog'
import { getGithubDocsPaths } from './docs/github'

async function generateXML(): Promise<string> {
	const graphcms = new GraphQLClient(
		'https://api-us-west-2.graphcms.com/v2/cl2tzedef0o3p01yz7c7eetq8/master',
		{
			headers: {
				Authorization: `Bearer ${process.env.GRAPHCMS_TOKEN}`,
			},
		},
	)

	const start = global.performance.now()
	const [{ posts }, { customers }, { changelogs }, docs, githubBlogPosts] =
		await Promise.all([
			await graphcms.request(gql`
	      query GetPosts() {
	        posts(orderBy: publishedAt_DESC) {
	          slug
	        }
	      }
	    `),
			await graphcms.request(gql`
	      query GetCustomers() {
	        customers() {
	          slug
	        }
	      }
	    `),
			await graphcms.request(gql`
	      query GetChangelogs() {
	        changelogs() {
	          slug
	        }
	      }
	    `),
			await getGithubDocsPaths(),
			await getBlogPaths(fsp, ''),
		])

	const blogPages = posts.map((post: any) => `blog/${post.slug}`)

	const githubBlogPages = githubBlogPosts.map(
		(path) => `blog/${path.simple_path}`,
	)

	const customerPages = customers.map(
		(customer: { slug: string }) => `customers/${customer.slug}`,
	)
	const changelogPages = changelogs.map(
		(changelog: { slug: string }) => `changelog/${changelog.slug}`,
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
		...blogPages,
		...githubBlogPages,
		...customerPages,
		...changelogPages,
		...docsPages,
		...productPages,
		...featurePages,
		...competitorPages,
	]

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

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	res.setHeader('Content-Type', 'text/xml')
	// Instructing the Vercel edge to cache the file
	res.setHeader('Cache-control', 'stale-while-revalidate, s-maxage=3600')
	res.status(200).end(await generateXML())
}
