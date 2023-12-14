import classNames from 'classnames'

import styles from '../../Home/Home.module.scss'
import productStyles from '../../Products/Products.module.scss'

import Image from 'next/legacy/image'
import FooterRightImage from '../../../public/images/hero-bug-right.gif.webp'
import FooterLeftImage from '../../../public/images/safety-security-section.gif.webp'
import { PrimaryButton } from '../Buttons/PrimaryButton'
import { Typography } from '../Typography/Typography'

export const FooterCallToAction = ({
	buttonText,
	buttonLink,
}: {
	buttonText?: string
	buttonLink?: string
}) => {
	return (
		<div className={styles.callToActionBackground}>
			<div
				className={classNames(styles.anchorTitle, styles.ctaContainer)}
			>
				<div className={styles.footerImageRight}>
					<Image src={FooterRightImage} alt="" />
				</div>
				<div className={productStyles.subtleBadge}>
					<Typography type="copy4" emphasis>
						Try Highlight Today
					</Typography>
				</div>
				<h2 className={styles.ctaTitle}>
					Get the{' '}
					<span className={styles.highlightedText}>visibility</span>{' '}
					you need
				</h2>
				<div
					className={classNames(
						styles.buttonContainer,
						styles.tryButtonContainer,
					)}
				>
					<PrimaryButton
						href={
							buttonLink
								? buttonLink
								: 'https://app.highlight.io/sign_up'
						}
					>
						<Typography type="copy2" emphasis={true}>
							{buttonText ? buttonText : 'Get started for free'}
						</Typography>
					</PrimaryButton>
				</div>
				<div className={styles.footerImageLeft}>
					<Image src={FooterLeftImage} alt="" />
				</div>
			</div>
		</div>
	)
}
