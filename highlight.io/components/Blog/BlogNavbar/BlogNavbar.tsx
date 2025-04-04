import classNames from 'classnames'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai'
import ReturnIcon from '../../../public/images/ReturnIcon'
import Banner from '../../common/Banner/Banner'
import { PrimaryButton } from '../../common/Buttons/PrimaryButton'
import {
	HighlightLogo,
	HighlightLogoWhite,
} from '../../common/HighlightLogo/HighlightLogo'
import styles from '../../common/Navbar/Navbar.module.scss'
import { Typography } from '../../common/Typography/Typography'
import { getTagUrl, Tag } from '../Tag'

const SHOW_NAVBAR_OFFSET = 300

const BlogNavbar = ({
	title,
	endPosition,
	attachUnder,
	singleTag,
}: {
	singleTag?: Tag
	title: string
	endPosition: number
	attachUnder?: React.ReactElement<any>
}) => {
	const [scrolled, setScrolled] = useState(false)
	const [isOpen, setIsOpen] = useState(false)
	const [prevY, setPrevY] = useState(0)

	const changeBackground = () => {
		const currentScrollPos = window.pageYOffset
		if (window.scrollY > SHOW_NAVBAR_OFFSET) {
			setScrolled(true)
		} else if (window.scrollY <= SHOW_NAVBAR_OFFSET) {
			setScrolled(false)
		}
		setPrevY(currentScrollPos * 1.3)
	}

	useEffect(() => {
		changeBackground()
		window.addEventListener('scroll', changeBackground)
	})

	return (
		<>
			<Banner>
				<div className={styles.navContainer}>
					<ul className={classNames(styles.menuList, styles.header)}>
						<li>
							<Link href={'/pricing'} className={styles.menuItem}>
								Pricing
							</Link>
						</li>
						<li>
							<Link
								href={'/customers'}
								className={styles.menuItem}
							>
								Customers
							</Link>
						</li>
						<li>
							<Link href={'/blog'} className={styles.menuItem}>
								Blog
							</Link>
						</li>
						<li>
							<Link
								href={'https://careers.highlight.run'}
								className={styles.menuItem}
							>
								Careers
							</Link>
						</li>
						<li>
							<Link href={'/docs'} className={styles.menuItem}>
								Docs
							</Link>
						</li>
					</ul>
				</div>
			</Banner>
			<header
				className={classNames(styles.headerPadding, {
					[styles.hideNavbar]: !scrolled,
					[styles.mobileHeader]: isOpen,
				})}
			>
				<div
					className={classNames(styles.header, styles.headerInner, {
						[styles.openHeader]: isOpen,
						[styles.headerBorder]: prevY != 0,
					})}
				>
					<Link href={'/'} className={styles.urlStyle}>
						{isOpen ? <HighlightLogoWhite /> : <HighlightLogo />}
					</Link>
					<div
						className={classNames(
							styles.navContainer,
							styles.headerLeftBlog,
						)}
					>
						<div className={styles.navPostTitle}>{title}</div>
					</div>
					<div
						className={styles.navMenu}
						onClick={() => setIsOpen(!isOpen)}
					>
						{isOpen ? (
							<AiOutlineClose className={styles.copyOnDark} />
						) : (
							<AiOutlineMenu />
						)}
					</div>
					{isOpen && (
						<div className={styles.mobileMenu}>
							<ul
								className={classNames(
									styles.menuList,
									styles.header,
								)}
							>
								<li>
									<Typography type="copy3" emphasis={true}>
										<Link
											href={'/pricing'}
											className={styles.menuItemLarge}
										>
											Pricing
										</Link>
									</Typography>
								</li>
								<li>
									<Typography type="copy3" emphasis={true}>
										<Link
											href={'/customers'}
											className={styles.menuItemLarge}
										>
											Customers
										</Link>
									</Typography>
								</li>
								<li>
									<Typography type="copy3" emphasis={true}>
										<Link
											href={'/blog'}
											className={styles.menuItemLarge}
										>
											Blog
										</Link>
									</Typography>
								</li>
								<li>
									<Typography type="copy3" emphasis={true}>
										<Link
											href={
												'https://careers.highlight.run'
											}
											className={styles.menuItemLarge}
										>
											Careers
										</Link>
									</Typography>
								</li>
								<li>
									<Typography type="copy3" emphasis={true}>
										<Link
											href="/docs"
											className={styles.menuItemLarge}
										>
											Docs
										</Link>
									</Typography>
								</li>
							</ul>
							<div className={styles.menuButtons}>
								<PrimaryButton href="https://app.highlight.io/sign_up">
									Get Started
								</PrimaryButton>
								<Typography type="copy3" emphasis={true}>
									<a
										href="https://app.highlight.io/"
										className={styles.menuItem}
									>
										Sign In
									</a>
								</Typography>
							</div>
						</div>
					)}
					<div
						className={classNames(
							styles.navContainer,
							styles.header,
							styles.headerRightBlog,
						)}
					>
						<PrimaryButton
							href="https://app.highlight.io/sign_up"
							className={styles.signUpButton}
						>
							<Typography type="copy2" emphasis={true}>
								Sign up
							</Typography>
						</PrimaryButton>
					</div>
				</div>
				<div
					className={styles.loadingBar}
					style={{
						width: `${
							(1 -
								Math.max(0, endPosition - prevY) /
									endPosition) *
							100
						}%`,
					}}
				></div>
				<div className="absolute top-full">
					<Link
						href={getTagUrl(singleTag?.slug ?? 'all')}
						className="flex-row hidden gap-2 mt-6 ml-8 desktop:flex place-items-center"
					>
						<ReturnIcon /> Back
					</Link>
				</div>
			</header>
		</>
	)
}

export default BlogNavbar
