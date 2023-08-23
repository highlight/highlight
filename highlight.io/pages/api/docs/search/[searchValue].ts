import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import removeMd from 'remove-markdown'
import { readMarkdownFile } from '../../../../components/Docs/TableOfContents/TableOfContents'
import { getDocs } from '../../../docs/[[...doc]]'

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

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const searchValue = [req.query.searchValue].flat().join('').toLowerCase()
	const docPaths = await getDocs()
	const paths: SearchResult[] = await Promise.all(
		docPaths.map(async (doc) => {
			const { content } = await readMarkdownFile(
				path.join(doc.absoluteFilePath || ''),
			)
			return {
				title: doc.metadata.title,
				path: doc.slugPath,
				indexPath: doc.isIndex,
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
}
