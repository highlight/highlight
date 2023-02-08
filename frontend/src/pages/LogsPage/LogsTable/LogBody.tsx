import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import React from 'react'

type Props = {
	body: string
	searchWord: string
}

const LogBody = ({ body, searchWord }: Props) => {
	return <TextHighlighter searchWords={[searchWord]} textToHighlight={body} />
}

export { LogBody }
