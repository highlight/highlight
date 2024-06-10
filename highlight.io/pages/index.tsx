import type { NextPage } from 'next'
import Image from 'next/legacy/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { PrimaryButton } from '../components/common/Buttons/PrimaryButton'
import Navbar from '../components/common/Navbar/Navbar'
import { Section } from '../components/common/Section/Section'
import styles from '../components/Home/Home.module.scss'

import LandingInfoRowSecurity from '../public/images/landingInfoRowSecurity.png'

import classNames from 'classnames'
import Link from 'next/link'
import { FaPlay } from 'react-icons/fa'
import { AnimateBugLeft, AnimateBugRight } from '../components/Animate'
import { CalendlyModal } from '../components/common/CalendlyModal/CalendlyModal'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import { OSSCallToAction } from '../components/common/CallToAction/OSSCallToAction'
import Footer from '../components/common/Footer/Footer'
import { Typography } from '../components/common/Typography/Typography'
import { BigHeroArt } from '../components/Home/BigHeroArt'
import { CompaniesReel } from '../components/Home/CompaniesReel/CompaniesReel'
import { CustomerReviewTrack } from '../components/Home/CustomerReviewTrack'
import { FeatureCarousel } from '../components/Home/FeatureCarousel/FeatureCarousel'
import LandingInfoRow from '../components/Home/LandingInfoRow'
import { Review } from '../components/Home/Reviews'
import InfoRow from '../components/Products/InfoRow'

export const FeatureItem = ({
	children,
	...props
}: React.PropsWithChildren<{}>) => {
	return (
		<div {...props} className={styles.featureItem}>
			{children}
		</div>
	)
}

export const CustomerReview = ({
	companyLogo,
	text,
	author,
	scale,
}: Review) => {
	return (
		<div className={styles.reviewCard}>
			<div
				className={styles.companyLogo}
				style={{
					width: `${120 * (scale || 1)}px`,
					objectFit: 'contain',
				}}
			>
				<Image
					src={companyLogo}
					alt={author.name}
					layout={'fill'}
					objectFit={'contain'}
					style={{
						transform: `scale(${scale || 1})`,
					}}
				/>
			</div>
			<div className={styles.reviewText}>
				<Typography type="copy2">
					<p>{text}</p>
				</Typography>
			</div>
			<div className={styles.author}>
				<div className={styles.authorImage}>
					<Image src={author.image} alt={author.name} />
				</div>
				<div>
					<Typography type="copy2" emphasis>
						{author.name}
					</Typography>
					<Typography type="copy2">{`, ${author.role}`}</Typography>
				</div>
			</div>
		</div>
	)
}

const Home: NextPage = () => {
	const reviewsRef = useRef<HTMLDivElement>(null)
	const scrollYPosition = useRef<number>(0)
	const [scrollReviews, setScrollReviews] = useState(false)
	const [bugLoaded, setBugLoaded] = useState(true)
	const leftBugRef = useRef<HTMLVideoElement>(null)
	const rightBugRef = useRef<HTMLVideoElement>(null)

	const scrollListener = useCallback(() => {
		if (!scrollReviews) {
			return
		}

		if (reviewsRef.current) {
			const { scrollY } = window
			const scrollingDown = scrollYPosition.current > scrollY
			// Adjust this value to control scroll speed
			const scrollDistance = scrollingDown ? -3 : 3
			reviewsRef.current.scrollLeft += scrollDistance
			scrollYPosition.current = scrollY
		}
	}, [scrollReviews])

	useEffect(() => {
		window.removeEventListener('scroll', scrollListener)
		window.addEventListener('scroll', scrollListener)
		return () => window.removeEventListener('scroll', scrollListener)
	}, [scrollListener])

	useEffect(() => {
		// invoke the sitemap api to validate next metrics integration
		fetch('/sitemap.xml').then((r) => r.text())
	}, [])

	useEffect(() => {
		const reviewsElement = reviewsRef.current

		const observer = new IntersectionObserver(
			([entry]) => {
				setScrollReviews(entry.isIntersecting)
			},
			{
				rootMargin: '250px 0px',
				threshold: 0.0001,
			},
		)

		if (reviewsElement) {
			observer.observe(reviewsElement)

			// Scroll to center on load
			reviewsElement.scrollLeft =
				(reviewsElement.scrollWidth - window.innerWidth) / 2
		}

		return () => {
			if (reviewsElement) {
				observer.unobserve(reviewsElement)
			}
		}
	}, [reviewsRef])

	useEffect(() => {
		if (bugLoaded && leftBugRef.current && rightBugRef.current) {
			leftBugRef.current.play()
			rightBugRef.current.play()
		}
	}, [bugLoaded])

	return (
		<div>
			<Navbar />
			<main>
				<Section className={styles.heroVideoWrapper}>
					<AnimateBugLeft loaded={bugLoaded}>
						<div className={styles.heroBug}>
							<video
								ref={leftBugRef}
								width="400"
								height="400"
								onPlay={() => setBugLoaded(true)}
								autoPlay
								muted
								loop
							>
								<source
									src="/images/hero-bug-left.webm"
									type="video/webm"
								/>
								Your browser does not support the video tag.
							</video>
						</div>
					</AnimateBugLeft>
					<AnimateBugRight loaded={bugLoaded}>
						<div className={styles.heroBug}>
							<video
								ref={rightBugRef}
								width="400"
								height="400"
								className="scale-x-[-1]"
								onPlay={() => setBugLoaded(true)}
								autoPlay
								muted
								loop
							>
								<source
									src="/images/hero-bug-left.webm"
									type="video/webm"
								/>
								Your browser does not support the video tag.
							</video>
						</div>
					</AnimateBugRight>
					<div className={styles.anchorFeature}>
						<h2
							className={classNames(
								styles.landingAnchorHead,
								'px-5',
							)}
						>
							The open source, fullstack <br />
							<span className="text-highlight-yellow">
								Monitoring Platform.
							</span>
						</h2>
						<div className="flex justify-center mt-8">
							<div className="flex flex-col justify-center w-screen gap-4 px-5 sm:flex-row sm:w-auto">
								<PrimaryButton
									className={classNames(
										styles.solidButton,
										'min-w-[180px]',
									)}
									href="https://app.highlight.io/sign_up"
								>
									<Typography type="copy2" emphasis={true}>
										Get started
									</Typography>
								</PrimaryButton>

								<PrimaryButton
									href={'https://app.highlight.io/demo'}
									className={classNames(styles.hollowButton)}
								>
									<div className="flex items-center gap-2">
										<FaPlay />
										<Typography
											type="copy2"
											emphasis={true}
										>
											Live demo
										</Typography>
									</div>
								</PrimaryButton>
							</div>
						</div>
						<div className="relative flex flex-col items-center mt-8 mb-28">
							<CalendlyModal className="px-3 hover:bg-white/10" />
						</div>
						<FeatureCarousel />
					</div>
				</Section>
				<Section>
					<div className={styles.anchorFeature} id="features">
						<div className={styles.anchorTitle}>
							<h2>
								Web application monitoring for{' '}
								<span className={styles.highlightedText}>
									today&#39;s developer.
								</span>{' '}
							</h2>
						</div>
					</div>
				</Section>
				<div className={styles.infoContainer}>
					<LandingInfoRow
						title={`A cohesive view of your entire stack.`}
						desc={
							'A natural pairing between your errors, session replay, logs and more. Understand the “what”, “why” and “how” of your full-stack web application.'
						}
						link={'https://app.highlight.io/sign_up'}
						linkText={'Get started for free'}
						imgSrc={'/images/landingInfoRow1.png'}
						invert
					/>
					<LandingInfoRow
						title={`Support for all the modern frameworks.`}
						desc={`We support all the fancy new frameworks and our platform is powered by open source, scalable technologies.`}
						link={'/frameworks'}
						linkText={'View all frameworks'}
						imgSrc={'/images/landingInfoRow2.png'}
					/>
					<LandingInfoRow
						title={`Integrations with your favorite tools.`}
						desc="Connect your favorite issue tracker, support tool, or even analytics software and we’ll give you a way to push and pull data in the right places."
						link={'/integrations'}
						linkText={'View all integrations'}
						imgSrc={'/images/landingInfoRow3.png'}
						invert
					/>
				</div>
				<div className={styles.infoContainer}>
					<InfoRow
						title={`Built with compliance and security.`}
						desc="Whether its SOC 2, HIPAA, or ISO, highlight.io can work with your stack. Contact us at security@highlight.io for more information."
						link={'/docs/general/company/compliance-and-security'}
						linkText={'Read our docs'}
						imgSrc={LandingInfoRowSecurity}
					/>
				</div>
				<BigHeroArt />
				<OSSCallToAction />
				<Section>
					<CompaniesReel />
				</Section>
				<Section>
					<div className={styles.anchorFeature}>
						<div className={styles.anchorHead}>
							<Typography type="copy2" onDark>
								Don&apos;t take our word.{' '}
								<Link href="/customers">
									Read our customer review section →
								</Link>
							</Typography>
						</div>
					</div>
				</Section>
				<CustomerReviewTrack />
				<FooterCallToAction />
			</main>
			<Footer />
		</div>
	)
}

export default Home
