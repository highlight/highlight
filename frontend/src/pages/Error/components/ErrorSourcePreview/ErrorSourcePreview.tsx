import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock'
import React, { useEffect } from 'react'

import styles from './ErrorSourcePreview.module.scss'

type ErrorSourcePreviewProps = {
	fileName: string | undefined
	lineNumber: number | undefined
	columnNumber: number | undefined
	functionName: string | undefined
	lineContent: string
	linesBefore: string | undefined
	linesAfter: string | undefined
}

const normalize = (linesStr: string | undefined): string[] => {
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

const ErrorSourcePreview: React.FC<ErrorSourcePreviewProps> = ({
	fileName,
	lineNumber,
	functionName,
	lineContent,
	linesBefore,
	linesAfter,
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

	// Adds a squiggly underline to the line where the error occurred
	useEffect(() => {
		const thrownLineElement = document.querySelector(
			`[data-line-number="${lineNumber}"]`,
		)
		if (thrownLineElement) {
			// Skip the first 2 tokens:
			// 1. First token is the line number
			// 2. Second token is the tab/indentation
			;[...thrownLineElement.children]
				.slice(2)
				.forEach((childElement) => {
					if (
						childElement.textContent === functionName ||
						// `functionName` is empty when the error occurred on the entire line. In this case we add an underline to the entire line.
						functionName === ''
					) {
						childElement.classList.add(styles.underline)
					}
				})
		}
	}, [functionName, lineNumber])

	return (
		<span className={styles.codeBlockWrapper}>
			<CodeBlock
				className={styles.codeBlock}
				text={text.join('\n')}
				language={language}
				hideCopy
				showLineNumbers
				numberOfLines={text.length}
				lineNumber={lineNumber}
				startingLineNumber={(lineNumber ?? 1) - before.length}
				lineProps={(ln) => {
					if (ln === lineNumber) {
						return {
							style: {
								backgroundColor: 'var(--color-gray-300)',
								display: 'block',
							},
							'data-line-number': lineNumber.toString(),
						}
					}
					return {
						style: {
							display: 'block',
						},
					}
				}}
				lineNumberStyle={{
					paddingRight: '16px',
					paddingLeft: '16px',
					display: 'none',
				}}
				wrapLines
				customStyle={{
					fontFamily: 'Roboto Mono',
					border: 'none !important',
					overflow: 'auto',
				}}
				codeTagProps={{
					style: {
						color: '#111',
						background: 'none',
						fontFamily:
							'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
						fontSize: '1em',
						textAlign: 'left',
						whiteSpace: 'pre',
						wordSpacing: 'normal',
						wordBreak: 'normal',
						overflowWrap: 'normal',
						lineHeight: '1.5',
						tabSize: '4',
						hyphens: 'none',
						maxHeight: 'inherit',
						height: 'inherit',
						padding: '8px 0',
						display: 'block',
						overflow: 'auto',
						border: 'none',
						width: 'fit-content',
						minWidth: '100%',
					},
				}}
			/>
		</span>
	)
}

export default ErrorSourcePreview
