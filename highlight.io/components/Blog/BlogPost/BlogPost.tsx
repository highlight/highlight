import Image from 'next/legacy/image'
import Link from 'next/link'
import { Typography } from '../../common/Typography/Typography'
import styles from '../Blog.module.scss'
import { Tag } from '../Tag'

export interface Author {
	firstName: string
	lastName: string
	title: string
	twitterLink: string
	linkedInLink: string
	githubLink: string
	personalWebsiteLink: string
	profilePhoto: { url: string }
}

export interface Post {
	description: string
	youtubeVideoId?: string
	metaDescription?: string
	image: {
		url: string
	}
	title: string
	metaTitle?: string
	publishedAt: string
	postedAt: string
	publishedBy: {
		name: string
		picture: string
	}
	readingTime?: number
	author?: Author
	richcontent: {
		markdown: string
		raw?: any
	}
	slug?: string
	tags: Tag[]
}

export const BlogPost = ({
	slug,
	richcontent,
	image,
	title,
	publishedAt,
	tags,
	readingTime,
}: Post) => {
	return (
		<Link href={`/blog/${slug}`} style={{ textDecoration: 'none' }}>
			<div className={styles.blogPost}>
				<div className={styles.cardSection}>
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
				</div>
				<div className={styles.cardSection}>
					<div className={styles.postDateDiv}>
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
								richcontent.markdown.split(' ').length / 200,
							)
						} min. read`}</p>
					</div>
					<h3>{title}</h3>
					<div className={styles.tagDiv}>
						{tags.map((tag: Tag) => (
							<Link
								key={tag.name}
								href={`/blog?tag=${tag.slug}`}
								passHref={true}
								legacyBehavior
							>
								<div>
									<Typography type="copy3">
										{tag.name}
									</Typography>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</Link>
	)
}
