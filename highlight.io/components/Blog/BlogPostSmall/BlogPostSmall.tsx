import Image from 'next/legacy/image'
import Link from 'next/link'
import { Typography } from '../../common/Typography/Typography'
import styles from '../Blog.module.scss'
import { Post } from '../BlogPost/BlogPost'
import { Tag } from '../Tag'

export const BlogPostSmall = ({
	slug,
	image,
	title,
	publishedAt,
	tags,
	readingTime,
}: Post) => {
	return (
		<div className={styles.blogPostSmall}>
			<Link href={`/blog/${slug}`} style={{ textDecoration: 'none' }}>
				<div className={styles.cardImage}>
					{image?.url && (
						<Image
							src={image?.url || ''}
							alt=""
							layout="fill"
							objectFit="cover"
						/>
					)}
				</div>
				{readingTime ? (
					<div className={styles.postDateDiv}>
						<p>{`${new Date(publishedAt).toLocaleDateString(
							'en-US',
							{
								day: 'numeric',
								year: 'numeric',
								month: 'short',
							},
						)} • ${readingTime} min. read`}</p>
					</div>
				) : null}
				<Typography type="copy1" emphasis>
					{title}
				</Typography>
				<div className={styles.tagDiv}>
					{tags.map((tag: Tag) => (
						<Link
							key={tag.name}
							href={`/blog?tag=${tag.slug}`}
							passHref={true}
							legacyBehavior
						>
							<div>
								<Typography type="copy3">{tag.name}</Typography>
							</div>
						</Link>
					))}
				</div>
			</Link>
		</div>
	)
}
