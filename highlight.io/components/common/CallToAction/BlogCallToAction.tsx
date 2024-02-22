import classNames from 'classnames'

import styles from '../../Home/Home.module.scss'
import productStyles from '../../Products/Products.module.scss'
import { PrimaryButton } from '../Buttons/PrimaryButton'
import { Typography } from '../Typography/Typography'

export const BlogCallToAction = () => {
	return (
		<div
			className={classNames(
				styles.callToActionBackground,
				styles.simpleCallToActionBackground,
			)}
		>
			<div
				className={classNames(styles.anchorTitle, styles.ctaContainer)}
			>
				<div className={productStyles.subtleBadge}>
					<Typography type="copy4" emphasis>
						Try Highlight Today
					</Typography>
				</div>
				<h3 className={styles.ctaTitle}>
					Get the{' '}
					<span className={styles.highlightedText}>visibility</span>{' '}
					you need
				</h3>
				<div
					className={classNames(
						styles.buttonContainer,
						styles.tryButtonContainer,
					)}
				>
					<PrimaryButton
						href="https://app.highlight.io/sign_up?ref=blog"
						style={{ color: 'black' }}
					>
						<Typography type="copy2" emphasis={true}>
							Get started for free
						</Typography>
					</PrimaryButton>
				</div>
			</div>
		</div>
	)
}
