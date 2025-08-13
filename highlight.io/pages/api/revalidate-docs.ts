import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	// Check for secret to confirm this is a valid request
	// You should set this as an environment variable
	if (req.query.secret !== process.env.REVALIDATION_SECRET) {
		return res.status(401).json({ message: 'Invalid token' })
	}

	try {
		const { path } = req.query

		if (path && typeof path === 'string') {
			// Revalidate a specific doc page
			await res.revalidate(`/docs/${path}`)
			return res.json({ revalidated: true, path: `/docs/${path}` })
		} else {
			// Revalidate common doc pages
			const pathsToRevalidate = [
				'/docs',
				'/docs/general/welcome',
				'/docs/general/getting-started',
				'/docs/getting-started/overview',
				'/docs/sdk/client',
				'/docs/sdk/nextjs',
				'/docs/sdk/nodejs',
				'/docs/sdk/python',
				'/docs/sdk/go',
			]

			await Promise.all(pathsToRevalidate.map((p) => res.revalidate(p)))

			return res.json({ revalidated: true, paths: pathsToRevalidate })
		}
	} catch (err) {
		// If there was an error, Next.js will continue
		// to show the last successfully generated page
		console.error('Error revalidating:', err)
		return res.status(500).send('Error revalidating')
	}
}
