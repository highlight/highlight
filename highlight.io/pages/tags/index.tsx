import { GetStaticProps } from 'next'
import { Post } from '../../components/Blog/BlogPost/BlogPost'
import { Tag } from '../../components/Blog/Tag'
import { Typography } from '../../components/common/Typography/Typography'
import { loadPostsFromGithub, loadTagsFromGithub } from '../blog'
import Link from 'next/link'
import { Meta } from '../../components/common/Head/Meta'
import { PostTag } from '../../components/Blog/Tag'
import { PostAuthor } from '../../components/Blog/Author'
import styles from '../../components/Blog/Blog.module.scss'
import Image from 'next/legacy/image'

export const getStaticProps: GetStaticProps = async () => {
	const posts = await loadPostsFromGithub()
	const tags = await loadTagsFromGithub(posts)

	// Group posts by tag
	const postsByTag = tags.reduce(
		(acc, tag) => {
			acc[tag.slug] = posts.filter((post) =>
				post.tags_relations.some((t) => t.slug === tag.slug),
			)
			return acc
		},
		{} as Record<string, Post[]>,
	)

	return {
		props: {
			tags,
			postsByTag,
		},
		revalidate: 60,
	}
}

const TagsPage = ({
	tags,
	postsByTag,
}: {
	tags: Tag[]
	postsByTag: Record<string, Post[]>
}) => {
	return (
		<div className="min-h-screen bg-dark-background text-white p-8">
			<Meta
				title="All Tags - Highlight Blog"
				description="Browse all blog posts by tag"
				canonical="/tags"
			/>

			<div className="max-w-7xl mx-auto">
				<h1 className="text-4xl font-bold mb-12">Browse by Tag</h1>

				{tags.map((tag) => (
					<div key={tag.slug} className="mb-16">
						<div className="flex items-center gap-4 mb-6">
							<h2 className="text-2xl font-semibold">
								{tag.name}
							</h2>
							<PostTag name={tag.name} slug={tag.slug} />
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{postsByTag[tag.slug].map((post) => (
								<Link
									key={post.slug}
									href={`/blog/${post.slug}`}
									className="block bg-dark-background border border-divider-on-dark rounded-lg p-6 hover:border-copy-on-light transition-colors"
								>
									{post.image?.url && (
										<div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
											<Image
												src={post.image.url}
												alt={post.title}
												layout="fill"
												objectFit="cover"
											/>
										</div>
									)}

									<div className={styles.postDateDiv}>
										<p>{`${new Date(
											post.publishedAt,
										).toLocaleDateString('en-US', {
											day: 'numeric',
											year: 'numeric',
											month: 'short',
										})} • ${post.readingTime || Math.floor(post.richcontent.markdown.split(' ').length / 200)} min read`}</p>
									</div>

									<h3 className="text-xl font-semibold mb-3">
										{post.title}
									</h3>

									{post.description && (
										<Typography
											type="copy2"
											className="text-copy-on-dark mb-4"
										>
											{post.description}
										</Typography>
									)}

									<div className="flex flex-wrap gap-2 mb-4">
										{post.tags_relations.map((tag) => (
											<PostTag key={tag.slug} {...tag} />
										))}
									</div>

									{post.author && (
										<div className="mt-4">
											<PostAuthor
												{...post.author}
												hidePhoto
											/>
										</div>
									)}
								</Link>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default TagsPage
