import Link from 'next/link'
import { FaGithub, FaLinkedinIn, FaTwitter } from 'react-icons/fa'
import { COMPETITORS } from '../../Competitors/competitors'
import { PRODUCTS } from '../../Products/products'
import { HighlightLogo } from '../HighlightLogo/HighlightLogo'
import { Typography } from '../Typography/Typography'
import styles from './Footer.module.scss'

const Footer = () => {
	return (
		<footer>
			<div className={styles.footer}>
				<div className={styles.footerBottom}>
					<div>
						<HighlightLogo />
					</div>
					<div className={styles.socialDiv}>
						<a href="https://twitter.com/highlightio">
							<FaTwitter className={styles.socialIcon} />
						</a>
						<a href="https://www.linkedin.com/company/highlightrun">
							<FaLinkedinIn className={styles.socialIcon} />
						</a>
						<a href="https://github.com/highlight/highlight">
							<FaGithub className={styles.socialIcon} />
						</a>
					</div>
				</div>
				<div>
					<div className={styles.footerTitle}>
						<Typography type="copy2" emphasis={true}>
							Product
						</Typography>
					</div>
					<Typography type="copy3">
						<ul className={styles.footerList}>
							<li>
								<Link href="/pricing">Pricing</Link>
							</li>
							<li>
								<a href="https://app.highlight.io/sign_up">
									Sign up
								</a>
							</li>
							<li>
								<Link href="/#features">Features</Link>
							</li>
							<li>
								<Link href="/privacy">
									Privacy &amp; Security
								</Link>
							</li>
							<li>
								<Link href="/customers">Customers</Link>
							</li>
							<li>
								<Link href="/session-replay">
									Session Replay
								</Link>
							</li>
							<li>
								<Link href="/error-monitoring">
									Error Monitoring
								</Link>
							</li>
							<li>
								<Link href="/logging">Logging</Link>
							</li>
						</ul>
					</Typography>
				</div>
				<div>
					<div className={styles.footerTitle}>
						<Typography type="copy2" emphasis={true}>
							Competitors
						</Typography>
					</div>
					<Typography type="copy3">
						<ul className={styles.footerList}>
							{Object.keys(COMPETITORS).map((key) => {
								const val = COMPETITORS[key]
								return (
									<li key={key}>
										<Link href={`/compare/${key}`}>
											{val.name}
										</Link>
									</li>
								)
							})}
						</ul>
					</Typography>
				</div>
				<div>
					<div className={styles.footerTitle}>
						<Typography type="copy2" emphasis={true}>
							Developers
						</Typography>
					</div>
					<Typography type="copy3">
						<ul className={styles.footerList}>
							<li>
								<a href="https://www.highlight.io/docs/general/changelog/overview">
									Changelog
								</a>
							</li>
							<li>
								<Link href="/docs">Documentation</Link>
							</li>
						</ul>
					</Typography>
				</div>
				<div>
					<div className={styles.footerTitle}>
						<Typography type="copy2" emphasis={true}>
							Frameworks
						</Typography>
					</div>
					<Typography type="copy3">
						<ul className={styles.footerList}>
							{Object.entries(PRODUCTS).map(([key, value]) => {
								return (
									<li key={value.slug}>
										<Link href={`/for/${value.slug}`}>
											{value.title}
										</Link>
									</li>
								)
							})}
						</ul>
					</Typography>
				</div>
				<div>
					<div className={styles.footerTitle}>
						<Typography type="copy2" emphasis={true}>
							Contact & Legal
						</Typography>
					</div>
					<Typography type="copy3">
						<ul className={styles.footerList}>
							<li>
								<Link href="/terms">Terms of Service</Link>
							</li>
							<li>
								<Link href="/privacy">Privacy Policy</Link>
							</li>
							<li>
								<a href="https://careers.highlight.io/">
									Careers
								</a>
							</li>
							<li>
								<a href="mailto:sales@highlight.io">
									sales@highlight.io
								</a>
							</li>
							<li>
								<a href="mailto:security@highlight.io">
									security@highlight.io
								</a>
							</li>
						</ul>
					</Typography>
				</div>
			</div>
			<div className={styles.footerBottomMobile}>
				<div>
					<HighlightLogo />
				</div>
				<div className={styles.socialDiv}>
					<a href="https://twitter.com/highlightio">
						<FaTwitter className={styles.socialIcon} />
					</a>
					<a href="https://www.linkedin.com/company/highlightrun">
						<FaLinkedinIn className={styles.socialIcon} />
					</a>
					<a href="https://github.com/highlight/highlight">
						<FaGithub className={styles.socialIcon} />
					</a>
				</div>
			</div>
		</footer>
	)
}

export default Footer
