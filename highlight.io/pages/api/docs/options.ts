import { NextApiRequest, NextApiResponse } from 'next'
import { promises as fsp } from 'fs'
import { getDocsPaths, sortBySlashLength } from '../../docs/[[...doc]]'

// Cache the doc options for 1 hour
let cachedDocOptions: any = null
let cacheTime = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	try {
		const now = Date.now()

		// Return cached data if still valid
		if (cachedDocOptions && now - cacheTime < CACHE_DURATION) {
			res.setHeader(
				'Cache-Control',
				'public, s-maxage=3600, stale-while-revalidate',
			)
			return res.status(200).json(cachedDocOptions)
		}

		// Generate fresh doc options
		const docPaths = sortBySlashLength(await getDocsPaths(fsp, undefined))
		const docOptions = docPaths.map((d) => ({
			metadata: d.metadata,
			simple_path: d.simple_path,
			array_path: d.array_path,
			hasContent: d.content != '',
		}))

		// Update cache
		cachedDocOptions = docOptions
		cacheTime = now

		// Set cache header for CDN
		res.setHeader(
			'Cache-Control',
			'public, s-maxage=3600, stale-while-revalidate',
		)
		res.status(200).json(docOptions)
	} catch (error) {
		console.error('Error fetching doc options:', error)
		res.status(500).json({ error: 'Failed to fetch doc options' })
	}
}
