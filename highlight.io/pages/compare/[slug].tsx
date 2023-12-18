import classNames from 'classnames'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { FaPlay } from 'react-icons/fa'
import { MdKeyboardReturn } from 'react-icons/md'
import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import { OSSCallToAction } from '../../components/common/CallToAction/OSSCallToAction'
import Footer from '../../components/common/Footer/Footer'
import Navbar from '../../components/common/Navbar/Navbar'
import { Section } from '../../components/common/Section/Section'
import { Typography } from '../../components/common/Typography/Typography'
import CompetitorTable from '../../components/Competitors/ComparisonTable'
import {
	Competitor,
	COMPETITORS,
} from '../../components/Competitors/competitors'
import { CompaniesReel } from '../../components/Home/CompaniesReel/CompaniesReel'
import { CustomerReviewTrack } from '../../components/Home/CustomerReviewTrack'
import homeStyles from '../../components/Home/Home.module.scss'
import errorMonitoringSlanted from '../../public/images/error-monitoring.webp'
import loggingSlanted from '../../public/images/features/loggingHero.png'
import sessionReplaySlant from '../../public/images/features/sessionReplayHero.png'
import loggingStraight from '../../public/images/loggingscreenshot.png'
import errorMonitoringStraight from '../../public/images/monitoringscreenshot.png'
import sessionReplayStraight from '../../public/images/sessionscreenshot.png'

import {
	AnimateFeatureHeroRight,
	AnimateFeatureHeroXL,
} from '../../components/Animate'

const heroImage = {
	'session-replay': {
		slanted: sessionReplaySlant,
		straight: sessionReplayStraight,
	},
	'error-monitoring': {
		slanted: errorMonitoringSlanted,
		straight: errorMonitoringStraight,
	},
	logging: {
		slanted: loggingSlanted,
		straight: loggingStraight,
	},
}

const CompetitorComparisonPage = ({
	competitor,
	sources,
}: {
	competitor: Competitor
	sources: MDXRemoteSerializeResult<
		Record<string, unknown>,
		Record<string, unknown>
	>[]
}) => {
	const [imageLoaded, setImageLoaded] = useState(false)

	const slantedImage = heroImage[competitor.type || 'session-replay'].slanted
	const straightImage =
		heroImage[competitor.type || 'session-replay'].straight

	return (
		<div>
			<Image
				src={sessionReplaySlant}
				alt="Hero Background"
				className="hidden"
			/>
			<Image
				src={errorMonitoringSlanted}
				alt="Hero Background"
				className="hidden"
			/>
			<Image
				src={loggingSlanted}
				alt="Hero Background"
				className="hidden"
			/>
			<Navbar />
			<div className="hidden md:flex ml-10 my-2">
				<Link href="/">
					<Typography type="copy3" emphasis={true}>
						<div className="flex items-center justify-start gap-2">
							<MdKeyboardReturn className="h-5" /> Explore
							highlight.io
						</div>
					</Typography>
				</Link>
			</div>
			<main>
				<div className="flex flex-col xl:flex-row  justify-between w-screen px-8 mx-auto lg:px-4 lg:py-12 xl:py-28 max-w-[1200px] 2xl:max-w-[1400px]">
					<div className="lg:w-[60%] flex justify-center mt-10">
						<div className="flex flex-col max-w-4xl gap-8 text-center lg:text-left">
							<h2 className="text-white">
								The Open Source{' '}
								<br className="hidden 2xl:flex" />
								{competitor.name} alternative
							</h2>

							<Typography
								type="copy1"
								className="lg:w-3/4 text-copy-on-dark"
							>
								{competitor.subheader}
							</Typography>
							<div className="flex flex-col lg:flex-row justify-start gap-4 w-full lg:w-auto">
								<PrimaryButton
									className={classNames(
										homeStyles.solidButton,
										'min-w-[180px]',
									)}
									href="https://app.highlight.io/?sign_up=1"
								>
									<Typography type="copy2" emphasis={true}>
										Get started for free
									</Typography>
								</PrimaryButton>
								<PrimaryButton
									href={'https://app.highlight.io/demo'}
									className={classNames(
										homeStyles.hollowButton,
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
					<div className="flex justify-center mt-12 lg:mt-0 ultra:relative">
						<AnimateFeatureHeroRight loaded={imageLoaded}>
							<Image
								className={`hidden lg:flex ultra:hidden right-0 object-contain top-0 lg:w-[550px] xl:w-[650px]`}
								src={slantedImage}
								alt="Feature Spotlight"
								onLoad={() => setImageLoaded(true)}
							/>
						</AnimateFeatureHeroRight>
						<AnimateFeatureHeroXL loaded={imageLoaded}>
							<Image
								className={`hidden ultra:flex w-[650px]`}
								src={straightImage}
								alt="Feature Spotlight"
								onLoad={() => setImageLoaded(true)}
							/>
						</AnimateFeatureHeroXL>
						<Image
							className={`lg:hidden right-0 object-contain bottom-0 md:w-[500px]`}
							src={straightImage}
							alt="Feature Spotlight"
							onLoad={() => setImageLoaded(true)}
						/>
					</div>
				</div>
				<div className="w-full mx-auto max-w-[1200px] mt-24 lg:mt-36 px-8">
					<div className="flex flex-col gap-20">
						<div className="mx-auto max-w-[1200px]">
							<h3 className="text-center">
								Highlight.io vs {competitor.name}
							</h3>
							<div className="px-8 max-w-[1000px] mx-auto mt-6 text-center">
								<Typography
									type="copy1"
									className="text-copy-on-dark text-center"
								>
									A detailed comparison of {competitor.name}{' '}
									and Highlight.io
								</Typography>
							</div>
						</div>
						<CompetitorTable competitor={competitor} />
					</div>
					<div className="max-w-[880px] mx-auto my-28">
						<h4 className="mb-8">What makes us different?</h4>
						<div className="flex flex-col gap-8">
							{competitor.paragraphs?.map((paragraph, index) => (
								<div
									key={index}
									className="flex flex-col gap-3"
								>
									<h5 className="text-left">
										{paragraph.header}
									</h5>
									<Typography
										type="copy2"
										className="text-copy-on-dark text-left"
									>
										<MDXRemote
											{...sources[index]}
											components={{
												p: (props) => (
													<Typography
														type="copy2"
														{...props}
													/>
												),
											}}
										/>
									</Typography>
								</div>
							))}
						</div>
					</div>
				</div>
				<OSSCallToAction />
				<Section>
					<CompaniesReel />
				</Section>
				<Section>
					<div className={homeStyles.anchorFeature}>
						<div className={homeStyles.anchorHead}>
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

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: Object.keys(COMPETITORS).map((k: string) => ({
			params: { slug: k },
		})),
		fallback: 'blocking',
	}
}

//Gets list of products from products.ts
export const getStaticProps: GetStaticProps = async ({ params }) => {
	const slug = params?.slug as string

	// Handle event slugs which don't exist
	if (!COMPETITORS[slug]) {
		return {
			notFound: true,
		}
	}

	let competitor = COMPETITORS[slug]

	const sources = []

	if (competitor.paragraphs)
		for (let i = 0; i < competitor.paragraphs.length; i++) {
			let paragraph = competitor.paragraphs[i]
			const mdxSource = await serialize(paragraph.body)
			sources.push(mdxSource)
		}

	return {
		props: {
			competitor: COMPETITORS[slug],
			sources: sources,
		},
	}
}

export default CompetitorComparisonPage
