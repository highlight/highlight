import { promises as fsp } from 'fs'
import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import removeMd from 'remove-markdown'
import { withPageRouterHighlight } from '../../../../highlight.config'
import logger from '../../../../highlight.logger'
import { readMarkdown } from '../../../../shared/doc'
import { getDocsPaths } from '../../../docs/[[...doc]]'

export const SEARCH_RESULT_BLURB_LENGTH = 100

const removeHtmlTags = (content: string) => content.replace(/(<([^>]+)>)/gi, '')

export interface SearchResult {
	title: string
	titleMatch?: Array<[number, number]> | undefined
	path: string
	indexPath: boolean
	content: string
	contentMatch?: Array<[number, number]> | undefined
}

const handler = withPageRouterHighlight(async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const searchValue = [req.query.searchValue].flat().join('').toLowerCase()
	logger.info('running api docs search query', { searchValue })
	const docPaths = await getDocsPaths(fsp, undefined)
	const paths: SearchResult[] = await Promise.all(
		docPaths.map(async (doc) => {
			const { content } = await readMarkdown(
				fsp,
				path.join(doc?.total_path || ''),
			)
			return {
				title: doc?.metadata.title,
				path: doc?.simple_path,
				indexPath: doc?.indexPath,
				content: content,
			}
		}),
	)
	const filteredResults = paths.filter(
		(path) =>
			(path.title.toLowerCase().includes(searchValue) ||
				path.content.toLowerCase().includes(searchValue)) &&
			!path.indexPath,
	)
	const searchResults = filteredResults.map((result) => {
		const parsedContent = removeHtmlTags(removeMd(result.content))
		const firstOccurence = parsedContent.toLowerCase().indexOf(searchValue)
		return {
			...result,
			content: `${
				firstOccurence - SEARCH_RESULT_BLURB_LENGTH > 0 ? '...' : ''
			}${parsedContent.slice(
				Math.max(0, firstOccurence - SEARCH_RESULT_BLURB_LENGTH),
				Math.min(firstOccurence + SEARCH_RESULT_BLURB_LENGTH),
			)}${
				firstOccurence + SEARCH_RESULT_BLURB_LENGTH <
				parsedContent.length
					? '...'
					: ''
			}`,
		}
	})

	return res.json(searchResults)
})
export default handler
