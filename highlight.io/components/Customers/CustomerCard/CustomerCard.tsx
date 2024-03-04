import Image, { StaticImageData } from 'next/legacy/image'
import styles from '../Customers.module.scss'

export interface CustomerReview {
	author: string
	avatar: StaticImageData
	logo: StaticImageData
	body: string
}

export const CustomerCard = (review: CustomerReview) => {
	return (
		<div className={styles.customerCard}>
			<div className={styles.companyDiv}>
				<div className={styles.companyLogo}>
					<Image
						src={review.logo}
						alt=""
						layout={'fill'}
						objectFit={'contain'}
					/>
				</div>
			</div>
			<div className={styles.authorDiv}>
				<div
					className={styles.avatar}
					style={{ width: '24px', height: '24px' }}
				>
					<Image src={review.avatar} alt="" />
				</div>
				<p>{review.author}</p>
			</div>
			<p>{review.body}</p>
		</div>
	)
}
