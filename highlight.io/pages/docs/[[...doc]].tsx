import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { GetStaticPaths, GetStaticProps } from 'next/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'
import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa'
import {
	CalendlyModal,
	EnterpriseSelfHostCalendlyComponent,
} from '../../components/common/CalendlyModal/CalendlyModal'
import { Roadmap, RoadmapItem } from '../../components/common/Roadmap/Roadmap'
import {
	AutoplayVideo,
	DocsCard,
	DocsCardGroup,
	EmbeddedVideo,
	MarkdownList,
	MissingFrameworkCopy,
	QuickStart,
} from '../../components/MDXRemote'
import {
	QuickStartContent,
	quickStartContent,
} from '../../components/QuickstartContent/QuickstartContent'
import { IGNORED_DOCS_PATHS, processDocPath } from '../api/docs/github'

import classNames from 'classnames'
import { promises as fsp } from 'fs'
import { serialize } from 'next-mdx-remote/serialize'
import Link from 'next/link'
import { useRouter } from 'next/router'
import path from 'path'
import { Collapse } from 'react-collapse'
import remarkGfm from 'remark-gfm'
import { Meta } from '../../components/common/Head/Meta'
import Navbar from '../../components/common/Navbar/Navbar'
import { roadmapFetcher } from '../../components/common/Roadmap/RoadmapUtils'
import { Typography } from '../../components/common/Typography/Typography'
import { Callout } from '../../components/Docs/Callout/Callout'
import { DocSection } from '../../components/Docs/DocLayout/DocLayout'
import styles from '../../components/Docs/Docs.module.scss'
import DocSelect from '../../components/Docs/DocSelect/DocSelect'
import { generateIdFromProps } from '../../components/Docs/DocsTypographyRenderer/DocsTypographyRenderer'
import { HighlightCodeBlock } from '../../components/Docs/HighlightCodeBlock/HighlightCodeBlock'
import { useMediaQuery } from '../../components/MediaQuery/MediaQuery'
import logger from '../../highlight.logger'
import ChevronDown from '../../public/images/ChevronDownIcon'
import Minus from '../../public/images/MinusIcon'
import { readMarkdown, removeOrderingPrefix } from '../../shared/doc'

const DOCS_CONTENT_PATH = path.join(process.cwd(), '../docs-content')
const DOCS_GITHUB_LINK = `github.com/highlight/highlight/blob/main/docs-content`
export interface DocPath {
	// e.g. '[tips, sessions-search-deep-linking.md]'
	array_path: string[]
	// e.g. 'tips/sessions-search-deep-linking.md'
	simple_path: string
	// e.g. '[/tips, /getting-started/client-sdk]'
	embedded_links: string[]
	// e.g. /Users/jaykhatri/projects/highlight-landing/s/tips/sessions-search-deep-linking.md
	total_path: string
	// e.g. 'tips/sessions-search-deep-linking.md'
	rel_path: string
	// whether the path has an index.md file in it or a "homepage" of some sort for that directory.
	indexPath: boolean
	// metadata stored at the top of each md file.
	metadata: any
	isSdkDoc: boolean
	content: string
}

type DocLink = {
	metadata: any
	simple_path: string
	array_path: string[]
	hasContent: boolean
}

type DocData = {
	markdownText: MDXRemoteSerializeResult | null
	markdownTextOG?: string
	relPath?: string
	quickstartContent?: QuickStartContent
	slug: string
	toc: TocEntry
	docOptions: DocLink[]
	metadata?: {
		title: string
		metaTitle?: string
		slug: string
		heading: string
	}
	isSdkDoc?: boolean
	docIndex: number
	redirect?: string
}

const useHeadingsData = (headingTag: string) => {
	const router = useRouter()
	const [nestedHeadings, setNestedHeadings] = useState<any>([])

	useEffect(() => {
		const headingElements = Array.from(
			document.querySelectorAll(headingTag),
		)
		setNestedHeadings(headingElements)
	}, [headingTag, router.query])

	return { nestedHeadings }
}

// Checks which header is currently in view, and highlights the table of content item on the right.
const useIntersectionObserver = (setActiveId: (s: string) => void) => {
	const router = useRouter()
	const headingElementsRef = useRef<any>({})
	useEffect(() => {
		const callback = (headings: any) => {
			headingElementsRef.current = {}
			headingElementsRef.current = headings.reduce(
				(map: any, headingElement: any) => {
					map[headingElement.target.id] = headingElement
					return map
				},
				headingElementsRef.current,
			)

			const visibleHeadings: any = []
			Object.keys(headingElementsRef.current).forEach((key) => {
				const headingElement = headingElementsRef.current[key]
				if (headingElement.isIntersecting)
					visibleHeadings.push(headingElement)
			})

			if (visibleHeadings.length >= 1) {
				setActiveId(visibleHeadings[0].target.id)
			}
		}

		const observer = new IntersectionObserver(callback, {
			rootMargin: '-5% 0px -90% 0px',
			threshold: 0.0001,
		})

		const headingElements = Array.from(
			document.querySelectorAll('h4, h5, h6'),
		)
		headingElements.forEach((element) => observer.observe(element))

		return () => observer.disconnect()
	}, [setActiveId, router.query])
}

const sortByFilePrefix = (a: string, b: string) => {
	const firstStringSplit = a.split('_')
	const secondStringSplit = b.split('_')
	const firstPrefix = Number(firstStringSplit[0])
	const secondPrefix = Number(secondStringSplit[0])
	if (firstPrefix && secondPrefix && firstPrefix != secondPrefix) {
		return firstPrefix - secondPrefix
	} else if (firstPrefix && !secondPrefix) {
		return -1
	} else if (!firstPrefix && secondPrefix) {
		return 1
	}
	const firstFileString = firstStringSplit[firstStringSplit.length - 1]
	const secondFileString = secondStringSplit[secondStringSplit.length - 1]
	if (firstFileString > secondFileString) {
		return 1
	}
	if (firstFileString < secondFileString) {
		return -1
	}
	if (firstFileString === secondFileString) {
		return 0
	}
}

const isValidDirectory = (files: string[]) => {
	return files.find((filename) => filename.includes('index.md')) != null
}

// we need to explicitly pass in 'fs_api' because webpack isn't smart enough to
// know that this is only being called in server-side functions.
export const getDocsPaths = async (
	fs_api: any,
	base: string | undefined,
): Promise<DocPath[]> => {
	// each docpath needs to have some hierarchy (so we know if its nested, etc..)
	// each path can either be:
	// - parent w/o content
	// - parent w/ content
	// if (!base) {
	//   base = 'general-docs';
	// }
	base = base ?? ''
	const full_path = path.join(DOCS_CONTENT_PATH, base)
	const read = await fs_api.readdir(full_path)
	if (!isValidDirectory(read)) {
		throw new Error(
			`${full_path} does not contain an index.md file. An index.md file is required for all documentation directories. `,
		)
	}
	read.sort(sortByFilePrefix)
	let paths: DocPath[] = []
	for (var i = 0; i < read.length; i++) {
		const file_string = read[i]
		if (IGNORED_DOCS_PATHS.has(file_string)) {
			continue
		}
		let total_path = path.join(full_path, file_string)
		const file_path = await fs_api.stat(total_path)
		if (file_path.isDirectory()) {
			paths = paths.concat(
				await getDocsPaths(fs_api, path.join(base, file_string)),
			)
		} else {
			const pp = processDocPath(base, file_string)
			const { data, links, content } = await readMarkdown(
				fsp,
				path.join(total_path || ''),
			)
			const hasRequiredMetadata = ['title'].every((item) =>
				data.hasOwnProperty(item),
			)
			if (!hasRequiredMetadata) {
				throw new Error(
					`${total_path} does not contain all required metadata fields. Fields "title" are required. `,
				)
			}
			paths.push({
				simple_path: pp,
				array_path: pp.split('/'),
				embedded_links: Array.from(links),
				total_path,
				isSdkDoc: pp.startsWith('sdk/'),
				rel_path: total_path.replace(DOCS_CONTENT_PATH, ''),
				indexPath: file_string.includes('index.md'),
				metadata: data,
				content: content,
			})
		}
	}
	return paths
}

function sortBySlashLength(docPaths: DocPath[]): DocPath[] {
	let trees: any[] = []
	let dataIndice: any = {}
	for (let key in docPaths) {
		dataIndice[docPaths[key].simple_path] = key
	}

	docPaths.forEach((item) => {
		const nodes = item.simple_path.split('/')
		let children = trees

		for (const label of nodes) {
			let node = {
				label: label,
				children: [],
			}
			if (children.length === 0) {
				children.push(node)
			}

			let isExist = false
			for (let child of children) {
				if (child.label === node.label) {
					children = child.children
					isExist = true
					break
				}
			}

			if (!isExist) {
				children.push(node)
				children = children[children.length - 1].children
			}
		}
	})

	let sortedPaths: string[] = []
	let ret: any[] = []

	function dfs(data: any, path: string) {
		if (data.children.length === 0) {
			sortedPaths.push(path)
			if (dataIndice[path]) {
				ret.push(docPaths[dataIndice[path]])
			}
			return
		}

		for (let child of data.children) {
			if (!(path === '' || sortedPaths.includes(path))) {
				sortedPaths.push(path)
				if (dataIndice[path]) {
					ret.push(docPaths[dataIndice[path]])
				}
			}
			let prefix = path === '' ? path : path + '/'
			dfs(child, prefix + child.label)
		}
	}

	dfs({ label: '', children: trees }, '')

	return ret
}

export const getStaticPaths: GetStaticPaths = async () => {
	const docPaths = sortBySlashLength(await getDocsPaths(fsp, undefined))
	const staticPaths = [...docPaths].map((p) => {
		const joined = path.join('/docs', p.simple_path)
		return joined
	})
	return {
		paths: staticPaths,
		fallback: 'blocking',
	}
}

interface TocEntry {
	tocHeading?: string
	tocSlug: string
	docPathId?: number | null
	children: TocEntry[]
}

// Filter quickStartContent to only include the keys that are needed for the current doc
function getFilteredQuickStartContent(
	newContent: string,
	quickStartContent: any,
) {
	const regex = /\{(\w+(?:\["[^"]+"\])+)\}/
	const match = newContent.match(regex)

	if (match) {
		const keyString = match[1]
		const quickStartContentMatches = keyString
			.split(/\["|\"]/)
			.filter((key) => key && key !== 'quickStartContent')

		const getFilteredValue = (obj: any, keys: string[]) =>
			keys.reduce((acc, key) => acc?.[key] ?? null, obj)

		const filteredQuickStartContent = quickStartContentMatches.reduceRight(
			(obj, key) => ({ [key]: obj }),
			getFilteredValue(quickStartContent, quickStartContentMatches),
		)

		return filteredQuickStartContent
	} else {
		return quickStartContent
	}
}

export const getStaticProps: GetStaticProps<DocData> = async (context) => {
	logger.info(
		{ params: context?.params },
		`docs getStaticProps ${context?.params?.doc}`,
	)
	const docPaths = sortBySlashLength(await getDocsPaths(fsp, undefined))

	// const sdkPaths = await getSdkPaths(fsp, undefined);
	let toc: TocEntry = {
		tocHeading: 'Home',
		tocSlug: 'home',
		docPathId: null,
		children: [],
	}

	const indexDocsSimplePaths = docPaths
		.filter((doc) => !doc.indexPath)
		.map((doc) => doc.simple_path)

	let docid = 0
	const linkingErrors: Array<string> = []
	for (const d of docPaths) {
		for (const l of d.embedded_links) {
			const baseLink = l.split('#')[0]
			if (baseLink.startsWith('http') || baseLink.startsWith('mailto')) {
				continue
			}
			const fullPath = path.join(DOCS_CONTENT_PATH, d.rel_path)
			const linkedDocPath = path.resolve(fullPath, '..', baseLink)
			var result
			try {
				result = await fsp.stat(linkedDocPath)
			} catch (e) {
				linkingErrors.push(`doc: ${d.rel_path}\nlink: ${linkedDocPath}`)
			}
		}
		let currentEntry = toc
		// build a tree of TOC entries.
		for (const a of d.array_path) {
			// for each of the array parts:
			// 1. in the current TOC entry, check if a child exists that matches the current docpath
			// 2. if not, create it. if so, set the new current toc entry
			let foundEntry = currentEntry?.children.find((t) => {
				return t.tocSlug === a
			})
			if (!foundEntry) {
				foundEntry = {
					tocSlug: a,
					children: [],
				}
				currentEntry?.children.push(foundEntry)
			}
			if (d.array_path.indexOf(a) == d.array_path.length - 1) {
				foundEntry.docPathId = docid
				foundEntry.tocHeading =
					docPaths[docid].metadata.toc ||
					docPaths[docid].metadata.title ||
					'missing metadata.toc'
			}
			currentEntry = foundEntry
		}
		docid++
	}

	if (linkingErrors.length > 0) {
		throw `the following docs had ${
			linkingErrors.length
		} broken links: \n\n${linkingErrors.join('\n ---------- \n')}`
	}

	const currentDoc = docPaths.find((d) => {
		return (
			JSON.stringify(d.array_path) ===
			JSON.stringify(context?.params?.doc || [''])
		)
	})

	const currentDocIndex = docPaths.findIndex((d) => {
		return (
			JSON.stringify(d.array_path) ===
			JSON.stringify(context?.params?.doc || [''])
		)
	})
	if (!currentDoc) {
		return {
			notFound: true,
		}
	}
	const absPath = path.join(currentDoc.total_path || '')

	// the metadata in a file starts with "" and ends with "---" (this is the archbee format).
	const { content } = await readMarkdown(fsp, absPath)
	const newContent = resolveEmbeddedLinksFromMarkdown(
		content,
		currentDoc.rel_path,
	)

	const newerContent = resolveEmbeddedLinksFromHref(
		newContent,
		currentDoc.rel_path,
	)

	let redirect = ''

	if (!indexDocsSimplePaths.includes(currentDoc.simple_path)) {
		const target = indexDocsSimplePaths.find((path) =>
			path.startsWith(currentDoc.simple_path),
		)
		redirect = target ?? ''
	}

	let roadmapData = null
	if (currentDoc.rel_path.includes('roadmap')) {
		roadmapData = await roadmapFetcher()
	}

	return {
		props: {
			metadata: currentDoc.metadata,
			markdownText: !currentDoc.isSdkDoc
				? await serialize(newerContent, {
						scope: {
							path: currentDoc.rel_path,
							// Only filter quickStartContent if it exists in the markdown
							quickStartContent: newContent.includes(
								'quickStartContent',
							)
								? getFilteredQuickStartContent(
										newContent,
										quickStartContent,
									)
								: null,
							roadmapData: roadmapData,
						},
						mdxOptions: {
							remarkPlugins: [remarkGfm],
						},
					})
				: null,
			markdownTextOG: newContent,
			slug: currentDoc.simple_path,
			relPath: currentDoc.rel_path,
			docIndex: currentDocIndex,
			docOptions: docPaths.map((d) => {
				return {
					metadata: d.metadata,
					simple_path: d.simple_path,
					array_path: d.array_path,
					hasContent: d.content != '',
				}
			}),
			isSdkDoc: currentDoc.isSdkDoc,
			toc,
			redirect,
		},
		revalidate: 60 * 30, // Cache response for 30 minutes
	}
}

const SdkTableOfContents = () => {
	const { nestedHeadings } = useHeadingsData('h4')
	const router = useRouter()
	const [activeId, setActiveId] = useState<string>()
	useIntersectionObserver(setActiveId)

	useEffect(() => {
		const selectedId = router.asPath.split('#')
		if (selectedId.length > 1) {
			document.querySelector(`#${selectedId[1]}`)?.scrollIntoView({
				behavior: 'smooth',
			})
		}
	}, [router.asPath])

	return (
		<>
			{nestedHeadings.map((heading: HTMLHeadingElement, i: number) => (
				<Link href={`#${heading.id}`} key={i} legacyBehavior>
					<a
						className={styles.tocRow}
						onClick={(e) => {
							e.preventDefault()
							document
								.querySelector(`#${heading.id}`)
								?.scrollIntoView({
									behavior: 'smooth',
								})
							const basePath = router.asPath.split('#')[0]
							const newUrl = `${basePath}#${heading.id}`
							window.history.replaceState(
								{
									...window.history.state,
									as: newUrl,
									url: newUrl,
								},
								'',
								newUrl,
							)
						}}
					>
						<Minus
							className={classNames(
								styles.tocIcon,
								styles.tocChild,
								{
									[styles.tocItemCurrent]:
										heading.id === activeId,
								},
							)}
						/>
						<Typography
							type="copy3"
							className={classNames(
								styles.tocItem,
								styles.tocChild,
								{
									[styles.tocItemCurrent]:
										heading.id === activeId,
								},
							)}
						>
							{heading.innerText || 'nope'}
						</Typography>
					</a>
				</Link>
			))}
		</>
	)
}

const PageRightBar = ({
	relativePath,
}: {
	title: string
	relativePath: string
}) => {
	const { nestedHeadings } = useHeadingsData('h5,h6')
	const [activeId, setActiveId] = useState<string>()
	useIntersectionObserver(setActiveId)

	const suggestLink =
		'https://' +
		`${DOCS_GITHUB_LINK}${relativePath}`.replaceAll(/\/+/g, '/')

	return (
		<div className={styles.rightBarWrap}>
			<div className={styles.resourcesSideBar}>
				<Link
					className={styles.socialItem}
					href="https://discord.gg/yxaXEAqgwN"
					target="_blank"
					style={{ borderBottom: '1px solid #30294E' }}
				>
					<FaDiscord style={{ height: 20, width: 20 }}></FaDiscord>
					<Typography type="copy3">Community / Support</Typography>
				</Link>
				<a
					className={styles.socialItem}
					href={suggestLink}
					target="_blank"
				>
					<FaGithub style={{ height: 20, width: 20 }}></FaGithub>
					<Typography type="copy3">Suggest Edits?</Typography>
				</a>
				<Link
					style={{ borderTop: '1px solid #30294E' }}
					className={styles.socialItem}
					href="https://twitter.com/highlightio"
					target="_blank"
				>
					<FaTwitter style={{ height: 20, width: 20 }}></FaTwitter>
					<Typography type="copy3">Follow us!</Typography>
				</Link>
			</div>
			{nestedHeadings.length > 0 && (
				<div className={styles.pageContentTable}>
					<div className={styles.pageContentList}>
						<ul>
							{nestedHeadings.map(
								(heading: HTMLHeadingElement) => (
									<li
										key={heading.id}
										className={classNames({
											[styles.active]:
												heading.id === activeId,
										})}
										style={{ padding: '2px 4px' }}
									>
										<Link
											href={`#${heading.id}`}
											onClick={(e) => {
												e.preventDefault()
												document
													.querySelector(
														`#${heading.id}`,
													)
													?.scrollIntoView({
														behavior: 'smooth',
													})
												window.history.pushState(
													{},
													'',
													`#${heading.id}`,
												)
											}}
										>
											<span>{heading.innerText}</span>
										</Link>
									</li>
								),
							)}
						</ul>
					</div>
				</div>
			)}
		</div>
	)
}

const TableOfContents = ({
	toc,
	docPaths,
	openParent,
	openTopLevel = false,
	onNavigate,
}: {
	toc: TocEntry
	openParent: boolean
	openTopLevel?: boolean
	docPaths: DocLink[]
	onNavigate?: () => void
}) => {
	const hasChildren = !!toc?.children.length

	const [isCurrentPage, setIsCurrentPage] = useState(false)
	const isTopLevel =
		toc.tocSlug === docPaths[toc.docPathId || 0]?.array_path[0]
	const [open, setOpen] = useState(isTopLevel || openTopLevel)

	useEffect(() => {
		const currentPage = path.join(
			'/docs',
			docPaths[toc.docPathId || 0]?.simple_path || '',
		)
		setIsCurrentPage(currentPage === window.location.pathname)
		const isParentOfCurrentPage = window.location.pathname.includes(
			docPaths[toc.docPathId || 0]?.simple_path,
		)
		setOpen((prevOpenState) => prevOpenState || isParentOfCurrentPage)
		onNavigate?.()
	}, [docPaths, toc.docPathId, onNavigate])

	return (
		<div className="max-w-full">
			{hasChildren ? (
				<div
					className={styles.tocRow}
					onClick={() => setOpen((o) => !o)}
				>
					<ChevronDown
						className={classNames(styles.tocIcon, {
							[styles.tocItemChevronClosed]: hasChildren && !open,
							[styles.tocItemOpen]: hasChildren && open,
							[styles.tocItemCurrent]:
								!hasChildren && open && isCurrentPage,
							[styles.tocChild]: !isTopLevel,
						})}
					/>
					<Typography
						type="copy3"
						emphasis={isTopLevel}
						className={classNames(styles.tocItem, {
							[styles.tocItemOpen]: hasChildren && open,
							[styles.tocItemCurrent]:
								(!hasChildren || open) && isCurrentPage,
							[styles.tocChild]: !isTopLevel,
						})}
					>
						{toc?.tocHeading || 'nope'}
					</Typography>
				</div>
			) : (
				<Link
					href={path.join(
						'/docs',
						docPaths[toc.docPathId || 0]?.simple_path || '',
					)}
					legacyBehavior
				>
					<a
						className={styles.tocRow}
						onClick={() => {
							setOpen((o) => !o)
							if (window.scrollY >= 124) {
								sessionStorage.setItem('scrollPosition', '124')
							} else {
								sessionStorage.setItem('scrollPosition', '0')
							}
						}}
					>
						<Minus
							className={classNames(styles.tocIcon, {
								[styles.tocItemOpen]: hasChildren,
								[styles.tocItemCurrent]:
									!hasChildren && isCurrentPage,
								[styles.tocChild]: !isTopLevel,
							})}
						/>
						<Typography
							type="copy3"
							emphasis={isTopLevel}
							className={classNames(styles.tocItem, {
								[styles.tocItemOpen]: hasChildren && open,
								[styles.tocItemCurrent]:
									(!hasChildren || open) && isCurrentPage,
								[styles.tocChild]: !isTopLevel,
							})}
						>
							{toc?.tocHeading || 'nope'}
						</Typography>
					</a>
				</Link>
			)}
			<Collapse isOpened={open}>
				<div className={styles.tocChildren}>
					<div className={styles.tocChildrenLineWrapper}>
						<div className={styles.tocChildrenLine}></div>
					</div>
					<div className={styles.tocChildrenContent}>
						{toc?.children.map((t) => (
							// TODO(jaykhatri) - this 'docPaths' concept has to be stateful 🤔.
							<TableOfContents
								openParent={open && !isTopLevel}
								docPaths={docPaths}
								key={t.docPathId}
								toc={t}
							/>
						))}
					</div>
				</div>
			</Collapse>
		</div>
	)
}

const getBreadcrumbs = (
	metadata: any,
	docOptions: DocLink[],
	docIndex: number,
) => {
	const trail: { title: string; path: string; hasContent: boolean }[] = [
		{ title: 'Docs', path: '/docs', hasContent: true },
	]
	if (metadata && docOptions) {
		// const currentDocIndex = docOptions?.findIndex(
		//   (d) => d?.metadata?.slug === metadata?.slug
		// );
		const currentDoc = docOptions[docIndex]
		const pathToSearch: string[] = []
		currentDoc.array_path.forEach((section) => {
			pathToSearch.push(section)
			const simplePath = pathToSearch.join('/')
			const nextBreadcrumb = docOptions.find(
				(d) => d?.simple_path === simplePath,
			)
			trail.push({
				title: nextBreadcrumb?.metadata?.title,
				path: `/docs/${nextBreadcrumb?.simple_path}`,
				hasContent: nextBreadcrumb?.hasContent || false,
			})
		})
	}
	return trail
}

export default function DocPage({
	markdownText,
	markdownTextOG,
	relPath,
	slug,
	toc,
	isSdkDoc,
	docIndex,
	redirect,
	docOptions,
	metadata,
}: DocData) {
	const blogBody = useRef<HTMLDivElement>(null)
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const closeMenu = useCallback(() => setOpen(false), [])

	const isQuickstart = metadata && 'quickstart' in metadata

	const description = (markdownTextOG || '')
		.replaceAll(/[`[(]+.+[`\])]+/gi, '')
		.replaceAll(/#+/gi, '')
		.split('\n')
		.join(' ')

	useEffect(() => {
		if (redirect) router.replace(redirect)
	}, [redirect, router])

	useEffect(() => {
		const storedScrollPosition = parseInt(
			sessionStorage.getItem('scrollPosition') ?? '0',
		)

		if (storedScrollPosition) {
			window.scrollTo(0, storedScrollPosition)
			sessionStorage.setItem('scrollPosition', '0')
		}
	}, [router])

	const currentToc = toc?.children.find(
		(c) => c.tocSlug === relPath?.split('/').filter((r) => r)[0],
	)

	const is400 = useMediaQuery(400)

	return (
		<>
			<Meta
				title={
					metadata?.metaTitle?.length
						? metadata?.metaTitle
						: metadata?.title?.length
							? metadata?.title === 'Welcome to Highlight'
								? 'Documentation'
								: metadata?.title
							: ''
				}
				description={description}
				absoluteImageUrl={`https://${
					process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
				}/api/og/doc${relPath?.replace('.md', '')}`}
				canonical={`/docs/${slug}`}
			/>
			<Navbar title="Docs" hideBanner isDocsPage fixed />
			<main ref={blogBody} className={styles.mainWrapper}>
				<div className={styles.leftSection}>
					<div className={styles.leftInner}>
						<DocSelect />
					</div>
					<div className={styles.tocMenuLarge}>
						{isSdkDoc ? (
							<SdkTableOfContents />
						) : (
							currentToc?.children.map((t) => {
								return (
									<TableOfContents
										openTopLevel={true}
										key={t.docPathId}
										toc={t}
										openParent={true}
										docPaths={docOptions}
									/>
								)
							})
						)}
					</div>
					<div
						className={classNames(styles.tocRow, styles.tocMenu)}
						onClick={() => setOpen((o) => !o)}
					>
						<div className={styles.tocMenuLabel}>
							<ChevronDown
								className={classNames(styles.tocIcon, {
									[styles.tocItemOpen]: open,
								})}
							/>
							<Typography
								type="copy3"
								emphasis
								className={classNames(styles.tocItem, {
									[styles.tocItemOpen]: open,
								})}
							>
								Menu
							</Typography>
						</div>
					</div>
					<Collapse isOpened={open}>
						<div
							className={classNames(
								styles.tocContents,
								styles.tocMenu,
							)}
						>
							{isSdkDoc ? (
								<SdkTableOfContents />
							) : (
								toc?.children.map((t) => (
									<TableOfContents
										key={t.docPathId}
										toc={t}
										docPaths={docOptions}
										openParent={false}
										openTopLevel={false}
										onNavigate={closeMenu}
									/>
								))
							)}
						</div>
					</Collapse>
				</div>
				<div className={styles.contentSection}>
					<div
						className={classNames(
							'DocSearch-content',
							styles.centerSection,
							{
								[styles.sdkCenterSection]: isSdkDoc,
								[styles.quickStartCenterSection]: isQuickstart,
							},
						)}
					>
						<div className={styles.breadcrumb}>
							{!isSdkDoc &&
								getBreadcrumbs(
									metadata,
									docOptions,
									docIndex,
								).map((breadcrumb, i) =>
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
								[styles.sdkPageTitle]: isSdkDoc,
							})}
						>
							{metadata?.heading
								? metadata.heading
								: metadata?.title
									? metadata.title
									: ''}
						</h3>
						{isSdkDoc ? (
							<DocSection content={markdownTextOG || ''} />
						) : (
							<>
								<div className={styles.contentRender}>
									{markdownText && (
										<MDXRemote
											components={{
												AutoplayVideo,
												CalendlyModal,
												EmbeddedVideo,
												MissingFrameworkCopy,
												Roadmap,
												RoadmapItem,
												QuickStart,
												Typography,
												DocsCard,
												EnterpriseSelfHostCalendlyComponent,
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
																		? (props.className
																				.split(
																					'language-',
																				)
																				.pop() ??
																			'js')
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
											{...markdownText}
										/>
									)}
								</div>
							</>
						)}
						<div className={styles.pageNavigateRow}>
							{docIndex > 0 ? (
								<Link
									href={
										docOptions[docIndex - 1]?.simple_path ??
										''
									}
									passHref
									className={styles.pageNavigate}
								>
									<BiChevronLeft />
									<Typography type="copy2">
										{
											docOptions[docIndex - 1]?.metadata
												.title
										}
									</Typography>
								</Link>
							) : (
								<div></div>
							)}
							{docIndex < docOptions?.length - 1 ? (
								<Link
									href={
										docOptions[docIndex + 1]?.simple_path ??
										''
									}
									passHref
									className={styles.pageNavigate}
								>
									<Typography type="copy2">
										{
											docOptions[docIndex + 1].metadata
												.title
										}
									</Typography>
									<BiChevronRight />
								</Link>
							) : (
								<div></div>
							)}
						</div>
					</div>
					{!isSdkDoc && !isQuickstart && (
						<div className={styles.rightSection}>
							<PageRightBar
								title={metadata ? metadata.title : ''}
								relativePath={relPath ? relPath : ''}
							/>
						</div>
					)}
				</div>
			</main>
		</>
	)
}

// function that takes a markdown string, and replaces all of the relative links with links in the form "/docs..."
// relativePath is the relative path of the doc that this link lives in.
const resolveEmbeddedLinksFromMarkdown = (
	markdownContent: string,
	relativePath: string,
): string => {
	const regex = /\[(.*?)\]\((.*?)\)/g
	// replace all of the links in the markdown file
	const newContent = markdownContent.replaceAll(regex, (_, text, link) => {
		if (
			link.startsWith('http') ||
			link.startsWith('mailto') ||
			link.startsWith('/images')
		) {
			return `[${text}](${link})`
		}
		return `[${text}](${resolveEmbeddedLink(link, relativePath)})`
	})

	return newContent
}

const resolveEmbeddedLinksFromHref = (
	markdownContent: string,
	relativePath: string,
): string => {
	// regex for matching text in the form href="..."
	const hrefRegex = /href="(.*)"/g
	// replace all of the links in the markdown file
	const newContent = markdownContent.replaceAll(hrefRegex, (_, text) => {
		if (
			text.startsWith('http') ||
			text.startsWith('mailto') ||
			text.startsWith('/images')
		) {
			return `href="${text}"`
		}
		return `href="${resolveEmbeddedLink(text, relativePath)}"`
	})

	return newContent
}

const resolveEmbeddedLink = (
	linkString: string,
	relativePath: string,
): string => {
	var absolutePath = path
		.resolve(relativePath, '..', linkString)
		.replace('.md', '')
	absolutePath = removeOrderingPrefix(absolutePath)
	const withDocs = path.join('/docs', absolutePath)
	return withDocs
}
