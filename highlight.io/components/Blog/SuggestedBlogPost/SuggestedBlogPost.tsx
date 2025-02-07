import classNames from 'classnames'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { Typography } from '../../common/Typography/Typography'
import styles from '../Blog.module.scss'
import { Post } from '../BlogPost/BlogPost'
import { PostTag } from '../Tag'

export const SuggestedBlogPost = ({
	slug,
	richcontent,
	image,
	title,
	publishedAt,
	tags,
	readingTime,
}: Post) => {
	return (
		<Link
			href={`/blog/${slug}`}
			style={{ textDecoration: 'none' }}
			legacyBehavior
		>
			<div
				className={classNames(
					styles.blogPost,
					styles.suggestedBlogPost,
				)}
			>
				<div className={styles.cardSection}>
					<div className={styles.cardImage}>
						<Image
							src={image?.url || ''}
							alt=""
							layout="fill"
							objectFit="cover"
						/>
					</div>
				</div>
				<div className={styles.cardSection}>
					<div className={styles.postDateDiv}>
						<Typography type="copy2">
							<p>{`${new Date(publishedAt).toLocaleDateString(
								'en-US',
								{
									day: 'numeric',
									year: 'numeric',
									month: 'short',
								},
							)} • ${
								readingTime ||
								Math.floor(
									richcontent.markdown.split(' ').length /
										200,
								)
							} min. read`}</p>
						</Typography>
					</div>
					<div className={styles.suggestedPostTitle}>
						<Typography type="copy1" emphasis>
							{title}
						</Typography>
					</div>
					<div className={styles.tagDiv}>
						{tags.map((tag) => (
							<PostTag {...tag} key={tag.slug + slug} />
						))}
					</div>
				</div>
			</div>
		</Link>
	)
}
