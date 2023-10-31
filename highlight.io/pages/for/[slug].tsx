import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Navbar from '../../components/common/Navbar/Navbar'
import FeatureBox from '../../components/Products/FeatureBox'

import {
	BsBarChartFill,
	BsFillTerminalFill,
	BsPlayCircleFill,
} from 'react-icons/bs'
import { iProduct, PRODUCTS } from '../../components/Products/products'

import { GetStaticPaths, GetStaticProps } from 'next'

import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import { Section } from '../../components/common/Section/Section'
import { Typography } from '../../components/common/Typography/Typography'
import { HighlightCodeBlock } from '../../components/Docs/HighlightCodeBlock/HighlightCodeBlock'
import landingStyles from '../../components/Home/Home.module.scss'
import styles from '../../components/Products/Products.module.scss'
import ProductsErrors from '../../public/images/products-errors.png'
import ProductsGraph from '../../public/images/products-graph.png'
import ProductsReplay from '../../public/images/products-replay.png'

import { CustomerReview } from '..'
import { AnimateBugLeft, AnimateBugRight } from '../../components/Animate'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import { CompaniesReel } from '../../components/Home/CompaniesReel/CompaniesReel'
import { REVIEWS } from '../../components/Home/Reviews'
import InfoRow from '../../components/Products/InfoRow'
import HeroBugLeft from '../../public/images/hero-bug-left.gif'
import HeroBugRight from '../../public/images/hero-bug-right.gif'
import { FaPlay } from 'react-icons/fa'

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: Object.keys(PRODUCTS).map((k: string) => ({
			params: { slug: k },
		})),
		fallback: 'blocking',
	}
}

//Gets list of products from products.ts
export const getStaticProps: GetStaticProps = async ({ params }) => {
	const slug = params?.slug as string

	// Handle event slugs which don't exist
	if (!PRODUCTS[slug]) {
		return {
			notFound: true,
		}
	}

	return {
		props: {
			product: PRODUCTS[slug],
		},
	}
}

const Products = ({ product }: { product: iProduct }) => {
	const reviewsRef = useRef<HTMLDivElement>(null)
	const scrollYPosition = useRef<number>(0)
	const [scrollReviews, setScrollReviews] = useState(false)
	const [leftBugLoaded, setLeftBugLoaded] = useState(false)
	const [rightBugLoaded, setRightBugLoaded] = useState(false)

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

	return (
		<div>
			<Navbar hideBanner />
			<div>
				<Section className={landingStyles.heroVideoWrapper}>
					<AnimateBugLeft loaded={leftBugLoaded && rightBugLoaded}>
						<div className={landingStyles.heroBug}>
							<Image
								src={HeroBugLeft}
								alt="bug left"
								onLoadingComplete={() => setLeftBugLoaded(true)}
							/>
						</div>
					</AnimateBugLeft>
					<AnimateBugRight loaded={leftBugLoaded && rightBugLoaded}>
						<div className={landingStyles.heroBug}>
							<Image
								src={HeroBugRight}
								alt="bug right"
								onLoadingComplete={() =>
									setRightBugLoaded(true)
								}
							/>
						</div>
					</AnimateBugRight>
					<div className={landingStyles.anchorFeature}>
						<div className={landingStyles.anchorHead}>
							<h1>
								The{' '}
								<span className={landingStyles.highlightedText}>
									{product.title}
								</span>
								<br />
								monitoring toolkit{' '}
								<br className="hidden sm:flex" />
								you&apos;ve been waiting{' '}
								<br className="hidden sm:flex" />
								for.
							</h1>
							<div className="mt-4 sm:mt-8 px-4 max-w-[840px]">
								<Typography type="copy1" onDark>
									What if monitoring your {product.title} app
									was as easy as deploying it? With session
									replay and error monitoring,
									Highlight&apos;s got you covered.
								</Typography>
							</div>
							<div className="flex justify-center my-14">
								<div className="flex flex-col sm:flex-row justify-center gap-4 w-screen sm:w-auto px-5">
									<PrimaryButton
										className={classNames(
											landingStyles.solidButton,
											'min-w-[180px]',
										)}
										href="https://app.highlight.io/sign_up"
									>
										<Typography
											type="copy2"
											emphasis={true}
										>
											Get started
										</Typography>
									</PrimaryButton>

									<PrimaryButton
										href={'https://app.highlight.io/demo'}
										className={classNames(
											styles.hollowButton,
										)}
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
						</div>
					</div>
				</Section>
				<div className="flex justify-center mb-20 md:mb-[160px]">
					<div className="flex flex-col lg:flex-row justify-center gap-4 px-4 lg:gap-12 lg:px-12">
						<FeatureBox
							title="Session Replay"
							desc="Investigate hard-to-crack bugs by playing through issues in a youtube-like UI.
                    With access to requests, console logs and more!"
							icon={<BsPlayCircleFill />}
						/>
						<FeatureBox
							title="Error Monitoring"
							desc={`Continuously monitor errors and exceptions in your ${product.title} application,
                    all the way from your frontend to your backend.`}
							icon={<BsFillTerminalFill />}
						/>
						<FeatureBox
							title="Performance Metrics"
							desc={`Monitor and set alerts for important performance metrics in ${product.title}
                    like Web Vitals, Request latency, and much more!`}
							icon={<BsBarChartFill />}
						/>
					</div>
				</div>
				<div className="flex justify-center bg-color-primary-200">
					<div className={styles.anchorFeature}>
						<div className={landingStyles.anchorHead}>
							<div className={styles.subtleBadge}>
								<Typography type="copy4" emphasis>
									Highlight for {product.title}
								</Typography>
							</div>
							<div className="px-8">
								<h2>
									Get started in your{' '}
									<br className="hidden sm:flex" />
									{product.title} app <br />
									today.
								</h2>
							</div>

							<div className="flex justify-center my-14">
								<div className="flex flex-col lg:flex-row justify-center gap-4">
									<PrimaryButton href="https://app.highlight.io/sign_up">
										<Typography
											type="copy2"
											emphasis={true}
										>
											Get started for free
										</Typography>
									</PrimaryButton>

									<PrimaryButton
										href={'https://app.highlight.io/demo'}
										className={classNames(
											styles.hollowButton,
										)}
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
						</div>
						<div className="w-4/5 mb-20 md:mb-40">
							<HighlightCodeBlock
								language={'js'}
								product={product}
								showLineNumbers={false}
								topbar={true}
							/>
						</div>
					</div>
				</div>
				<div className={styles.infoContainer}>
					<InfoRow
						title={`Reproduce issues with high-fidelity session replay.`}
						desc={`With our pixel-perfect replays of your ${product.title} app,
            you'll get to the bottom of issues in no time and better
            understand how your app is being used.`}
						link={product.docsLink}
						linkText={'Read our docs'}
						imgSrc={ProductsReplay}
					/>

					<div className={styles.divider} />

					<InfoRow
						title={`Get a ping when exceptions or errors are thrown.`}
						desc={`Our alerting infrastructure can take abnormal metrics or
            errors raised in your ${product.title} app and notify your
            engineering team over Slack, Discord, and more!`}
						link={product.docsLink}
						linkText={'Read our docs'}
						imgSrc={ProductsErrors}
						invert={true}
					/>

					<div className={styles.divider} />

					<InfoRow
						title={`Monitor the metrics that keep your customers around.`}
						desc={`Highlight allows you to track performance, request timings, and several other metrics
            in your ${product.title} application.`}
						link={product.docsLink}
						linkText={'Read our docs'}
						imgSrc={ProductsGraph}
					/>
				</div>
				<Section>
					<CompaniesReel />
				</Section>
				<Section>
					<div className={landingStyles.anchorFeature}>
						<div className={landingStyles.anchorHead}>
							<Typography type="copy2" onDark>
								Don&apos;t take our word.{' '}
								<Link href="/customers">
									What our customers have to say →
								</Link>
							</Typography>
						</div>
					</div>
				</Section>
				<div className={landingStyles.slider} ref={reviewsRef}>
					<div className={landingStyles.slideTrack}>
						{[...REVIEWS, ...REVIEWS].map((review, i) => (
							<CustomerReview
								key={i}
								companyLogo={review.companyLogo}
								text={review.text}
								author={review.author}
								scale={review.scale}
							/>
						))}
					</div>
				</div>
				<FooterCallToAction />
			</div>
			<Footer />
		</div>
	)
}

export default Products
