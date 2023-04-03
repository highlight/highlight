import { Post } from '../../components/Blog/BlogPost/BlogPost'
import { Typography } from '../../components/common/Typography/Typography'
import Navbar from '../../components/common/Navbar/Navbar'

import Image from 'next/image'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import { useEffect, useState } from 'react'
import classNames from 'classnames'
import { gql } from 'graphql-request'
import { GetStaticProps } from 'next'
import { HiOutlineSearch } from 'react-icons/hi'
import {
	getTagUrl,
	PostTag,
	SidebarTag,
	Tag,
	TagTab,
} from '../../components/Blog/Tag'
import { GraphCMSRequest } from '../../utils/graphql'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { matchSorter } from 'match-sorter'
import { PostAuthor } from '../../components/Blog/Author'
import styles from '../../components/Blog/Blog.module.scss'

export async function loadPostsFromHygraph(tag?: string) {
	const QUERY = gql`
      query GetPosts() {
        posts(
          orderBy: postedAt_DESC
          where: { unlisted: false }
          ) {
            slug
            title
            publishedAt
            postedAt
            readingTime
            featured
            image {
              url
            }
            author {
              firstName
              lastName
              title
              twitterLink
              linkedInLink
              githubLink
              personalWebsiteLink
              profilePhoto {
                url
              }
            }
            tags_relations {
              name
              slug
            }
          }
      }
  `

	const { posts } = await GraphCMSRequest<{ posts: Post[] }>(QUERY, {
		tag: tag ? [tag] : [],
	})

	return posts.filter((p) =>
		tag ? p.tags_relations.some((t) => t.slug === tag) : true,
	) as Post[]
}

export async function loadTagsFromHygraph() {
	const tagsQuery = gql`
    query GetTags() {
      tags {
        name
        description
        slug
      }
    }
  `

	return (await GraphCMSRequest<{ tags: Tag[] }>(tagsQuery)).tags
}

export const getStaticProps: GetStaticProps = async () => {
	const posts = await loadPostsFromHygraph()
	const tags = await loadTagsFromHygraph()
	return {
		props: {
			posts,
			tags,
			currentTagSlug: '',
		},

		revalidate: 60 * 60,
	}
}

const allTag: Omit<Tag, 'posts'> = {
	name: 'All posts',
	slug: 'all',
	description:
		'Welcome to the Highlight Blog, where the Highlight team talks about frontend engineering, observability and more!',
}

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

export const Blog = ({
	posts,
	tags,
	currentTagSlug,
}: {
	posts: Post[]
	tags: Omit<Tag, 'posts'>[]
	currentTagSlug: string
}) => {
	const pageQuery = useRouter().query.page ?? '1'

	let page = 1
	if (Array.isArray(pageQuery)) page = parseInt(pageQuery[0])
	else page = parseInt(pageQuery)

	const shownTags = [allTag, ...tags]
	const currentTag: Omit<Tag, 'posts'> =
		tags.find(({ slug }) => slug === currentTagSlug) ?? allTag

	const [searchQuery, setSearchQuery] = useState<string>('')
	const debouncedSearchQuery = useDebounce(searchQuery, 300)
	const itemsPerPage = 4

	const shouldFeature =
		!debouncedSearchQuery && currentTag.slug === allTag.slug && page <= 1

	const filteredPosts = debouncedSearchQuery
		? matchSorter(posts, debouncedSearchQuery, {
				keys: [
					'title',
					{
						key: 'tags_relations.name',
						maxRanking: matchSorter.rankings.CONTAINS,
					},
				],
		  })
		: posts

	page = Math.ceil(Math.min(page, filteredPosts.length / itemsPerPage))

	const displayedPosts = debouncedSearchQuery
		? filteredPosts
		: filteredPosts.slice(itemsPerPage * (page - 1), itemsPerPage * page)

	const isStartupStack = currentTag.slug.includes('stack')

	return (
		<>
			<Navbar />
			<main>
				<div className="flex flex-row w-full gap-8 my-20 desktop:max-w-[1100px] mx-auto items-start px-6">
					<div
						/* Main Side */ className="flex flex-col flex-1 w-full gap-11"
					>
						<div
							/* Category Description */ className="flex flex-col items-start gap-5"
						>
							<h3>
								{isStartupStack
									? 'Welcome to the Startup Stack!'
									: currentTag.name}
							</h3>
							{isStartupStack ? (
								<Typography
									className={styles.copyOnDark}
									type="copy1"
								>
									This is where we talk about the tools and
									tech you can use to build your next Startup!
									Read through our episodes below or find us{' '}
									<Link href="https://www.youtube.com/channel/UCATzQs36Mo7Cezt5Ij9ayZQ">
										on YouTube
									</Link>
									.
								</Typography>
							) : (
								<Typography
									type="copy1"
									className={styles.copyOnDark}
								>
									{currentTag.description ||
										allTag.description}
								</Typography>
							)}
						</div>
						<div
							/* Search and Posts */ className="flex flex-col gap-6"
						>
							<div
								/* Tags Tabs */ className="flex gap-8 overflow-x-scroll scrollbar-hidden"
							>
								{shownTags.map((tag) => (
									<TagTab
										{...tag}
										key={tag.slug}
										current={currentTag.slug === tag.slug}
									/>
								))}
							</div>
							<div
								/* Search and Pagination */ className="flex flex-col justify-between w-full gap-4 mobile:flex-row"
							>
								<div /* Search */
									className="flex items-center flex-grow gap-1 px-2 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light h-11"
								>
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
							{displayedPosts.map((post) => {
								return (
									<>
										{isStartupStack ? (
											<EpisodeItem
												post={post}
												key={post.slug}
											/>
										) : (
											<PostItem
												post={post}
												key={post.slug}
											/>
										)}
									</>
								)
							})}
							{displayedPosts.length < 1 && (
								<Typography
									type="copy2"
									className="my-10 text-center text-copy-on-light"
								>
									No Posts Found
								</Typography>
							)}
							{displayedPosts.length > 0 &&
								!debouncedSearchQuery && (
									<PageController
										page={page}
										count={
											filteredPosts.length / itemsPerPage
										}
										tag={currentTag.slug}
									/>
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

function PageController({
	page,
	count,
	tag,
}: {
	page: number
	count: number
	tag: string
}) {
	return (
		<div className="flex flex-row items-center self-center h-9">
			{page <= 1 ? (
				<Typography
					type="copy3"
					emphasis
					className="grid h-full w-[94px] border border-current rounded-l-md place-items-center text-copy-on-light select-none"
				>
					Previous
				</Typography>
			) : (
				<Link
					href={`${getTagUrl(tag)}?page=${page - 1 || 1}`}
					className="grid h-full w-[94px] border border-current rounded-l-md place-items-center"
				>
					Previous
				</Link>
			)}
			<Typography
				type="copy3"
				className="grid h-full px-3 border-y text-copy-on-light border-divider-on-dark place-items-center"
			>
				{page} / {Math.ceil(count)}
			</Typography>
			{page >= Math.ceil(count) ? (
				<Typography
					type="copy3"
					emphasis
					className="grid h-full w-[94px] border border-current rounded-r-md place-items-center text-copy-on-light select-none"
				>
					Next
				</Typography>
			) : (
				<Link
					href={`${getTagUrl(tag)}?page=${page + 1 || 1}`}
					className="grid h-full w-[94px] border border-current rounded-r-md place-items-center"
				>
					Next
				</Link>
			)}
		</div>
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

const EpisodeItem = ({ post }: { post: Post } & { feature?: boolean }) => {
	const firstTag = post.tags_relations[0]
	return (
		<>
			<div className="hidden mobile:block">
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						border: '1px solid #30294E',
						padding: 24,
						borderRadius: 8,
						gap: 24,
					}}
				>
					{post?.image?.url && (
						<Image
							style={{
								borderRadius: 8,
								border: '2px solid #30294E',
								height: 100 * 1.5,
								width: 190 * 1.5,
							}}
							src={post.image?.url}
							alt={'podcast image'}
							height={100}
							width={190}
						></Image>
					)}
					<div>
						<Typography type="copy4" className="text-copy-on-dark">
							{getDateAndReadingTime(
								post.postedAt,
								post.readingTime ?? 0,
							)}
						</Typography>

						<Link href={`/blog/${post.slug}`}>
							<h5 className="mt-1">{post.title}</h5>
						</Link>
						<div className="mt-3">
							{post.author ? (
								<PostAuthor
									hideTitle
									hidePhoto
									{...post.author}
								/>
							) : (
								'Missing Post Author!'
							)}
						</div>
					</div>
				</div>
			</div>
			<div className={classNames('mobile:hidden block')}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						border: '1px solid #30294E',
						padding: 24,
						borderRadius: 8,
						gap: 24,
					}}
				>
					<div>
						{firstTag && <PostTag {...firstTag} />}
						<Link href={`/blog/${post.slug}`}>
							<h3 className="mt-3">{post.title}</h3>
						</Link>
						<Typography
							type="copy4"
							className="mt-1 text-copy-on-dark"
						>
							{getDateAndReadingTime(
								post.postedAt,
								post.readingTime ?? 0,
							)}
						</Typography>
						<div className="mt-6">
							{post.author && (
								<PostAuthor {...post.author} hidePhoto />
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

const PostItem = ({
	post,
	feature: featured = false,
}: { post: Post } & { feature?: boolean }) => {
	const firstTag = post.tags_relations[0]
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
					{post.tags_relations?.map((tag) => (
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

export default Blog
