import Markdown from 'markdown-to-jsx'
import { createElement } from 'react'
import styles from '../Docs.module.scss'
import { DocsMarkdownRenderer } from '../DocsTypographyRenderer/DocsTypographyRenderer'

const CLASSNAME_MAP: { [k: string]: string } = {
	section: styles.sdkDocSection,
	left: styles.sdkLeftColumn,
	right: styles.sdkRightColumn,
	parameter: styles.methodParameter,
	innerParameterContainer: styles.innerParameterContainer,
	innerParameterHeading: styles.innerParameterHeading,
}

export const DocSection = ({ content }: { content: string }) => {
	return (
		<Markdown
			options={{
				createElement(type, props, children) {
					return createElement(
						type,
						{ ...props, className: CLASSNAME_MAP[props.className] },
						children,
					)
				},
				overrides: {
					h1: DocsMarkdownRenderer('h4'),
					h2: DocsMarkdownRenderer('h4'),
					h3: DocsMarkdownRenderer('h4'),
					h4: DocsMarkdownRenderer('h4'),
					h5: DocsMarkdownRenderer('h5'),
					code: DocsMarkdownRenderer('code'),
					a: DocsMarkdownRenderer('a'),
				},
			}}
		>
			{content}
		</Markdown>
	)
}
