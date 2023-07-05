import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ChevronDownIcon,
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
import { useState } from 'react'

export const DOCS_CONTENT_PATH = path.join(process.cwd(), '../docs-content')

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

export function parseDocMarkdown(fileContents: string): {
	content: string
	metadata: DocMetadata
} {
	const { content, data } = matter(fileContents, {
		delimiters: ['---', '---'],
		engines: {
			yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as Object,
		},
	})

	const metadata = docMetadataSchema.parse(data)
	return { content, metadata }
}

export async function readMarkdownFile(filePath: string) {
	const fileContents = await readFile(path.join(filePath), 'utf-8')
	return parseDocMarkdown(fileContents)
}

export async function readDocFile(filePath: string) {
	const normalFilePath = path.normalize(filePath)

	const slugPath = removeOrderingPrefix(
		normalFilePath.replace(/(\/?index)?.md$/, ''),
	)

	const absoluteFilePath = path.join(DOCS_CONTENT_PATH, normalFilePath)

	const { metadata, content } = await readMarkdownFile(absoluteFilePath)

	return {
		metadata,
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

function TocCategory({
	title,
	subEntries,
}: {
	title: string
	subEntries: TocEntry[]
}) {
	return (
		<div className="border-y">
			<Typography type="copy4">{title}</Typography>
			<TableOfContents toc={subEntries} />
		</div>
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
}: {
	title: string
	slugPath: string
	onEnter: (slugPath: string) => void
}) {
	/* TODO (fabio): icon in props */

	return (
		<button onClick={() => onEnter(slugPath)}>
			<div className={entryPlateStyle}>
				<ArrowRightIcon
					className={classNames(entryIconStyle, 'text-copy-on-light')}
				/>
				<Typography type="copy3" className={entryTextStyle}>
					{title}
				</Typography>
			</div>
		</button>
	)
}

function TocEntry({
	title,
	slugPath,
	isIndex,
	subEntries,
}: {
	title: string
	slugPath: string
	isIndex: boolean
	subEntries: TocEntry[]
}) {
	return !isIndex ? (
		<Link href={'/docsnew/' + slugPath} className={entryPlateStyle}>
			<MinusIcon
				className={classNames(entryIconStyle, 'text-divider-on-dark')}
			/>
			<Typography type="copy3" onDark className={entryTextStyle}>
				{title}
			</Typography>
		</Link>
	) : (
		<Disclosure>
			<Disclosure.Button className={entryPlateStyle}>
				<ChevronDownIcon
					className={classNames(entryIconStyle, 'text-copy-on-light')}
				/>
				<Typography type="copy3" onDark className={entryTextStyle}>
					{title}
				</Typography>
			</Disclosure.Button>
			<Transition
			/* enter="transition-transform duration-200 ease-out origin-top"
				enterFrom="transform scale-y-0 opacity-0"
				enterTo="transform scale-100"
				leave="transition-transform duration-200 ease-out origin-top"
				leaveFrom="transform scale-y-100"
				leaveTo="transform scale-y-0 opacity-0" */
			>
				<Disclosure.Panel className="flex flex-row gap-0.5">
					<div className="w-0.5 mx-[11px] flex-shrink-0 bg-divider-on-dark" />
					<TableOfContents toc={subEntries} />
				</Disclosure.Panel>
			</Transition>
		</Disclosure>
	)
}

function TocSeparator() {
	return <div className="h-px my-3 bg-divider-on-dark" />
}

export function TableOfContents({
	toc: tocEntries,
	currentPath = '',
}: {
	toc: TocEntry[]
	currentPath?: string
}) {
	const [subtableSlug, setSubtableSlug] = useState(currentPath)

	const renderedTable = subtableSlug
		? tocEntries.find(
				(e) =>
					subtableSlug && e.docPage.slugPath.startsWith(subtableSlug),
		  )?.subEntries ?? tocEntries
		: tocEntries

	const subtables = renderedTable.filter(
		(t) => t.docPage.metadata.type === 'subtable',
	)
	const collapsibles = renderedTable.filter(
		(t) => t.docPage.isIndex && t.docPage.metadata.type !== 'subtable',
	)
	const singleEntries = renderedTable.filter((t) => !t.docPage.isIndex)

	return (
		<div className="flex flex-col">
			{subtableSlug && (
				<>
					<button
						className={entryPlateStyle}
						onClick={() => setSubtableSlug('')}
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
							Go back home
						</Typography>
					</button>
					<TocSeparator />
					<Typography type="copy3" emphasis onDark className="h-7">
						{subtableSlug}
					</Typography>
				</>
			)}
			{subtables.map(({ docPage, subEntries }) => {
				return (
					<TocSubtableItem
						key={docPage.slugPath}
						title={docPage.metadata.title}
						slugPath={docPage.slugPath}
						onEnter={setSubtableSlug}
					/>
				)
			})}
			{singleEntries.length > 0 && subtables.length > 0 && (
				<TocSeparator />
			)}
			{/* todo fabio: proper check for separators */}
			{singleEntries.map(({ docPage, subEntries }) => {
				return (
					<TocEntry
						key={docPage.slugPath}
						isIndex={docPage.isIndex}
						title={docPage.metadata.title}
						slugPath={docPage.slugPath}
						subEntries={subEntries}
					/>
				)
			})}
			{collapsibles.length > 0 && singleEntries.length > 0 && (
				<TocSeparator />
			)}
			{/* todo fabio: proper check for separators */}
			{collapsibles.map(({ docPage, subEntries }) => {
				return (
					<TocEntry
						key={docPage.slugPath}
						isIndex={docPage.isIndex}
						title={docPage.metadata.title}
						slugPath={docPage.slugPath}
						subEntries={subEntries}
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

/* const SdkTableOfContents = () => {
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
} */
