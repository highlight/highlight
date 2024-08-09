import classNames from 'classnames'
import { promises as fsp } from 'fs'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import type {
	GetStaticPaths,
	GetStaticPathsResult,
	GetStaticProps,
} from 'next/types'
import { useEffect, useRef, useState } from 'react'
import { loadPostsFromGithub } from '.'

import { ElementNode } from '@graphcms/rich-text-types'
import { serialize } from 'next-mdx-remote/serialize'
import Image from 'next/legacy/image'
import YouTube from 'react-youtube'
import remarkGfm from 'remark-gfm'
import { PostAuthor } from '../../components/Blog/Author'
import styles from '../../components/Blog/Blog.module.scss'
import BlogNavbar from '../../components/Blog/BlogNavbar/BlogNavbar'
import { Post } from '../../components/Blog/BlogPost/BlogPost'
import { SuggestedBlogPost } from '../../components/Blog/SuggestedBlogPost/SuggestedBlogPost'
import { PostTag } from '../../components/Blog/Tag'
import { Comments } from '../../components/Comments/Comments'
import { BlogCallToAction } from '../../components/common/CallToAction/BlogCallToAction'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import { Meta } from '../../components/common/Head/Meta'
import { Section } from '../../components/common/Section/Section'
import { Typography } from '../../components/common/Typography/Typography'
import { Callout } from '../../components/Docs/Callout/Callout'
import { HighlightCodeBlock } from '../../components/Docs/HighlightCodeBlock/HighlightCodeBlock'
import homeStyles from '../../components/Home/Home.module.scss'
import { getBlogPaths } from '../../shared/blog'

const NUM_SUGGESTED_POSTS = 3

export async function getGithubPostBySlug(slug: string, githubPosts?: Post[]) {
	const posts = githubPosts || (await loadPostsFromGithub())

	const post = posts.find((p) => p.slug === slug)
	if (!post) {
		return null
	}
	return post
}

const components = {
	BlogCallToAction,
	p: (props: any) => {
		return <p className={styles.blogText} {...props}></p>
	},
	h1: (props: any) => <h4 className={styles.blogText}>{props.children}</h4>,
	h2: (props: any) => {
		return <h2 className={styles.blogText}>{props.children}</h2>
	},
	h3: (props: any) => <h6 className={styles.blogText}>{props.children}</h6>,
	h4: (props: any) => <h6 className={styles.blogText}>{props.children}</h6>,
	h5: (props: any) => <h6 className={styles.blogText}>{props.children}</h6>,
	ol: (props: any) => {
		// check if the type of props.children is an array.
		return (
			<>
				{Array.isArray(props.children) &&
					props?.children?.map((c: any, i: number) => {
						return (
							c.props &&
							c.props.children && (
								<ol
									start={props.start}
									style={{
										paddingTop: 8,
										paddingLeft: 16,
									}}
								>
									<li
										style={{
											listStyleType: 'counter',
											listStylePosition: 'outside',
										}}
										key={i}
									>
										{c.props.children.map
											? c?.props?.children?.map(
													(e: any) => e,
											  )
											: c?.props?.children}
									</li>
								</ol>
							)
						)
					})}
			</>
		)
	},
	ul: (props: any) => {
		// check if the type of props.children is an array.
		return (
			<>
				{Array.isArray(props.children) &&
					props?.children?.map((c: any, i: number) => {
						return (
							c.props &&
							c.props.children && (
								<ul
									style={{
										paddingLeft: 40,
									}}
								>
									<li
										style={{
											listStyleType: 'disc',
											listStylePosition: 'outside',
										}}
										key={i}
									>
										{c.props.children.map
											? c?.props?.children?.map(
													(e: any) => e,
											  )
											: c?.props?.children}
									</li>
								</ul>
							)
						)
					})}
			</>
		)
	},
	code: (props: any) => {
		if (props.className === 'language-hint') {
			return <Callout content={props.children} />
		}
		if (
			typeof props.children === 'string' &&
			(props.children.match(/\n/g) || []).length
		) {
			return (
				<HighlightCodeBlock
					language={
						props.className
							? props.className.split('language-').pop() ?? 'js'
							: 'js'
					}
					text={props.children}
					showLineNumbers={false}
				/>
			)
		}
		return (
			<code className={classNames(styles.codeInline, styles.postBody)}>
				{props.children}
			</code>
		)
	},
	table: (props: any) => {
		return (
			<div className={styles.blogTable}>
				<Typography type="copy2">
					<table {...props} />
				</Typography>
			</div>
		)
	},
} as const

export const getStaticPaths: GetStaticPaths = async () => {
	let paths: GetStaticPathsResult['paths'] = []

	let p = await getBlogPaths(fsp, '')
	p.forEach((path) => {
		paths.push({ params: { slug: path.simple_path } })
	})

	return {
		paths: paths,
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const slug = params?.slug as string

	const githubPosts = await loadPostsFromGithub()
	const otherPosts = githubPosts.filter((post: any) => post.slug !== slug)
	const suggestedPosts = []

	// suggest N random posts that are not the current post
	for (
		let i = 0;
		i < Math.min(NUM_SUGGESTED_POSTS, githubPosts.length - 1);
		i++
	) {
		let suggestedPost = otherPosts.splice(
			Math.floor(Math.random() * otherPosts.length),
			1,
		)[0]

		if (suggestedPost.image.url == null) {
			const params = new URLSearchParams()
			params.set('title', suggestedPost.title || '')
			params.set('fname', suggestedPost.author?.firstName || '')
			params.set('lname', suggestedPost.author?.lastName || '')
			params.set('role', suggestedPost.author?.title || '')

			suggestedPost.image.url = `/api/og/blog/${
				suggestedPost.slug
			}?${params.toString()}`
		}

		suggestedPosts.push(suggestedPost)
	}

	const githubPost = await getGithubPostBySlug(slug, githubPosts)
	if (!githubPost) {
		return {
			notFound: true,
		}
	}

	const mdxSource = await serialize(githubPost.richcontent.markdown, {
		mdxOptions: {
			remarkPlugins: [remarkGfm],
		},
	})

	return {
		props: {
			suggestedPosts,
			source: mdxSource,
			post: githubPost,
		},
		revalidate: 60 * 60, // Cache response for 1 hour (60 seconds * 60 minutes)
	}
}

interface PostSection {
	nodes: ElementNode[]
	footer: string | null
}

const PostPage = ({
	post,
	postSections,
	suggestedPosts,
	source,
}: {
	post: Post
	postSections: PostSection[]
	suggestedPosts: Post[]
	source: MDXRemoteSerializeResult
}) => {
	const blogBody = useRef<HTMLDivElement>(null)
	const [endPosition, setEndPosition] = useState(0)

	useEffect(() => {
		setEndPosition(blogBody.current?.offsetHeight || 0)
		// recalculate end position when blog sections are processed
		// because at that point the page height is finalized
	}, [postSections])

	const isStartupStack =
		post.tags_relations.filter((t) =>
			t.name.toLocaleLowerCase().includes('stack'),
		).length > 0

	const singleTag =
		post.tags_relations.length === 1 ? post.tags_relations[0] : undefined

	const params = new URLSearchParams()
	params.set('title', post.title || '')
	params.set('fname', post.author?.firstName || '')
	params.set('lname', post.author?.lastName || '')
	params.set('role', post.author?.title || '')

	const metaImageURL = `https://${
		process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
	}/api/og/blog/${post.slug}?${params.toString()}`

	return (
		<>
			<Meta
				title={post.metaTitle || post.title}
				description={post.metaDescription || post.description}
				absoluteImageUrl={metaImageURL}
				canonical={`/blog/${post.slug}`}
			/>
			<BlogNavbar
				title={post.title}
				endPosition={endPosition}
				singleTag={singleTag}
			/>
			<div className="hidden">
				{suggestedPosts.map((p, i) => (
					<SuggestedBlogPost {...p} key={i} />
				))}
			</div>
			<main
				ref={blogBody}
				className={classNames(styles.mainBlogPadding, 'relative')}
			>
				<Section>
					<div
						className={classNames(
							homeStyles.anchorTitle,
							styles.blogSection,
						)}
					>
						<Typography type="copy2">
							<p className={styles.dateDiv}>{`${new Date(
								post.publishedAt,
							).toLocaleDateString('en-US', {
								day: 'numeric',
								year: 'numeric',
								month: 'short',
							})} • ${
								post.readingTime ||
								Math.floor(
									post.richcontent.markdown.split(' ')
										.length / 200,
								)
							} min read`}</p>
						</Typography>
						<h1 className={styles.blogText}>{post.title}</h1>
						<div
							className={classNames(
								styles.tagDiv,
								styles.postTagDiv,
							)}
						>
							{post.tags_relations.map((tag) => (
								<PostTag {...tag} key={tag.slug} />
							))}
						</div>
						<div className={styles.authorDiv}>
							{post.author && <PostAuthor {...post.author} />}
						</div>
					</div>
				</Section>
				{post.image?.url && (
					<Section className={styles.headerSection}>
						{isStartupStack ? (
							<div
								className={classNames(
									styles.youtubeEmbed,
									homeStyles.anchorTitle,
									styles.blogSection,
								)}
							>
								<YouTube
									videoId={
										post.youtubeVideoId || 'dQw4w9WgXcQ'
									}
									style={{
										display: 'flex',
										justifyContent: 'center',
									}}
								></YouTube>
							</div>
						) : (
							<div
								className={classNames(
									styles.mainImage,
									homeStyles.anchorTitle,
									styles.blogSection,
								)}
							>
								<Image
									src={post.image.url || ''}
									alt=""
									layout="fill"
									objectFit="cover"
									priority
								/>
							</div>
						)}
					</Section>
				)}
				<Section className={styles.headerSection}>
					<div
						className={classNames(
							homeStyles.anchorTitle,
							styles.postBody,
							styles.postBodyTop,
							styles.blogSection,
							'text-start',
						)}
					>
						{source && (
							<div className={classNames(styles.blogText)}>
								<MDXRemote
									{...source}
									components={components}
								/>
							</div>
						)}
					</div>
				</Section>
				<Section>
					<div className={styles.postBodyDivider}></div>
				</Section>
				{post.slug && (
					<Section>
						<Comments slug={post.slug} />
					</Section>
				)}
				<Section>
					<div
						className={classNames(
							homeStyles.anchorTitle,
							styles.postBody,
						)}
					>
						<h3 className={styles.otherArticlesHeader}>
							Other articles you may like
						</h3>
						{suggestedPosts.map((p, i) => (
							<SuggestedBlogPost {...p} key={i} />
						))}
						{}
					</div>
				</Section>
			</main>
			<FooterCallToAction />
			<Footer />
		</>
	)
}

export default PostPage
