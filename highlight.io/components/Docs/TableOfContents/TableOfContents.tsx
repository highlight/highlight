import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ChevronRightIcon,
	MinusIcon,
} from '@heroicons/react/20/solid'
import { readFile } from 'fs/promises'
import matter from 'gray-matter'
import yaml from 'js-yaml'
import Link from 'next/link'
import path from 'path'
import { z } from 'zod'
import { removeOrderingPrefix } from '../../../pages/api/docs/github'
import { Typography } from '../../common/Typography/Typography'

import { Disclosure, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/router'
import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa'
import styles from '../Docs.module.scss'

export const DOCS_CONTENT_PATH = path.join(process.cwd(), '../docs-content')
const DOCS_GITUB_LINK = `https://github.com/highlight/highlight/blob/main/docs-content/`

export const docMetadataSchema = z.object({
	title: z.string(),
	heading: z.string().optional(),
	quickstart: z.boolean().optional(),
	type: z
		.union([
			z.literal('subtable'),
			z.literal('accordion'),
			z.literal('category'),
		])
		.default('accordion'),
})

export type DocMetadata = z.infer<typeof docMetadataSchema>

function getMarkdownLinks(content: string) {
	const mdLinkRegex = /[^!]\[.*?\]\((.*?)\)/g
	const hrefLinkRegex = /href="(.*?)"/g
	const matchedLinks = [...content.matchAll(mdLinkRegex)].map(
		([, link]) => link,
	)

	return new Set<string>(matchedLinks)
}

export function parseMarkdown(fileContents: string): {
	content: string
	links: Set<string>
	metadata: Record<string, unknown>
} {
	const { content, data } = matter(fileContents, {
		delimiters: ['---', '---'],
		engines: {
			yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as Object,
		},
	})

	const metadata = data
	const links = getMarkdownLinks(content)
	return { content, links, metadata }
}

export async function readMarkdownFile(filePath: string) {
	const fileContents = await readFile(path.join(filePath), 'utf-8')
	return parseMarkdown(fileContents)
}

export async function readDocFile(filePath: string) {
	const normalFilePath = path.normalize(filePath)

	const slugPath = removeOrderingPrefix(
		normalFilePath.replace(/(\/?index)?.md$/, ''),
	)

	const absoluteFilePath = path.join(DOCS_CONTENT_PATH, normalFilePath)

	const { metadata, content } = await readMarkdownFile(absoluteFilePath)
	const docMetadata = docMetadataSchema.parse(metadata)

	return {
		metadata: docMetadata,
		rawContent: content,
		isIndex: normalFilePath.endsWith('index.md'),
		isSdkDoc: slugPath.startsWith('sdk'),
		/** route to the file relative to the base docs directory @example "1_getting-started/nodejs.md" */
		filePath: normalFilePath,
		/** `this.filepath` without "/index.md" or ".md" at the end, or order prefix @example "getting-started/nodejs" */
		slugPath,
		/** absolute route to the doc file @example "/username/dev/highlight/highlight.io/docs-content/1_getting-started/nodejs.md" */
		absoluteFilePath,
		slug: slugPath.split('/').pop() ?? '',
	}
}

export function getDocPagination(
	doc: DocPage,
	allDocs: DocPage[],
): { previous: DocPage | undefined; next: DocPage | undefined } {
	const filteredDocs = allDocs.filter((d) => !d.isIndex)
	const index = filteredDocs.findIndex((d) => d.slugPath === doc.slugPath)
	const previous = filteredDocs[index - 1] // possibly undefined!
	const next = filteredDocs[index + 1] // possibly undefined!

	return { previous, next }
}

export function getDocTree(allDocs: DocPage[]) {}

export type DocPage = Awaited<ReturnType<typeof readDocFile>>

export type TocEntry = {
	docPage: DocPage
	subEntries: TocEntry[]
}

export function getTocEntry(docPage: DocPage, allPages: DocPage[]): TocEntry {
	const subEntries = allPages
		.filter(({ slugPath }) =>
			slugPath.match(new RegExp(`^${docPage.slugPath}\/?[^/]+$`)),
		)
		.map((subEntry) => getTocEntry(subEntry, allPages))
		.filter((page): page is TocEntry => !!page)

	return {
		docPage,
		subEntries,
	}
}

type SubNavigationCallback = (slugPath: {
	children: TocEntry[]
	title: string
	slugPath: string
}) => void

function TocCategory({
	title,
	subEntries,
	onSubtableNavigation,
	route,
	docPages,
}: {
	title: string
	subEntries: TocEntry[]
	onSubtableNavigation: SubNavigationCallback
	route: string
	docPages: DocPage[]
}) {
	return (
		<div className="border-y">
			<Typography type="copy4">{title}</Typography>
			<TableOfContentsSection
				docPages={docPages}
				tocEntries={subEntries}
				onSubtableNavigation={onSubtableNavigation}
				route={route}
			/>
		</div>
	)
}

/** Resolve a path to not lead to an index page, but to its first non-index item instead. if no matching entry found, or `path` is not an index path, returns `null` */
export function resolveDocIndexLink(
	docPages: DocPage[],
	path: string,
): string | null {
	const nonIndexDocsSlugPaths = docPages
		.filter((doc) => !doc.isIndex)
		.map((doc) => doc.slugPath)

	if (nonIndexDocsSlugPaths.includes(path)) return null // current path is not an index

	return (
		nonIndexDocsSlugPaths.find((docPath) => docPath.startsWith(path)) ??
		null
	)
}

const entryPlateStyle = classNames(
	'flex flex-row items-center gap-0.5 transition-all rounded min-h-7 py-0.5 hover:bg-divider-on-dark/30 group ',
)
const entryIconStyle = classNames(
	'flex-shrink-0 w-5 h-5 transition-all group-hover:text-copy-on-dark',
)

const entryTextStyle = classNames(
	'transition-all opacity-70 group-hover:opacity-100 text-copy-on-dark',
)

function TocSubtableItem({
	title,
	slugPath,
	onEnter,
	subEntries,
}: {
	title: string
	slugPath: string
	subEntries: TocEntry[]
	onEnter: SubNavigationCallback
}) {
	return (
		<Link
			onClick={() => onEnter({ children: subEntries, title, slugPath })}
			href={slugPath}
		>
			<div className={entryPlateStyle}>
				<ArrowRightIcon
					className={classNames(entryIconStyle, 'text-copy-on-light')}
				/>
				<Typography type="copy3" className={entryTextStyle}>
					{title}
				</Typography>
			</div>
		</Link>
	)
}

function TocEntry({
	title,
	slugPath,
	isIndex,
	subEntries,
	onSubtableNavigation,
	route,
	docPages,
}: {
	title: string
	slugPath: string
	isIndex: boolean
	subEntries: TocEntry[]
	onSubtableNavigation: SubNavigationCallback
	route: string
	docPages: DocPage[]
}) {
	const focused = route.includes(slugPath)

	return !isIndex ? (
		<Link href={'/docs/' + slugPath} className={entryPlateStyle}>
			<MinusIcon
				className={classNames(
					entryIconStyle,
					'transition-all text-copy-on-dark',
					focused
						? 'opacity-100 text-copy-on-dark'
						: 'text-divider-on-dark',
				)}
			/>
			<Typography
				type="copy3"
				onDark
				className={classNames(
					'transition-all text-copy-on-dark',
					focused
						? 'opacity-100 text-copy-on-dark'
						: 'opacity-70 group-hover:opacity-100',
				)}
			>
				{title}
			</Typography>
		</Link>
	) : (
		<Disclosure defaultOpen={focused}>
			{({ open }) => (
				<>
					<Disclosure.Button className={entryPlateStyle}>
						<ChevronRightIcon
							className={classNames(
								entryIconStyle,
								'text-copy-on-light',
								open && 'rotate-90',
							)}
						/>
						<Typography
							type="copy3"
							onDark
							className={entryTextStyle}
						>
							{title}
						</Typography>
					</Disclosure.Button>
					<Transition
						enter="transition duration-100 ease-out"
						enterFrom="transform scale-y-95 opacity-0 origin-top"
						enterTo="transform scale-y-100 opacity-100 origin-top"
						leave="transition duration-75 ease-out"
						leaveFrom="transform scale-y-100 opacity-100 origin-top"
						leaveTo="transform scale-y-95 opacity-0 origin-top"
					>
						<Disclosure.Panel className="flex flex-row gap-0.5">
							<div className="w-0.5 mx-[11px] flex-shrink-0 bg-divider-on-dark" />
							<TableOfContentsSection
								docPages={docPages}
								tocEntries={subEntries}
								onSubtableNavigation={onSubtableNavigation}
								route={route}
							/>
						</Disclosure.Panel>
					</Transition>
				</>
			)}
		</Disclosure>
	)
}

function TocSeparator() {
	return <div className="h-px my-3 bg-divider-on-dark" />
}

type SubtableStack = {
	title: string
	backLink: string
	backTitle: string
	slugPath: string
	children: TocEntry[]
}

export function TableOfContents({
	toc: tocEntries,
	docPages,
}: {
	toc: TocEntry[]
	docPages: DocPage[]
}) {
	const router = useRouter()
	const route = router.asPath.replace(/^\/docs\//, '')

	const [subtableStack, setSubtableStack] = useState<SubtableStack[]>([])

	const subtableStackTop: SubtableStack =
		subtableStack[subtableStack.length - 1]

	const renderedTable = subtableStackTop?.children ?? tocEntries

	const pushToStack: SubNavigationCallback = ({
		children,
		title,
		slugPath,
	}) => {
		setSubtableStack([
			...subtableStack,
			{
				backLink: router.asPath,
				children,
				title,
				slugPath,
				backTitle: subtableStackTop?.title
					? `to ${subtableStackTop?.title}`
					: 'Home',
			},
		])
	}

	const popFromStack = () => {
		setSubtableStack(subtableStack.slice(0, -1))
	}

	return (
		<div className="flex flex-col self-stretch">
			{subtableStackTop && (
				<>
					<Link
						className={entryPlateStyle}
						onClick={popFromStack}
						href={subtableStackTop?.backLink}
					>
						<ArrowLeftIcon
							className={classNames(
								entryIconStyle,
								'text-copy-on-light',
							)}
						/>
						<Typography
							type="copy3"
							onDark
							className={entryTextStyle}
						>
							Go back {subtableStackTop.backTitle}
						</Typography>
					</Link>
					<TocSeparator />
					<Typography type="copy3" emphasis onDark className="h-7">
						{subtableStackTop.title}
					</Typography>
				</>
			)}

			<TableOfContentsSection
				docPages={docPages}
				tocEntries={renderedTable}
				onSubtableNavigation={pushToStack}
				route={route}
			/>
		</div>
	)
}

function TableOfContentsSection({
	tocEntries,
	onSubtableNavigation,
	route,
	docPages,
}: {
	tocEntries: TocEntry[]
	onSubtableNavigation: SubNavigationCallback
	route: string
	docPages: DocPage[]
}) {
	const currentPage = tocEntries.find(
		(e) => e.docPage.slugPath.startsWith(route) && !e.docPage.isIndex,
	)

	const subtables = tocEntries.filter(
		(t) => t.docPage.metadata.type === 'subtable',
	)
	const singleEntries = tocEntries.filter((t) => !t.docPage.isIndex)
	const collapsibles = tocEntries.filter(
		(t) => t.docPage.isIndex && t.docPage.metadata.type !== 'subtable',
	)

	return (
		<div className="flex flex-col self-stretch flex-1">
			{currentPage?.docPage.isSdkDoc && <SdkTableOfContents />}
			{currentPage?.docPage.isSdkDoc && singleEntries.length > 0 && (
				<TocSeparator />
			)}
			{subtables.map(({ docPage, subEntries }) => {
				return (
					<TocSubtableItem
						key={docPage.slugPath}
						title={docPage.metadata.title}
						subEntries={subEntries}
						slugPath={
							resolveDocIndexLink(docPages, docPage.slugPath) ??
							docPage.slugPath
						}
						onEnter={onSubtableNavigation}
					/>
				)
			})}
			{singleEntries.length > 0 && subtables.length > 0 && (
				<TocSeparator />
			)}
			{singleEntries.map(({ docPage, subEntries }) => {
				return (
					<TocEntry
						key={docPage.slugPath}
						docPages={docPages}
						isIndex={docPage.isIndex}
						title={docPage.metadata.title}
						slugPath={docPage.slugPath}
						subEntries={subEntries}
						onSubtableNavigation={onSubtableNavigation}
						route={route}
					/>
				)
			})}
			{collapsibles.length > 0 && singleEntries.length > 0 && (
				<TocSeparator />
			)}
			{collapsibles.map(({ docPage, subEntries }) => {
				return (
					<TocEntry
						key={docPage.slugPath}
						docPages={docPages}
						isIndex={docPage.isIndex}
						title={docPage.metadata.title}
						slugPath={docPage.slugPath}
						subEntries={subEntries}
						onSubtableNavigation={onSubtableNavigation}
						route={route}
					/>
				)
			})}
		</div>
	)
}

/* export const TableOfContentsOld = ({
	toc,
	docPaths,
	openParent,
	openTopLevel = false,
	onNavigate,
}: {
	toc: TocEntry
	openParent: boolean
	openTopLevel?: boolean
	docPaths: DocPage[]
	onNavigate?: () => void
}) => {
	const hasChildren = !!toc?.children.length

	const [isCurrentPage, setIsCurrentPage] = useState(false)
	const isTopLevel =
		toc.slug === docPaths[toc.tocIndex || 0]?.slugPath.split('/')[0]
	const [open, setOpen] = useState(isTopLevel || openTopLevel)

	useEffect(() => {
		const currentPage = path.join(
			'/docs',
			docPaths[toc.tocIndex || 0]?.slugPath || '',
		)
		setIsCurrentPage(currentPage === window.location.pathname)
		const isParentOfCurrentPage = window.location.pathname.includes(
			docPaths[toc.tocIndex || 0]?.slugPath,
		)
		setOpen((prevOpenState) => prevOpenState || isParentOfCurrentPage)
		onNavigate?.()
	}, [docPaths, toc.tocIndex, onNavigate])

	return (
		<div className="max-w-full">
			{hasChildren ? (
				<div
					className={styles.tocRow}
					onClick={() => setOpen((o) => !o)}
				>
					<ChevronDownIcon
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
						{toc.heading}
					</Typography>
				</div>
			) : (
				<Link
					href={path.join(
						'/docs',
						docPaths[toc.tocIndex || 0]?.slugPath || '',
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
						<MinusIcon
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
							{toc?.heading || 'nope'}
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
								key={t.tocIndex}
								toc={t}
							/>
						))}
					</div>
				</div>
			</Collapse>
		</div>
	)
} */

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

export function SdkTableOfContents() {
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
						className={entryPlateStyle}
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
						<MinusIcon
							className={classNames(
								entryIconStyle,
								heading.id === activeId
									? 'opacity-100 text-copy-on-dark'
									: 'opacity-70 group-hover:opacity-100 text-copy-on-light',
							)}
						/>
						<Typography
							type="copy3"
							onDark
							className={classNames(
								'transition-all text-copy-on-dark',
								heading.id === activeId
									? 'opacity-100 text-copy-on-dark'
									: 'opacity-70 group-hover:opacity-100',
								'text-ellipsis overflow-hidden',
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

export const PageRightBar = ({
	relativePath,
}: {
	title: string
	relativePath: string
}) => {
	const { nestedHeadings } = useHeadingsData('h5,h6')
	const [activeId, setActiveId] = useState<string>()
	useIntersectionObserver(setActiveId)

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
				<Link
					className={styles.socialItem}
					href={`${DOCS_GITUB_LINK}${relativePath}`.replaceAll(
						/\/+/g,
						'/',
					)}
					target="_blank"
				>
					<FaGithub style={{ height: 20, width: 20 }}></FaGithub>
					<Typography type="copy3">Suggest Edits?</Typography>
				</Link>
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
