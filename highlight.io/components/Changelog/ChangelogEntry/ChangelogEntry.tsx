import Link from 'next/link'
import styles from '../../Blog/Blog.module.scss'

export interface Entry {
	slug: string
	title: string
	createdAt: string
	content: string
}

export const ChangelogEntry = ({ slug, content, title, createdAt }: Entry) => {
	return (
		<Link href={`/changelog/${slug}`} style={{ textDecoration: 'none' }}>
			<div className={styles.blogPost}>
				<div className={styles.cardSection}>
					<h2>{title}</h2>
					<div className={styles.authorDiv}>
						<div>
							<p>{`${new Date(createdAt).toLocaleDateString(
								'en-US',
							)}`}</p>
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
}
