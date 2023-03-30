import classNames from 'classnames'
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
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
import errorMonitoringHero from '../../public/images/features/errorMonitoringHero.png'
import loggingHero from '../../public/images/features/loggingHero.png'
import sessionReplayHero from '../../public/images/features/sessionReplayHero.png'
import sessionscreenshot from '../../public/images/sessionscreenshot.png'

import {
	AnimateFeatureHeroRight,
	AnimateFeatureHeroXL,
} from '../../components/Animate'

const CompetitorComparisonPage = ({
	competitor,
}: {
	competitor: Competitor
}) => {
	const [imageLoaded, setImageLoaded] = useState(false)

	return (
		<div>
			<Image
				src={sessionReplayHero}
				alt="Hero Background"
				className="hidden"
			/>
			<Image
				src={errorMonitoringHero}
				alt="Hero Background"
				className="hidden"
			/>
			<Image src={loggingHero} alt="Hero Background" className="hidden" />
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
				<div className="flex flex-col xl:flex-row justify-between w-screen px-8 mx-auto lg:px-4 lg:py-28 max-w-[1200px] 2xl:max-w-[1400px]">
					<div className="lg:w-[60%] flex justify-center mt-10">
						<div className="flex flex-col max-w-4xl gap-8 text-center lg:text-left">
							<h2 className="text-white">
								The Open Source {competitor.name} alternative.
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
									href={
										'/docs/general/product-features/session-replay/overview'
									}
									className={classNames(
										homeStyles.hollowButton,
									)}
								>
									<Typography type="copy2" emphasis={true}>
										Read our docs
									</Typography>
								</PrimaryButton>
							</div>
						</div>
					</div>
					<div className="flex justify-center mt-12 lg:mt-0 ultra:relative">
						<AnimateFeatureHeroRight loaded={imageLoaded}>
							<Image
								className={`hidden lg:flex ultra:hidden right-0 object-contain top-0`}
								src={sessionReplayHero}
								alt="Feature Spotlight"
								onLoadingComplete={() => setImageLoaded(true)}
							/>
						</AnimateFeatureHeroRight>
						<AnimateFeatureHeroXL loaded={imageLoaded}>
							<Image
								className={`hidden ultra:flex`}
								src={sessionscreenshot}
								alt="Feature Spotlight"
								onLoadingComplete={() => setImageLoaded(true)}
							/>
						</AnimateFeatureHeroXL>
						<Image
							className={`lg:hidden right-0 object-contain bottom-0 md:w-[500px]`}
							src={sessionscreenshot}
							alt="Feature Spotlight"
							onLoadingComplete={() => setImageLoaded(true)}
						/>
					</div>
				</div>
				<div className="w-full mx-auto max-w-screen-2xl mt-24 lg:mt-36">
					<Section className="flex flex-col gap-20">
						<div className="mx-auto max-w-[1100px]">
							<h2 className="self-center text-center">
								How does{' '}
								<span className="text-color-selected-light">
									highlight.io
								</span>{' '}
								stack up?
							</h2>
							<div className="px-8 max-w-[1000px] mx-auto mt-6 text-center">
								<Typography
									type="copy1"
									className="text-copy-on-dark text-center"
								>
									{competitor.subHeader2}
								</Typography>
							</div>
						</div>
						<CompetitorTable competitor={competitor} />
					</Section>
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

	return {
		props: {
			competitor: COMPETITORS[slug],
		},
	}
}

export default CompetitorComparisonPage
