import { Maybe } from '@graph/schemas'
import { StackSectionProps } from '@pages/ErrorsV2/ErrorStackTrace/ErrorStackTrace'
import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/light'
import { coy as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism'

type ErrorSourcePreviewProps = {
	lineContent: StackSectionProps['lineContent']
	fileName?: StackSectionProps['fileName']
	lineNumber?: StackSectionProps['lineNumber']
	columnNumber?: StackSectionProps['columnNumber']
	functionName?: StackSectionProps['functionName']
	enhancementSource?: StackSectionProps['enhancementSource']
	enhancementVersion?: StackSectionProps['enhancementVersion']
	externalLink?: StackSectionProps['externalLink']
	linesBefore?: StackSectionProps['linesBefore']
	linesAfter?: StackSectionProps['linesAfter']
	showLineNumbers?: boolean
}

const normalize = (linesStr: Maybe<string> | undefined): string[] => {
	const arr = (linesStr ?? '')?.split('\n')
	const last = arr.pop()
	if (last !== undefined && last !== '') {
		arr.push(last)
	}
	return arr
}

const LANGUAGE_MAP: { [K in string]: string } = {
	js: 'javascript',
	jsx: 'jsx',
	ts: 'typescript',
	tsx: 'tsx',
}

const baseLineStyles = {
	display: 'block',
}

const ErrorSourcePreview: React.FC<
	React.PropsWithChildren<ErrorSourcePreviewProps>
> = ({
	fileName,
	lineNumber,
	lineContent,
	linesBefore,
	linesAfter,
	showLineNumbers = true,
}) => {
	const before = normalize(linesBefore)
	const line = normalize(lineContent)
	const after = normalize(linesAfter)
	const text = before.concat(line).concat(after)

	// Remove preceding spaces in case the snippet has a lot of indentation
	let minSpace: number | undefined
	for (const line of text) {
		let spaceCount = 0
		let nonSpaceSeen = false
		for (const c of line) {
			if (c === ' ' || c === '\t') {
				spaceCount++
			} else {
				nonSpaceSeen = true
				break
			}
		}
		if (nonSpaceSeen && (minSpace === undefined || spaceCount < minSpace)) {
			minSpace = spaceCount
		}
	}

	if (!!minSpace) {
		for (let i = 0; i < text.length; i++) {
			text[i] = text[i].substring(minSpace)
		}
	}

	const extension = fileName?.split('.').pop()
	const language = (!!extension && LANGUAGE_MAP[extension]) || 'javascript'

	return (
		<SyntaxHighlighter
			language={language}
			style={lightTheme}
			showLineNumbers={showLineNumbers}
			wrapLines
			startingLineNumber={(lineNumber ?? 1) - before.length}
			customStyle={{
				backgroundColor: 'transparent',
				fontSize: 13,
				fontWeight: 500,
				lineHeight: 20,
				margin: '0 0 0 0',
			}}
			lineProps={(ln) => {
				return ln === lineNumber
					? {
							style: {
								backgroundColor: '#FFB224',
								borderRadius: '4px',
								...baseLineStyles,
							},
							'data-line-number': lineNumber.toString(),
						}
					: {
							style: baseLineStyles,
						}
			}}
		>
			{text.join('\n')}
		</SyntaxHighlighter>
	)
}

export default ErrorSourcePreview
