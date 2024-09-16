import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { createElement } from 'react'
import { BiLink } from 'react-icons/bi'
import { HeroVideo } from '../../Home/HeroVideo/HeroVideo'
import { Callout } from '../Callout/Callout'
import styles from '../Docs.module.scss'
import { HighlightCodeBlock } from '../HighlightCodeBlock/HighlightCodeBlock'

const getIdFromHTMLHeaderProps = (props: any) => {
	return props?.children
		.map((child: any) =>
			child.props ? child.props.children[0].value : child,
		)
		.join('')
		.replace(/[^a-zA-Z ]/g, '')
		.trim()
		.split(' ')
		.join('-')
}

export const getIdFromHeaderProps = (props: any) => {
	return props?.node?.children
		.map((child: any) =>
			child.tagName === 'code' ? child?.children[0].value : child.value,
		)
		.join('')
		.replace(/[^a-zA-Z ]/g, '')
		.trim()
		.split(' ')
		.join('-')
}

export const generateIdFromProps = (component: React.ReactNode) => {
	const getNodeText = (node: React.ReactNode): string => {
		if (typeof node === 'string') return node
		if (Array.isArray(node)) return node.map(getNodeText).join('')
		if (typeof node === 'object' && node != null)
			return 'props' in node ? getNodeText(node.props.children) : ''
		return String(node)
	}
	const text = getNodeText(component)
	return text
		.replace(/[^a-zA-Z ]/g, '')
		.trim()
		.split(' ')
		.join('-')
		.toLowerCase()
}

const copyHeadingIcon = (index: number) => {
	return (
		<span className={styles.headingCopyIcon} key={index}>
			<BiLink />
		</span>
	)
}

export const DocsMarkdownRenderer = (
	renderType: 'h4' | 'h5' | 'h6' | 'code' | 'a' | 'div',
) => {
	function DocsTypography({ ...props }) {
		const router = useRouter()
		return (
			<>
				{renderType === 'code' ? (
					props && props.children && props.inline ? (
						<code className={styles.inlineCodeBlock}>
							{props.children[0]}
						</code>
					) : props.className === 'language-hint' ? (
						<Callout content={props.children[0]} />
					) : (
						<HighlightCodeBlock
							language={
								props.className
									? props.className.split('language-').pop()
									: 'js'
							}
							text={props.children[0]}
							showLineNumbers={false}
						/>
					)
				) : renderType === 'a' ? (
					props.children?.length && (
						<Link href={props.href} legacyBehavior>
							{props.children[0]}
						</Link>
					)
				) : (
					createElement(
						renderType,
						{
							className: styles.contentRender,
							...(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
								renderType,
							)
								? {
										id: getIdFromHTMLHeaderProps(props),
										onClick: () => {
											document
												.querySelector(
													`#${getIdFromHeaderProps(
														props,
													)}`,
												)
												?.scrollIntoView({
													behavior: 'smooth',
												})
											const basePath =
												router.asPath.split('#')[0]
											const newUrl = `${basePath}#${getIdFromHTMLHeaderProps(
												props,
											)}`
											window.history.replaceState(
												{
													...window.history.state,
													as: newUrl,
													url: newUrl,
												},
												'',
												newUrl,
											)
										},
									}
								: {}),
						},
						[
							...props?.children.map((c: any, i: number) =>
								c.props
									? createElement(
											'code',
											{
												key: i,
												className:
													styles.inlineCodeBlock,
											},
											c?.props.children,
										)
									: c,
							),
							copyHeadingIcon(props?.children?.length ?? 0),
						],
					)
				)}
			</>
		)
	}

	return DocsTypography
}

export const MethodParameterRenderer = (renderType: 'h5' | 'code' | 'a') => {
	function DocsTypography({ ...props }) {
		const router = useRouter()
		return (
			<>
				{renderType === 'code' ? (
					props && props.children && props.inline ? (
						<code className={styles.inlineCodeBlock}>
							{props.children[0]}
						</code>
					) : (
						<HighlightCodeBlock
							language={
								props.className
									? props.className.split('language-').pop()
									: 'js'
							}
							text={props.children[0]}
							showLineNumbers={false}
						/>
					)
				) : renderType === 'a' ? (
					props.children?.length && (
						<Link href={props.href} legacyBehavior>
							{props.children[0]}
						</Link>
					)
				) : (
					createElement(
						renderType,
						{
							className: classNames(styles.contentRender),
							...(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(
								renderType,
							)
								? {
										id: getIdFromHTMLHeaderProps(props),
										onClick: () => {
											document
												.querySelector(
													`#${getIdFromHeaderProps(
														props,
													)}`,
												)
												?.scrollIntoView({
													behavior: 'smooth',
												})
											const basePath =
												router.asPath.split('#')[0]
											const newUrl = `${basePath}#${getIdFromHTMLHeaderProps(
												props,
											)}`
											window.history.replaceState(
												{
													...window.history.state,
													as: newUrl,
													url: newUrl,
												},
												'',
												newUrl,
											)
										},
									}
								: {}),
						},
						[
							...props?.children.map((c: any, i: number) =>
								c.props
									? createElement(
											'code',
											{
												key: i,
												className:
													styles.inlineCodeBlock,
											},
											c?.props.children,
										)
									: c,
							),
							copyHeadingIcon(props?.children?.length ?? 0),
						],
					)
				)}
			</>
		)
	}

	return DocsTypography
}

export const getDocsTypographyRenderer = (
	type: 'h4' | 'h6' | 'h5' | 'code' | 'a' | 'ul',
) => {
	function DocsTypography({ ...props }) {
		const router = useRouter()
		return (
			<>
				{type === 'code' ? (
					props && props.children && props.inline ? (
						<code className={styles.inlineCodeBlock}>
							{props.children[0]}
						</code>
					) : props.className === 'language-welcomevideo' ? (
						<div className={styles.customComponent}>
							<HeroVideo />
						</div>
					) : props.className === 'language-hint' ? (
						<Callout content={props.children[0]} />
					) : (
						<HighlightCodeBlock
							language={
								props.className
									? props.className.split('language-').pop()
									: 'js'
							}
							text={props.children[0]}
							showLineNumbers={false}
						/>
					)
				) : type === 'ul' ? (
					<ul style={{ listStyle: 'disc outside' }}>
						{props.children.map((c: any, i: number) => {
							return (
								c.type === 'li' && (
									<li className={styles.listItem} key={i}>
										{c.props.children.map((e: any) => e)}
									</li>
								)
							)
						})}
					</ul>
				) : type === 'a' ? (
					props.children?.length && (
						<Link href={props.href} legacyBehavior>
							{props.children[0]}
						</Link>
					)
				) : (
					createElement(
						type,
						{
							className: styles.contentRender,
							...(['h4', 'h5', 'h6'].includes(type)
								? {
										id: getIdFromHeaderProps(props),
										onClick: () => {
											document
												.querySelector(
													`#${getIdFromHeaderProps(
														props,
													)}`,
												)
												?.scrollIntoView({
													behavior: 'smooth',
												})
											const basePath =
												router.asPath.split('#')[0]
											const newUrl = `${basePath}#${getIdFromHeaderProps(
												props,
											)}`
											window.history.replaceState(
												{
													...window.history.state,
													as: newUrl,
													url: newUrl,
												},
												'',
												newUrl,
											)
										},
									}
								: {}),
						},
						[
							...props?.node?.children.map((c: any, i: number) =>
								c.tagName === 'code'
									? createElement(
											c.tagName,
											{
												key: i,
												className:
													styles.inlineCodeBlock,
											},
											c?.children[0].value,
										)
									: c.value,
							),
							copyHeadingIcon(props?.node?.children?.length ?? 0),
						],
					)
				)}
			</>
		)
	}

	return DocsTypography
}
