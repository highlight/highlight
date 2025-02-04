import { GetStaticProps } from 'next'
import { getUniqueTags, Post } from '../../../components/Blog/BlogPost/BlogPost'
import { Tag } from '../../../components/Blog/Tag'
import { loadPostsFromGithub, loadTagsFromGithub } from '../index'
import { Meta } from '../../../components/common/Head/Meta'
import { PostTag } from '../../../components/Blog/Tag'
import { PostAuthor } from '../../../components/Blog/Author'
import blogStyles from '../../../components/Blog/Blog.module.scss'
import styles from './[tag].module.scss'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { Typography } from '../../../components/common/Typography/Typography'
import Navbar from '../../../components/common/Navbar/Navbar'
import { FooterCallToAction } from '../../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../../components/common/Footer/Footer'
import { getAllTags, getTagFromSlug } from '../../../shared/tags'

export async function getStaticPaths() {
	const tags = getAllTags().filter((tag) => tag.slug !== 'all')

	return {
		paths: tags.map((tag) => `/blog/tag/${tag.slug}`),
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const posts = await loadPostsFromGithub()
	const currentTag = getTagFromSlug(params!.tag as string)

	if (!currentTag) {
		return {
			notFound: true,
		}
	}

	const filteredPosts = posts.filter((post) => {
		return post.tags_relations.some(
			(tag: Tag) => tag.slug === currentTag.slug,
		)
	})

	filteredPosts.sort(
		(a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt),
	)

	return {
		props: {
			posts: filteredPosts,
			currentTag,
		},
		revalidate: 60,
	}
}

const TagPage = ({ posts, currentTag }: { posts: Post[]; currentTag: Tag }) => {
	return (
		<>
			<Navbar />
			<Meta
				title={`${currentTag.name} - Highlight Blog`}
				description={
					currentTag.description ||
					`Articles tagged with ${currentTag.name}`
				}
				canonical={`/blog/tag/${currentTag.slug}`}
			/>
			<main>
				<div className="flex flex-col w-full gap-8 my-20 desktop:max-w-[1100px] mx-auto items-start px-6">
					<div className="flex flex-col items-start gap-5">
						<h3>{currentTag.name}</h3>

						<Typography type="copy1">
							{currentTag.description}
						</Typography>
					</div>

					<div className={styles.grid}>
						{posts.map((post) => (
							<Link key={post.slug} href={`/blog/${post.slug}`}>
								<div className={styles.card}>
									{post.image?.url && (
										<div className={styles.imageContainer}>
											<Image
												src={post.image.url}
												alt={post.title}
												layout="fill"
												objectFit="cover"
												priority
											/>
										</div>
									)}

									<div className={blogStyles.postDateDiv}>
										<Typography type="copy2">
											{`${new Date(
												post.publishedAt,
											).toLocaleDateString('en-US', {
												day: 'numeric',
												year: 'numeric',
												month: 'short',
											})} • ${post.readingTime || Math.floor(post.richcontent.markdown.split(' ').length / 200)} min read`}
										</Typography>
									</div>

									<h3 className={styles.title}>
										{post.title}
									</h3>

									<div className={styles.tags}>
										{post.tags_relations.map((tag: Tag) => (
											<PostTag key={tag.slug} {...tag} />
										))}
									</div>

									{post.author && (
										<div className={styles.authorSection}>
											<PostAuthor {...post.author} />
										</div>
									)}
								</div>
							</Link>
						))}
					</div>
				</div>
			</main>
			<FooterCallToAction />
			<Footer />
		</>
	)
}

export default TagPage
