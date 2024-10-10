import classNames from 'classnames'
import Link from 'next/link'
import { FaGithub, FaLinkedinIn, FaPodcast } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { COMPETITORS } from '../../Competitors/competitors'
import { PRODUCTS } from '../../Products/products'
import {
	HighlightLogo,
	HighlightLogoLight,
} from '../HighlightLogo/HighlightLogo'
import { Typography } from '../Typography/Typography'
import styles from './Footer.module.scss'

export const Footer = ({ light }: { light?: boolean }) => {
	return (
		<footer className={light ? 'bg-[#f9f9f9]' : 'bg-dark-background'}>
			<div className={styles.footer}>
				<div className={styles.footerBottom}>
					<div>
						{light ? <HighlightLogoLight /> : <HighlightLogo />}
					</div>
					<div
						className={classNames(
							styles.socialDiv,
							`{light ? "text-[#6F6E77]" : "text-white"}`,
						)}
					>
						<a
							className={
								light
									? 'text-[#6F6E77] hover:text-black'
									: 'text-white hover:text-color-primary-300'
							}
							href="https://twitter.com/highlightio"
						>
							<FaXTwitter className="w-[24px] h-[24px]" />
						</a>
						<a
							className={
								light
									? 'text-[#6F6E77] hover:text-black'
									: 'text-white hover:text-color-primary-300'
							}
							href="https://www.linkedin.com/company/highlightrun"
						>
							<FaLinkedinIn className="w-[24px] h-[24px]" />
						</a>
						<a
							className={
								light
									? 'text-[#6F6E77] hover:text-black'
									: 'text-white hover:text-color-primary-300'
							}
							href="https://github.com/highlight/highlight"
						>
							<FaGithub className="w-[24px] h-[24px]" />
						</a>
						<a
							className={
								light
									? 'text-[#6F6E77] hover:text-black'
									: 'text-white hover:text-color-primary-300'
							}
							href="https://podcasters.spotify.com/pod/show/highlightio"
							target="_blank"
						>
							<FaPodcast className="w-[24px] h-[24px]" />
						</a>
					</div>
				</div>
				<div>
					<div className={styles.footerTitle}>
						<Typography
							type="copy2"
							emphasis={true}
							className={light ? 'text-[#6F6E77]' : ''}
						>
							Product
						</Typography>
					</div>
					<Typography type="copy3">
						<ul
							className={classNames({
								[styles.footerList]: !light,
								[styles.footerListLight]: light,
							})}
						>
							<li className="text-black">
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
						<Typography
							type="copy2"
							emphasis={true}
							className={light ? 'text-[#6F6E77]' : ''}
						>
							Competitors
						</Typography>
					</div>
					<Typography type="copy3">
						<ul
							className={classNames({
								[styles.footerList]: !light,
								[styles.footerListLight]: light,
							})}
						>
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
						<Typography
							type="copy2"
							emphasis={true}
							className={light ? 'text-[#6F6E77]' : ''}
						>
							Developers
						</Typography>
					</div>
					<Typography type="copy3">
						<ul
							className={classNames({
								[styles.footerList]: !light,
								[styles.footerListLight]: light,
							})}
						>
							<li>
								<a href="https://www.highlight.io/docs/general/changelog/overview">
									Changelog
								</a>
							</li>
							<li>
								<Link href="/docs">Documentation</Link>
							</li>
							<li>
								<Link href="/ambassador-program">
									Ambassadors
								</Link>
							</li>
						</ul>
					</Typography>
				</div>
				<div>
					<div className={styles.footerTitle}>
						<Typography
							type="copy2"
							emphasis={true}
							className={light ? 'text-[#6F6E77]' : ''}
						>
							Frameworks
						</Typography>
					</div>
					<Typography type="copy3">
						<ul
							className={classNames({
								[styles.footerList]: !light,
								[styles.footerListLight]: light,
							})}
						>
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
						<Typography
							type="copy2"
							emphasis={true}
							className={light ? 'text-[#6F6E77]' : ''}
						>
							Contact & Legal
						</Typography>
					</div>
					<Typography type="copy3">
						<ul
							className={classNames({
								[styles.footerList]: !light,
								[styles.footerListLight]: light,
							})}
						>
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
						<FaXTwitter className={styles.socialIcon} />
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
