import { ChevronDownIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import fs from 'fs/promises'

import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next/types'
import path from 'path'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Collapse } from 'react-collapse'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'
import remarkGfm from 'remark-gfm'
import { Meta } from '../../components/common/Head/Meta'
import Navbar from '../../components/common/Navbar/Navbar'
import { Roadmap, RoadmapItem } from '../../components/common/Roadmap/Roadmap'
import { roadmapFetcher } from '../../components/common/Roadmap/RoadmapUtils'
import { Typography } from '../../components/common/Typography/Typography'
import { Callout } from '../../components/Docs/Callout/Callout'
import { DocSection } from '../../components/Docs/DocLayout/DocLayout'
import styles from '../../components/Docs/Docs.module.scss'
import { generateIdFromProps } from '../../components/Docs/DocsTypographyRenderer/DocsTypographyRenderer'
import { HighlightCodeBlock } from '../../components/Docs/HighlightCodeBlock/HighlightCodeBlock'
import {
	DocMetadata,
	DocPage,
	DOCS_CONTENT_PATH,
	getTocEntry,
	PageRightBar,
	readDocFile,
	readMarkdownFile,
	TableOfContents,
	TocEntry,
} from '../../components/Docs/TableOfContents/TableOfContents'
import {
	AutoplayVideo,
	DocsCard,
	DocsCardGroup,
	EmbeddedVideo,
	MarkdownList,
	MissingFrameworkCopy,
	QuickStart,
} from '../../components/MDXRemote'
import { quickStartContent } from '../../components/QuickstartContent/QuickstartContent'
import { IGNORED_DOCS_PATHS, removeOrderingPrefix } from '../api/docs/github'

function sortByOrderPrefix(a: string, b: string) {
	const [firstStringSplit] = a.split('_')
	const [secondStringSplit] = b.split('_')
	const firstPrefix = parseInt(firstStringSplit)
	const secondPrefix = parseInt(secondStringSplit)

	if (firstPrefix != null && secondPrefix != null)
		return firstPrefix - secondPrefix

	if (firstPrefix != null) return -1
	if (secondPrefix != null) return 1

	return a.localeCompare(b)
}

function getMarkdownLinks(content: string) {
	const mdLinkRegex = /[^!]\[.*?\]\((.*?)\)/g
	const hrefLinkRegex = /href="(.*?)"/g
	const matchedLinks = [...content.matchAll(mdLinkRegex)].map(
		([, link]) => link,
	)

	return new Set<string>(matchedLinks)
}

async function getDocs(base = ''): Promise<DocPage[]> {
	const absoluteBasePath = path.join(DOCS_CONTENT_PATH, base)
	const docsFilePaths = await fs.readdir(absoluteBasePath)

	if (!docsFilePaths.includes('index.md'))
		throw new Error(
			`${base}: An index.md file is required for all doc directories`,
		)

	let paths: DocPage[] = []
	for (const entryName of docsFilePaths.sort(sortByOrderPrefix)) {
		if (IGNORED_DOCS_PATHS.has(entryName)) continue

		let absoluteFilePath = path.join(absoluteBasePath, entryName)
		const fileStat = await fs.stat(absoluteFilePath)

		if (!fileStat.isDirectory()) {
			paths.push(await readDocFile(path.join(base, entryName)))
		} else {
			paths.push(...(await getDocs(path.join(base, entryName))))
		}
	}

	return paths
}

/** Sorts the paths so the parents are before their children in the list. Avoids re-sorting alphabetically */
function sortBySlashLength(docPages: DocPage[]): DocPage[] {
	return [...docPages].sort(({ slugPath: a }, { slugPath: b }) => {
		if (!a || !b) return 0
		if (a.includes(b)) return 1
		if (b.includes(a)) return -1
		return 0
	})
}

export const getStaticPaths: GetStaticPaths = async () => {
	const sortedPaths = sortBySlashLength(await getDocs())
	const staticPaths = sortedPaths.map((p) => path.join('/docs', p.slugPath))
	return {
		paths: staticPaths,
		fallback: 'blocking',
	}
}

function resolveEmbeddedLink(link: string, currentLocation: string) {
	let absolutePath = path
		.relative(
			DOCS_CONTENT_PATH,
			path.resolve(DOCS_CONTENT_PATH, currentLocation, '..', link),
		)
		.replace('.md', '')

	return path.join('/docs', removeOrderingPrefix(absolutePath))
}

/**
 * Takes a markdown string, and replaces all of the relative links with links in the form "/docs...".
 * @param relativePath The relative path of the doc that this link lives in. */
const resolveEmbeddedLinksFromMarkdown = (
	markdownContent: string,
	relativePath: string,
): string => {
	// replace all of the links in the markdown file
	return markdownContent.replace(
		/\[(.*?)\]\((.*?)\)/g, // markdown link regex
		(_, text, link) => {
			if (
				link.startsWith('http') ||
				link.startsWith('mailto') ||
				link.startsWith('/images')
			)
				return `[${text}](${link})`

			return `[${text}](${resolveEmbeddedLink(link, relativePath)})`
		},
	)
}

const resolveEmbeddedLinksFromHref = (
	markdownContent: string,
	relativePath: string,
): string => {
	// replace all of the links in the markdown file
	const newContent = markdownContent.replace(/href="(.*?)"/g, (_, text) => {
		if (
			text.startsWith('http') ||
			text.startsWith('mailto') ||
			text.startsWith('/images')
		)
			return `href="${text}"`

		return `href="${resolveEmbeddedLink(text, relativePath)}"`
	})

	return newContent
}

type DocProps = {
	mdContent: MDXRemoteSerializeResult | null
	rawMdContent: string
	// relPath?: string
	// quickstartContent?: QuickStartContent
	// slug: string
	docPages: DocPage[]
	metadata: DocMetadata
	// isSdkDoc?: boolean
	docIndex: number
	redirect: string | null
	docPage: DocPage
	toc: TocEntry[]
}

async function assertWorkingLinks(
	docPath: DocPage,
	links: string[] | Set<string>,
) {
	const brokenLinks: string[] = []

	for (const link of links) {
		if (link.startsWith('http') || link.startsWith('mailto')) continue

		const [baseLink] = link.split('#')
		const linkedDocPath = path.resolve(
			docPath.absoluteFilePath,
			'..',
			baseLink,
		)
		try {
			await fs.stat(linkedDocPath)
		} catch (e) {
			brokenLinks.push(linkedDocPath)
		}
	}

	if (brokenLinks.length > 0)
		throw new Error(
			`Broken links in file '${docPath.filePath}':\n` +
				brokenLinks.map((link) => `\t'${link}'`).join('\n'),
		)
}

const getBreadcrumbs = (currentDoc: DocPage, docOptions: DocPage[]) => {
	const trail: { title: string; path: string }[] = [
		{ title: 'Docs', path: '/docs' },
	]

	const pathToSearch: string[] = []

	for (const section of currentDoc.slugPath.split('/')) {
		pathToSearch.push(section)
		const simplePath = pathToSearch.join('/')
		const nextBreadcrumb = docOptions.find((d) => d.slugPath === simplePath)

		if (!nextBreadcrumb) break

		trail.push({
			title: nextBreadcrumb.metadata.title,
			path: `/docs/${nextBreadcrumb.slugPath}`,
		})
	}

	return trail
}

export const getStaticProps: GetStaticProps<DocProps> = async ({ params }) => {
	const docPages = sortBySlashLength(await getDocs())
	const docParam = ((params?.doc as string[] | undefined) ?? []).join('/')
	const currentDocPath = docPages.find((d) => d.slugPath === docParam)

	if (!currentDocPath) return { notFound: true }

	const { content, metadata } = await readMarkdownFile(
		currentDocPath.absoluteFilePath,
	)

	// const sdkPaths = await getSdkPaths(fsp, undefined);
	const currentDocIndex = docPages.findIndex((d) => {
		return (
			JSON.stringify(d.slugPath.split('/')) ===
			JSON.stringify(params?.doc ?? [''])
		)
	})

	// the metadata in a file starts with "" and ends with "---" (this is the archbee format).
	// TODO(fabio): merge these two functions
	const replacedLinksContent = resolveEmbeddedLinksFromHref(
		resolveEmbeddedLinksFromMarkdown(content, currentDocPath.filePath),
		currentDocPath.filePath,
	)

	const roadmapData = currentDocPath.filePath.includes('roadmap')
		? await roadmapFetcher()
		: null

	const nonIndexDocsSlugPaths = docPages
		.filter((doc) => !doc.isIndex)
		.map((doc) => doc.slugPath)

	const redirect = !nonIndexDocsSlugPaths.includes(currentDocPath.slugPath)
		? nonIndexDocsSlugPaths.find((path) =>
				path.startsWith(currentDocPath.slugPath),
		  ) ?? null
		: null

	const props: DocProps = {
		mdContent: !currentDocPath.isSdkDoc
			? await serialize(replacedLinksContent, {
					scope: {
						path: currentDocPath.filePath,
						quickStartContent,
						roadmapData: roadmapData,
					},
					mdxOptions: { remarkPlugins: [remarkGfm] },
			  })
			: null,
		rawMdContent: replacedLinksContent,
		// relPath: currentDoc.filePath,
		// slug: currentDoc.slugPath,
		docPages: docPages,
		metadata,
		docIndex: currentDocIndex,
		// isSdkDoc: currentDoc.isSdkDoc,
		redirect,
		docPage: currentDocPath,
		toc: docPages
			.filter(
				(page) => page.slugPath && page.slugPath.split('/').length < 2,
			)
			.map((page) => getTocEntry(page, docPages)),
	}

	return {
		props,
		revalidate: 60 * 30, // Cache response for 30 minutes
	}
}

export default function DocPage({
	metadata,
	rawMdContent,
	docPage,
	docPages,
	docIndex,
	mdContent,
	redirect,
	toc,
}: DocProps) {
	const description = rawMdContent
		.replaceAll(/[`[(]+.+[`\])]+/gi, '')
		.replaceAll(/#+/gi, '')
		.replaceAll('\n', ' ')

	const blogBodyRef = useRef<HTMLDivElement>(null)

	const [mobileTocOpen, setMobileToCOpen] = useState(false)
	const closeMenu = useCallback(() => setMobileToCOpen(false), [])

	const router = useRouter()
	useEffect(() => {
		if (redirect) router.replace(redirect)
	}, [redirect, router])

	return (
		<>
			<Meta
				title={
					metadata.title === 'Welcome to Highlight'
						? 'Documentation'
						: metadata.title ?? ''
				}
				description={description}
				absoluteImageUrl={`https://${
					process.env.NEXT_PUBLIC_VERCEL_URL
				}/api/og/doc${docPage.filePath?.replace('.md', '')}`}
				canonical={`/docs/${docPage.slug}`}
			/>
			<Navbar title="Docs" hideBanner isDocsPage fixed />
			<main ref={blogBodyRef} className={styles.mainWrapper}>
				<div className={styles.leftSection}>
					<div className={styles.tocMenuLarge}>
						{/* Desktop table of contents */}
						<TableOfContents toc={toc} />
					</div>
					<div
						className={classNames(styles.tocRow, styles.tocMenu)}
						onClick={() => setMobileToCOpen((o) => !o)}
					>
						{/* Mobile table of contents menu header */}
						<div className={styles.tocMenuLabel}>
							<ChevronDownIcon // TODO
								className={classNames(styles.tocIcon, {
									[styles.tocItemOpen]: mobileTocOpen,
								})}
							/>
							<Typography
								type="copy3"
								emphasis
								className={classNames(styles.tocItem, {
									[styles.tocItemOpen]: mobileTocOpen,
								})}
							>
								Menu
							</Typography>
						</div>
					</div>
					<Collapse isOpened={mobileTocOpen}>
						{/* Mobile Tabe of contents */}
						<div className={classNames('pl-3', styles.tocMenu)}>
							<TableOfContents toc={toc} />
						</div>
					</Collapse>
				</div>
				<div className={styles.contentSection}>
					<div
						className={classNames(
							'DocSearch-content',
							styles.centerSection,
							{
								[styles.sdkCenterSection]: docPage.isSdkDoc,
								[styles.quickStartCenterSection]:
									metadata.quickstart,
							},
						)}
					>
						<div className={styles.breadcrumb}>
							{!docPage.isSdkDoc &&
								getBreadcrumbs(docPage, docPages).map(
									(breadcrumb, i) =>
										i === 0 ? (
											<Link
												key={i}
												href={breadcrumb.path}
												legacyBehavior
											>
												{breadcrumb.title}
											</Link>
										) : (
											<>
												{` / `}
												<Link
													href={breadcrumb.path}
													legacyBehavior
													key={i}
												>
													{breadcrumb.title}
												</Link>
											</>
										),
								)}
						</div>
						<h3
							className={classNames(styles.pageTitle, {
								[styles.sdkPageTitle]: docPage.isSdkDoc,
							})}
						>
							{metadata.heading ?? metadata.title}
						</h3>
						{docPage.isSdkDoc ? (
							<DocSection content={rawMdContent} />
						) : (
							<>
								<div className={styles.contentRender}>
									{mdContent && (
										<MDXRemote
											components={{
												AutoplayVideo,
												EmbeddedVideo,
												MissingFrameworkCopy,
												Roadmap,
												RoadmapItem,
												QuickStart,
												DocsCard,
												DocsCardGroup,
												h1: (props) => (
													<h4 {...props} />
												),
												h2: (props) => {
													const id =
														generateIdFromProps(
															props.children,
														)
													return (
														<Link
															href={`#${id}`}
															className="flex items-baseline gap-2 my-6 transition-all group"
														>
															<h5
																id={id}
																{...props}
															/>
														</Link>
													)
												},
												h3: (props) => {
													const id =
														generateIdFromProps(
															props.children,
														)
													return (
														<Link
															href={`#${id}`}
															className="flex items-baseline gap-2 my-6 transition-all group"
														>
															<h6
																id={id}
																{...props}
															/>
														</Link>
													)
												},
												h4: (props) => (
													<h6 {...props} />
												),
												h5: (props) => (
													<h6 {...props} />
												),
												code: (props) => {
													// check if props.children is a string
													if (
														props.children &&
														props.className ===
															'language-hint'
													) {
														return (
															<Callout
																content={
																	props.children as string
																}
															/>
														)
													} else if (
														typeof props.children ===
															'string' &&
														(
															props.children.match(
																/\n/g,
															) || []
														).length
													) {
														return (
															<HighlightCodeBlock
																language={
																	props.className
																		? props.className
																				.split(
																					'language-',
																				)
																				.pop() ??
																		  'js'
																		: 'js'
																}
																text={
																	props.children
																}
																showLineNumbers={
																	false
																}
															/>
														)
													}
													return (
														<code
															className={
																styles.inlineCodeBlock
															}
														>
															{props.children}
														</code>
													)
												},
												ul: MarkdownList,
												ol: MarkdownList,
												table: (props) => {
													return (
														<div
															className={
																styles.docsTable
															}
														>
															<Typography type="copy2">
																<table
																	{...props}
																/>
															</Typography>
														</div>
													)
												},
												img: (props) => {
													return (
														<picture>
															<img
																{...props}
																alt={props.alt}
																className="border rounded-lg border-divider-on-dark"
															/>
														</picture>
													)
												},
											}}
											{...mdContent}
										/>
									)}
								</div>
							</>
						)}
						<div className={styles.pageNavigateRow}>
							{/* Previous and Next doc Links */}
							{docIndex > 0 ? (
								<Link
									href={docPages[docIndex - 1]?.slugPath}
									passHref
									className={styles.pageNavigate}
								>
									<BiChevronLeft />
									<Typography type="copy2">
										{docPages[docIndex - 1]?.metadata.title}
									</Typography>
								</Link>
							) : (
								<div></div>
							)}
							{docIndex < docPages?.length - 1 ? (
								<Link
									href={docPages[docIndex + 1]?.slugPath}
									passHref
									className={styles.pageNavigate}
								>
									<Typography type="copy2">
										{docPages[docIndex + 1].metadata.title}
									</Typography>
									<BiChevronRight />
								</Link>
							) : (
								<div></div>
							)}
						</div>
					</div>
					{!docPage.isSdkDoc && !metadata.quickstart && (
						<div className={styles.rightSection}>
							<PageRightBar
								title={metadata.title}
								relativePath={docPage.filePath}
							/>
						</div>
					)}
				</div>
			</main>
			{/* <pre>{JSON.stringify(toc, null, 2)}</pre> */}
		</>
	)
}
