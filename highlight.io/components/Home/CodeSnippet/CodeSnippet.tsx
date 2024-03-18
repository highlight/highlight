import Image from 'next/legacy/image'
import { CodeBlock } from 'react-code-blocks'
import { SyntaxHighlighterProps } from 'react-syntax-highlighter'
import CopyIcon from '../../../public/images/copy.svg'
import highlightCodeTheme from '../../common/CodeBlock/highlight-code-theme'
import styles from '../../Home/Home.module.scss'

export const CodeSnippet = ({
	content,
	HeaderImage,
	canCopy,
	...props
}: Omit<SyntaxHighlighterProps, 'children'> & {
	content: string
	HeaderImage: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
	canCopy?: boolean
}) => {
	return (
		<div className={styles.codeSnippetFrame}>
			<div className={styles.codeSnippetTopbar}>
				<div className={styles.codeSnippetButtons}>
					<div className={styles.codeSnippetCircle}></div>
					<div className={styles.codeSnippetCircle}></div>
					<div className={styles.codeSnippetCircle}></div>
				</div>
				<div className={styles.codeSnippetIcon}>
					<HeaderImage color="white" />
				</div>
			</div>
			<div className={styles.codeSnippetContent}>
				{canCopy && (
					<div
						className={styles.codeSnippetCopy}
						onClick={() => navigator.clipboard.writeText(content)}
					>
						<div className={styles.codeSnippetCopyIcon}>
							<Image src={CopyIcon} alt="" />
						</div>
					</div>
				)}
				<CodeBlock
					theme={highlightCodeTheme}
					customStyle={
						{
							backgroundColor: 'transparent',
							padding: 0,
							margin: 0,
							overflow: 'scroll',
						} as any
					}
					text={content}
					showLineNumbers={false}
					{...props}
				/>
			</div>
		</div>
	)
}
