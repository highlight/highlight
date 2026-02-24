import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
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

import moment from 'moment'
import Banner from '../Banner/Banner'
import FeatureDropdown from './FeatureDropdown'
import InkeepSearchBar from './InkeepSearchBar'

const LaunchWeekBanner = () => {
	const bannerMessage = (
		<div className={styles.launchWeekText}>
			Launch Week 7 is here.{' '}
			<a
				target="_blank"
				href="https://dub.highlight.io/lw7-playlist"
				rel="noreferrer"
			>
				Follow along
			</a>{' '}
			to see what we&apos;ve been building!
		</div>
	)

	return <Banner>{bannerMessage}</Banner>
}

const MIGRATION_DEADLINE = new Date('2026-03-01T08:00:00Z') // EOD 2/28 PST

const useCountdown = (deadline: Date) => {
	// Start with null to avoid SSR/client hydration mismatch
	const [timeLeft, setTimeLeft] = useState<number | null>(null)

	useEffect(() => {
		const computeDiff = () => {
			const diff = deadline.getTime() - Date.now()
			return diff > 0 ? diff : 0
		}
		setTimeLeft(computeDiff())
		const timer = setInterval(() => {
			const diff = computeDiff()
			setTimeLeft(diff)
			if (diff <= 0) clearInterval(timer)
		}, 1000)
		return () => clearInterval(timer)
	}, [deadline])

	const t = timeLeft ?? 0
	const days = Math.floor(t / (1000 * 60 * 60 * 24))
	const hours = Math.floor((t / (1000 * 60 * 60)) % 24)
	const minutes = Math.floor((t / (1000 * 60)) % 60)
	const seconds = Math.floor((t / 1000) % 60)
	const isExpired = timeLeft !== null && timeLeft <= 0
	const isMounted = timeLeft !== null

	// Show only the largest non-zero unit
	let countdownText = ''
	if (days > 0) {
		countdownText = `${days} day${days !== 1 ? 's' : ''}`
	} else if (hours > 0) {
		countdownText = `${hours} hour${hours !== 1 ? 's' : ''}`
	} else if (minutes > 0) {
		countdownText = `${minutes} minute${minutes !== 1 ? 's' : ''}`
	} else if (seconds > 0) {
		countdownText = `${seconds} second${seconds !== 1 ? 's' : ''}`
	}

	return { countdownText, isExpired, isMounted }
}

const PromotionBanner = () => {
	const { countdownText, isExpired, isMounted } =
		useCountdown(MIGRATION_DEADLINE)

	const showCountdown = isMounted && !isExpired && countdownText

	return (
		<Link
			href="/blog/launchdarkly-migration?utm_source=highlight-banner"
			className="hidden md:flex text-center justify-center items-center w-full py-2.5 px-3 text-white hover:brightness-110 transition-all"
			style={{
				backgroundColor: '#cd2b31',
			}}
		>
			<Typography type="copy3">
				Migrate your Highlight account to LaunchDarkly
				{showCountdown ? ' — ' : '. '}
				{showCountdown && (
					<AnimatePresence mode="popLayout">
						<motion.span
							key={countdownText}
							initial={{
								y: -6,
								opacity: 0,
								scale: 0.85,
							}}
							animate={{
								y: 0,
								opacity: 1,
								scale: 1,
							}}
							exit={{
								y: 6,
								opacity: 0,
								scale: 0.85,
							}}
							transition={{
								type: 'spring',
								stiffness: 300,
								damping: 20,
							}}
							className="font-bold"
						>
							{countdownText}
						</motion.span>
					</AnimatePresence>
				)}
				{showCountdown && ' remaining. '}
				<span className="font-semibold underline">
					Learn more on our blog.
				</span>
			</Typography>
		</Link>
	)
}

const Navbar = ({
	isDocsPage,
	hideBanner,
	fixed,
	title,
	bg,
	light,
	hideGitHubPopup,
}: {
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

	const isLaunchWeek = moment().isBetween(
		'2024-10-21T13:00:00Z', // 6AM PST
		'2024-10-26T13:00:00Z',
	)

	useEffect(() => {
		changeBackground()
		window.addEventListener('scroll', changeBackground)
	})

	return (
		<>
			{!hideGitHubPopup && <GithubPopup />}
			{!hideBanner ? (
				isLaunchWeek ? (
					<LaunchWeekBanner />
				) : (
					<PromotionBanner />
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
							{isDocsPage && <InkeepSearchBar />}
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
