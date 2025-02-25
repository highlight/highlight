'use client'

import { Post } from './BlogPost/BlogPost'
import { PostTag, Tag, TagTab } from './Tag'
import Navbar from '../common/Navbar/Navbar'
import { Typography } from '../common/Typography/Typography'
import { FooterCallToAction } from '../common/CallToAction/FooterCallToAction'
import Footer from '../common/Footer/Footer'
import styles from './Blog.module.scss'
import classNames from 'classnames'
import { matchSorter } from 'match-sorter'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HiOutlineSearch } from 'react-icons/hi'
import { PostAuthor } from './Author'
import Head from 'next/head'

// https://usehooks-ts.com/react-hook/use-debounce
function useDebounce<T>(value: T, delay?: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

		return () => {
			clearTimeout(timer)
		}
	}, [value, delay])

	return debouncedValue
}

const BlogPage = ({
	posts,
	tags,
	currentTagSlug,
}: {
	posts: Post[]
	tags: Tag[]
	currentTagSlug: string
}) => {
	const [searchQuery, setSearchQuery] = useState<string>('')
	const debouncedSearchQuery = useDebounce(searchQuery, 300)
	const currentTag: Tag =
		tags.find((tag) => tag.slug === currentTagSlug) ?? tags[0]

	const displayedPosts = debouncedSearchQuery
		? matchSorter(posts, debouncedSearchQuery, {
				keys: [
					'title',
					{
						key: 'tags.name',
						maxRanking: matchSorter.rankings.CONTAINS,
					},
				],
			})
		: posts

	return (
		<>
			<Head>
				<link
					rel="alternate"
					type="application/rss+xml"
					title="Highlight.io Blog RSS Feed"
					href="/blog/rss.xml"
				/>
			</Head>
			<Navbar />
			<main>
				<div className="flex flex-row w-full gap-8 my-20 desktop:max-w-[1100px] mx-auto items-start px-6">
					<div className="flex flex-col flex-1 w-full gap-11">
						<div className="flex flex-col gap-2">
							<h2>{currentTag.name} Posts</h2>
							<Typography
								type="copy1"
								className={styles.copyOnDark}
							>
								{currentTag.description}
							</Typography>
						</div>
						<div className="flex flex-col gap-6">
							<div className="flex gap-8 overflow-x-scroll scrollbar-hidden">
								{tags.map((tag) => (
									<TagTab
										{...tag}
										key={tag.slug}
										current={currentTag.slug === tag.slug}
									/>
								))}
							</div>
							<div className="flex flex-col justify-between w-full gap-4 mobile:flex-row">
								<div className="flex items-center flex-grow gap-1 px-2 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light h-11">
									<HiOutlineSearch className="w-5 h-5 text-copy-on-light" />
									<input
										type="text"
										placeholder={
											currentTag.slug === 'all'
												? 'Search all posts...'
												: `Search all ${currentTag.name} posts...`
										}
										value={searchQuery}
										onChange={(ev) =>
											setSearchQuery(
												ev.currentTarget.value,
											)
										}
										className={
											'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] w-0'
										}
									/>
								</div>
							</div>
							{displayedPosts.map((post) => (
								<PostItem post={post} key={post.slug} />
							))}
							{displayedPosts.length < 1 && (
								<Typography
									type="copy2"
									className="my-10 text-center text-copy-on-light"
								>
									No Posts Found
								</Typography>
							)}
						</div>
					</div>
				</div>
				<FooterCallToAction />
			</main>
			<Footer />
		</>
	)
}

function getDateAndReadingTime(postedAt: string, readingMinutes: number) {
	const postedDate = new Date(postedAt).toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})

	return `${postedDate} • ${readingMinutes} min. read`
}

const postItemStyle = classNames(
	'relative w-full gap-3 transition-colors border border-solid rounded-lg bg-dark-background p-7 hover:bg-divider-on-dark border-divider-on-dark hover:border-copy-on-light',
)

const PostItem = ({
	post,
	feature: featured = false,
}: { post: Post } & { feature?: boolean }) => {
	const firstTag = post.tags[0]
	return (
		<>
			<div
				className={classNames(
					postItemStyle,
					featured && 'shadow-[8px_8px_0_0_#5420D1]',
					'hidden mobile:block',
				)}
			>
				<Link href={`/blog/${post.slug}`} className="absolute inset-0">
					<div />
				</Link>
				<Typography type="copy4" className="text-copy-on-dark">
					{getDateAndReadingTime(
						post.postedAt,
						post.readingTime ?? 0,
					)}
				</Typography>

				<h5 className="mt-1">{post.title}</h5>
				<div className="relative mt-3 pointer-events-none">
					{post.author && <PostAuthor {...post.author} />}
				</div>
				<div className="flex gap-2.5 absolute right-7 bottom-7">
					{post.tags?.map((tag) => (
						<PostTag {...tag} key={tag.slug} />
					))}
				</div>
			</div>
			<div
				className={classNames(
					postItemStyle,
					featured && 'shadow-[8px_8px_0_0_#5420D1]',
					'mobile:hidden block',
				)}
			>
				<Link href={`/blog/${post.slug}`} className="absolute inset-0">
					<div />
				</Link>
				{firstTag && (
					<div className="relative">
						<PostTag {...firstTag} />
					</div>
				)}
				<h3 className="mt-3">{post.title}</h3>
				<Typography type="copy4" className="mt-1 text-copy-on-dark">
					{getDateAndReadingTime(
						post.postedAt,
						post.readingTime ?? 0,
					)}
				</Typography>
				<div className="relative mt-6 pointer-events-none">
					{post.author && <PostAuthor {...post.author} hidePhoto />}
				</div>
			</div>
		</>
	)
}

export default BlogPage
