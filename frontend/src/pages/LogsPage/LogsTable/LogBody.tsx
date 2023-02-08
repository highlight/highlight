import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import React from 'react'

type Props = {
	body: string
	query: string
}

const LogBody = ({ body, query }: Props) => {
	const searchWords = query.split(' ')

	return <TextHighlighter searchWords={searchWords} textToHighlight={body} />
}

export { LogBody }
