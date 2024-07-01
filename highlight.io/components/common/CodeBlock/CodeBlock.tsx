import { BiCopy } from 'react-icons/bi'
import classNames from 'classnames'
import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { SyntaxHighlighterProps } from 'react-syntax-highlighter'
import { CodeBlock as ReactCodeBlock } from 'react-code-blocks'

import styles from './CodeBlock.module.scss'

type Props = SyntaxHighlighterProps & {
	text: string
	onCopy?: () => void
	hideCopy?: boolean
	language: string
	numberOfLines?: number
	lineNumber?: number
}

export const CodeBlock = ({
	text,
	onCopy,
	language,
	hideCopy,
	numberOfLines,
	showLineNumbers,
	lineNumber,
	...props
}: Props) => {
	return (
		<span className={styles.codeBlock}>
			<span className={classNames(styles.codeBlockInner)}>
				{showLineNumbers && (
					<pre
						style={{
							...props.customStyle,
							...props.codeTagProps?.style,
							padding: '0',
							margin: '0',
							overflow: 'visible',
							minWidth: 'auto',
						}}
					>
						<code style={props.codeTagProps?.style}>
							{Array.from(Array(numberOfLines).keys()).map(
								(i) => (
									<div
										key={i}
										className={classNames(
											styles.lineNumberSticky,
											{
												[styles.highlightedLine]:
													lineNumber ===
													i +
														(props.startingLineNumber ||
															0),
											},
										)}
									>
										{i + (props.startingLineNumber || 0)}
									</div>
								),
							)}
						</code>
					</pre>
				)}

				<ReactCodeBlock
					text={text}
					language={language}
					customStyle={
						{
							padding: '2px 8px',
							color: 'var(--color-white)',
							backgroundColor:
								'var(--color-primary-inverted-background)',
						} as any
					}
					showLineNumbers={showLineNumbers}
					{...props}
				/>
				{!hideCopy && (
					<span className={styles.copyButton}>
						<CopyToClipboard
							text={text}
							onCopy={() => {
								onCopy && onCopy()
							}}
						>
							<span className={styles.copyDiv}>
								<BiCopy
									style={{
										position: 'absolute',
										height: 16,
										width: 16,
									}}
								/>
							</span>
						</CopyToClipboard>
					</span>
				)}
			</span>
		</span>
	)
}
