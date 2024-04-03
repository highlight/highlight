import { DocSearch } from '@docsearch/react'
import classNames from 'classnames'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AiFillGithub, AiOutlineClose, AiOutlineMenu } from 'react-icons/ai'
import { FaDiscord } from 'react-icons/fa'
import { GithubPopup } from '../../GithubPopup/GithubPopup'
import { PrimaryButton } from '../Buttons/PrimaryButton'
import {
	HighlightLogo,
	HighlightLogoLight,
	HighlightLogoWhite,
} from '../HighlightLogo/HighlightLogo'
import { Typography } from '../Typography/Typography'
import styles from './Navbar.module.scss'
import ResourceDropdown from './ResourceDropdown'

import '@docsearch/css'
import moment from 'moment'
import Banner from '../Banner/Banner'
import FeatureDropdown from './FeatureDropdown'

const LaunchWeekBanner = () => {
	const day = moment().diff(moment('2023-07-17T16:00:00Z'), 'days') + 1
	if (day < 1 || day > 5) {
		return null
	}

	const bannerMessage = (
		<div className={styles.launchWeekText}>
			Launch Week 2 is here.{' '}
			<a
				target="_blank"
				href="https://www.highlight.io/launch-week-2"
				rel="noreferrer"
			>
				Follow along
			</a>{' '}
			to see what we&apos;ve been building!
		</div>
	)

	return <Banner>{bannerMessage}</Banner>
}

const LivestreamBanner = () => {
	return (
		<Link
			href="https://lu.ma/b0uz0fiz"
			target="_blank"
			rel="noreferrer"
			className="hidden md:flex justify-center items-center w-full h-[40px] bg-color-primary-200 text-white hover:bg-opacity-90"
		>
			<Typography type="copy3">
				Join our livestream: April 11 at 2pm PDT on Distributed Tracing
				in NextJS. Register
				<span className="font-semibold"> here</span>.
			</Typography>
		</Link>
	)
}

const Navbar = ({
	hideFreeTrialText,
	isDocsPage,
	hideBanner,
	fixed,
	title,
	bg,
	light,
	hideGitHubPopup,
}: {
	hideFreeTrialText?: boolean
	isDocsPage?: boolean
	hideBanner?: boolean
	fixed?: boolean
	title?: string
	bg?: string
	light?: boolean
	hideGitHubPopup?: boolean
}) => {
	const [scrolled, setScrolled] = useState(false)
	const [atTop, setAtTop] = useState(true)
	const [isOpen, setIsOpen] = useState(false)
	const [prevY, setPrevY] = useState(0)

	const changeBackground = () => {
		const currentScrollPos = window.pageYOffset
		if (window.scrollY > 60 && prevY < currentScrollPos) {
			setScrolled(true)
		} else if (window.scrollY > 60 && prevY > currentScrollPos) {
			setScrolled(false)
		}

		if (window.scrollY > 120) {
			setAtTop(false)
		} else {
			setAtTop(true)
		}

		setPrevY(currentScrollPos)
	}

	const isLivestreamWeek = moment().isBetween(
		'2024-03-28T00:00:00Z',
		'2024-04-12T00:00:00Z',
	)

	useEffect(() => {
		changeBackground()
		window.addEventListener('scroll', changeBackground)
	})

	return (
		<>
			{!hideGitHubPopup && <GithubPopup />}
			{!hideBanner ? (
				isLivestreamWeek ? (
					<LivestreamBanner />
				) : (
					<Link
						href="/startups"
						className="flex justify-center items-center w-full h-[40px] bg-color-primary-200 text-white hover:bg-opacity-90"
					>
						<Typography type="copy3">
							Got a startup? Apply for free Highlight credits!
						</Typography>
					</Link>
				)
			) : null}
			<div
				className={classNames(styles.container, {
					[styles.hide]: scrolled && !fixed,
					[styles.fixed]: fixed,
				})}
			>
				<header
					className={classNames({
						[styles.mobileHeader]: isOpen,
					})}
				>
					<div
						className={classNames(
							styles.header,
							styles.headerInner,
							`bg-${bg ? bg : ''} transition-all ${
								bg && atTop ? 'bg-opacity-10' : 'bg-opacity-100'
							}`,
							`${
								atTop
									? 'border-opacity-0'
									: 'border-opacity-100'
							} ${
								light ? '' : 'border-divider-on-dark'
							} border-b-[1px] transition-color duration-300`,

							{
								[styles.openHeader]: isOpen,
							},
						)}
					>
						<div
							className={classNames(
								styles.navContainer,
								styles.headerLeft,
							)}
						>
							<Link href={'/'} className={styles.urlStyle}>
								{isOpen ? (
									<HighlightLogoWhite />
								) : light ? (
									<HighlightLogoLight />
								) : (
									<HighlightLogo />
								)}
							</Link>
							<Typography type="copy3" emphasis={true}>
								<p
									className={classNames(styles.navTitle, {
										[styles.copyOnDark]: isOpen,
										[styles.copyOnLight]: !isOpen,
									})}
								>
									{title}
								</p>
							</Typography>
							{isDocsPage && (
								<DocSearch
									placeholder="Search the highlight.io docs"
									appId="JGT9LI80J2"
									indexName="highlight"
									apiKey="ac336720d8f4f996abe3adee603a1c84"
								/>
							)}
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
										<Typography
											type="copy3"
											emphasis={true}
										>
											<Link
												href={'/pricing'}
												className={styles.menuItemLarge}
											>
												Pricing
											</Link>
										</Typography>
									</li>
									<li>
										<Typography
											type="copy3"
											emphasis={true}
										>
											<Link
												href={'/blog'}
												className={styles.menuItemLarge}
											>
												Blog
											</Link>
										</Typography>
									</li>
									<li>
										<Typography
											type="copy3"
											emphasis={true}
										>
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
										<Typography
											type="copy3"
											emphasis={true}
										>
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
						{!isDocsPage && !light && (
							<div
								className={classNames(
									styles.navContainer,
									styles.header,
									styles.headerCenter,
								)}
							>
								<FeatureDropdown
									isOpen={scrolled && !fixed}
									light={light}
								/>
								<Link
									href="/integrations"
									className={classNames({
										[styles.headerButtonLight]: light,
										[styles.headerButton]: !light,
									})}
								>
									<Typography type="copy2">
										Integrations
									</Typography>
								</Link>
								<Link
									href="/pricing"
									className={classNames({
										[styles.headerButtonLight]: light,
										[styles.headerButton]: !light,
									})}
								>
									<Typography type="copy2">
										Pricing
									</Typography>
								</Link>
								<ResourceDropdown
									isOpen={scrolled && !fixed}
									light={light}
								/>
							</div>
						)}
						<div
							className={classNames(
								styles.navContainer,
								styles.header,
								styles.headerRight,
							)}
						>
							{!isDocsPage && (
								<Link
									href="/docs"
									className={classNames(
										styles.headerButtonRight,
										{
											[styles.headerButtonLight]: light,
											[styles.headerButton]: !light,
										},
									)}
								>
									<Typography type="copy2">Docs</Typography>
								</Link>
							)}
							<Link
								href="https://app.highlight.io/"
								className={classNames({
									[styles.headerButtonLight]: light,
									[styles.headerButton]: !light,
								})}
							>
								<Typography type="copy2">Sign in</Typography>
							</Link>
							<PrimaryButton
								href="https://app.highlight.io/sign_up"
								className={classNames(styles.signUpButton, {
									[styles.signUpButtonLight]: light,
								})}
							>
								<Typography type="copy2" emphasis={true}>
									Sign up
								</Typography>
							</PrimaryButton>
							<div className={styles.socialButtonContainer}>
								<Link
									href="https://github.com/highlight/highlight"
									target="_blank"
									rel="noreferrer"
									className={classNames(
										styles.socialButtonWrapper,
										styles.socialButtonWrapperLeft,
										{
											[styles.socialButtonWrapperLight]:
												light,
										},
									)}
								>
									<AiFillGithub
										className={classNames(
											styles.socialButton,
											{
												[styles.socialButtonLight]:
													light,
											},
										)}
									/>
								</Link>
								<div
									className={classNames(
										styles.socialButtonDivider,
										{
											[styles.socialButtonDividerLight]:
												light,
										},
									)}
								></div>
								<Link
									href="https://discord.gg/yxaXEAqgwN"
									target="_blank"
									rel="noreferrer"
									className={classNames(
										styles.socialButtonWrapper,
										styles.socialButtonWrapperRight,
										{
											[styles.socialButtonWrapperLight]:
												light,
										},
									)}
								>
									<FaDiscord
										className={classNames(
											styles.socialButton,
											{
												[styles.socialButtonLight]:
													light,
											},
										)}
									/>
								</Link>
							</div>
						</div>
					</div>
				</header>
			</div>
		</>
	)
}

export default Navbar
