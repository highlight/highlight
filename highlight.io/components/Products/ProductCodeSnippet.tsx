import Image from 'next/legacy/image'
import { CodeBlock } from 'react-code-blocks'
import { SyntaxHighlighterProps } from 'react-syntax-highlighter'
import homeStyles from '../../Home/Home.module.scss'
import CopyIcon from '../../public/images/copy.svg'
import highlightCodeTheme from './../common/CodeBlock/highlight-code-theme'

const ProductCodeSnippet = ({
	content,
	canCopy,
	...props
}: Omit<SyntaxHighlighterProps, 'children'> & {
	content: string
	canCopy?: boolean
}) => {
	return (
		<div className={homeStyles.codeSnippetFrame}>
			<div className={homeStyles.codeSnippetTopbar}>
				<div className={homeStyles.codeSnippetButtons}>
					<div className={homeStyles.codeSnippetCircle}></div>
					<div className={homeStyles.codeSnippetCircle}></div>
					<div className={homeStyles.codeSnippetCircle}></div>
				</div>
			</div>
			<div className={homeStyles.codeSnippetContent}>
				{canCopy && (
					<div
						className={homeStyles.codeSnippetCopy}
						onClick={() => navigator.clipboard.writeText(content)}
					>
						<div className={homeStyles.codeSnippetCopyIcon}>
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

export default ProductCodeSnippet
