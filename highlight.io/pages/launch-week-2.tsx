import Image from 'next/image'
import Link from 'next/link'
import { BiChevronRight } from 'react-icons/bi'
import { BsTwitter } from 'react-icons/bs'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import { Meta } from '../components/common/Head/Meta'
import Navbar from '../components/common/Navbar/Navbar'
import { Section } from '../components/common/Section/Section'
import { Typography } from '../components/common/Typography/Typography'
import { CompaniesReel } from '../components/Home/CompaniesReel/CompaniesReel'
import { CustomerReviewTrack } from '../components/Home/CustomerReviewTrack'
import styles from '../components/Home/Home.module.scss'
import DayFive from '../components/Launch/DayFive'
import DayFour from '../components/Launch/DayFour'
import DayOne from '../components/Launch/DayOne'
import DayThree from '../components/Launch/DayThree'
import DayTwo from '../components/Launch/DayTwo'
import preview from '../public/images/launch/preview.png'

const LaunchPage = () => {
	const day = 5

	function scrollToDay(day: number) {
		if (document && document.getElementById('day-' + day.toString())) {
			document
				.getElementById('day-' + day.toString())!
				.scrollIntoView({ behavior: 'smooth' })
		}
	}

	return (
		<div>
			<Meta
				title="Highlight.io Launch Week 2"
				description="Discover error monitoring, logging, and session replay with highlight.io. Join us for Launch Week 2 and elevate your tech stack."
				absoluteImageUrl={`https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}${preview.src}`}
				canonical="/launch-week-2"
			/>
			<Navbar hideBanner />
			<main className="scroll-smooth">
				<div className="flex flex-col gap-2 mt-20 text-center px-8">
					<h2>
						Launch Week 2.{' '}
						<span className="text-color-selected-light">
							It&apos;s Hype.
						</span>{' '}
					</h2>
					<Typography
						type="copy1"
						className="text-darker-copy-on-dark"
					>
						July 17th - 21st, 2023
					</Typography>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-20 max-w-[550px] md:max-w-[1200px] mx-auto px-8">
					<Link
						onClick={(e) => {
							e.preventDefault()
							scrollToDay(day)
						}}
						href={'/launch-week-2#day-' + day.toString()}
						className="flex justify-between items-center text-copy-on-dark p-4 w-full bg-[#150831] border-[1px] border-divider-on-dark rounded-md flex-shrink-0 hover:border-[#9479D9] transition-all"
					>
						<Typography type="copy4" emphasis>
							Go to Day {day}
						</Typography>
						<div className="flex gap-3 items-center">
							<Typography
								className="text-color-selected-light rounded-full border-[1px] border-color-selected-light px-2 py-[1px]"
								type="copy4"
								emphasis
							>
								Today&apos;s launch
							</Typography>
							<BiChevronRight className="text-darker-copy-on-dark h-7 w-7 bg-white bg-opacity-10 p-1 rounded-full" />
						</div>
					</Link>

					<Link
						href="https://twitter.com/highlightio?lang=en"
						className="flex justify-between p-4 w-full bg-[#150831] border-[1px] border-divider-on-dark rounded-md flex-shrink-0 hover:border-[#9479D9] transition-all"
					>
						<div className="flex gap-3 items-center">
							<BsTwitter className="w-6 h-6" />
							<Typography
								className="text-copy-on-dark"
								type="copy4"
								emphasis
							>
								Keep in touch on Twitter
							</Typography>
						</div>
						<BiChevronRight className="text-darker-copy-on-dark h-7 w-7 bg-white bg-opacity-10 p-1 rounded-full" />
					</Link>

					<Link
						href="https://dub.sh/O3ayz3t"
						className="flex justify-between p-4 w-full bg-[#150831] border-[1px] border-divider-on-dark rounded-md flex-shrink-0 hover:border-[#9479D9] transition-all"
					>
						<div className="flex gap-3 items-center">
							<Image
								src="/images/companies/icons/hackernews.svg"
								alt=""
								width={24}
								height={24}
							/>
							<Typography
								className="text-copy-on-dark"
								type="copy4"
								emphasis
							>
								Check in on Hacker News
							</Typography>
						</div>
						<BiChevronRight className="text-darker-copy-on-dark h-7 w-7 bg-white bg-opacity-10 p-1 rounded-full" />
					</Link>
				</div>
				<div className="flex flex-col items-center gap-16 w-full max-w-[550px] md:max-w-[1200px] mx-auto my-10 px-8">
					<DayOne />
					<DayTwo />
					<DayThree />
					<DayFour />
					<DayFive />
				</div>
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

export default LaunchPage
