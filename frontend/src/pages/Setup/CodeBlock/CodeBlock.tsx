import SvgCopyIcon from '@icons/CopyIcon'
import useLocalStorage from '@rehooks/local-storage'
import { message } from 'antd'
import clsx from 'clsx'
import { useEffect } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { type SyntaxHighlighterProps } from 'react-syntax-highlighter'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism'
import {
	atomDark as darkTheme,
	coy as lightTheme,
} from 'react-syntax-highlighter/dist/esm/styles/prism'

import styles from './CodeBlock.module.css'

type Props = Omit<SyntaxHighlighterProps, 'children'> & {
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
	const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(
		'highlightTheme',
		'light',
	)
	const htmlElement = document.querySelector('html')

	useEffect(() => {
		if (htmlElement) {
			const currentTheme = htmlElement.dataset.theme
			if (
				currentTheme &&
				(currentTheme === 'light' || currentTheme === 'dark')
			) {
				setTheme(currentTheme)
			}
		}
	}, [htmlElement, setTheme])

	return (
		<span className={styles.codeBlock}>
			{!hideCopy && (
				<span className={styles.copyButton}>
					<CopyToClipboard
						text={text}
						onCopy={() => {
							message.success('Copied Snippet', 5)
							onCopy && onCopy()
						}}
					>
						<span className={styles.copyDiv}>
							<SvgCopyIcon
								style={{
									position: 'absolute',
									height: 14,
									width: 14,
									color: 'var(--color-text-primary)',
								}}
							/>
						</span>
					</CopyToClipboard>
				</span>
			)}
			<span
				className={clsx({
					[styles.codeBlockInner]: showLineNumbers,
				})}
			>
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
										className={clsx(
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

				<SyntaxHighlighter
					language={language}
					style={theme === 'light' ? lightTheme : darkTheme}
					customStyle={props.customStyle ?? { padding: '8px 0' }}
					showLineNumbers={showLineNumbers}
					{...props}
				>
					{text}
				</SyntaxHighlighter>
			</span>
		</span>
	)
}
