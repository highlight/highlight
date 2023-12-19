import { NextApiRequest, NextApiResponse } from 'next'
import { COMPETITORS } from '../../components/Competitors/competitors'
import { FEATURES, iFeature } from '../../components/Features/features'
import { iProduct, PRODUCTS } from '../../components/Products/products'
import { withPageRouterHighlight } from '../../highlight.config'

async function generateXML(): Promise<string> {
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

const handler = withPageRouterHighlight(async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	res.setHeader('Content-Type', 'text/xml')
	// Instructing the Vercel edge to cache the file
	res.setHeader('Cache-control', 'stale-while-revalidate, s-maxage=3600')
	res.status(200).end(await generateXML())
})
export default handler
