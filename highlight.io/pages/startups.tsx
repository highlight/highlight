import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { HiCheckCircle } from 'react-icons/hi'
import { AnimateFadeIn } from '../components/Animate'
import { PrimaryButton } from '../components/common/Buttons/PrimaryButton'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import { Meta } from '../components/common/Head/Meta'
import Navbar from '../components/common/Navbar/Navbar'
import { Section } from '../components/common/Section/Section'
import { Typography } from '../components/common/Typography/Typography'
import { CustomerReel } from '../components/Home/CompaniesReel/CustomerReel'
import swag from '../public/images/highlightswag.webp'
import meta from '../public/images/startupherometa.png'
import hero from '../public/images/startupshero.svg'

const StartupsPage = () => {
	const [email, setEmail] = useState<string>('')
	const [heroLoaded, setHeroLoaded] = useState(false)

	return (
		<div>
			<Meta
				title="Highlight for Startups"
				description="If your startup has raised less than $2M in funding, you may qualify for up to 6 months of free Highlight usage!"
				absoluteImageUrl={`https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}${meta.src}`}
				canonical={`/startups`}
			/>
			<Navbar />
			<main className="md:mt-16">
				<Section>
					<div className="flex flex-col lg:flex-row w-full justify-between items-center">
						<div className="flex flex-col gap-4 lg:w-5/12">
							<Typography
								type="copy3"
								className="text-copy-on-dark"
								emphasis
							>
								Apply Today
							</Typography>
							<h2 className="m-0">Highlight for Startups</h2>
							<Typography
								type="copy1"
								className="text-darker-copy-on-dark"
							>
								If your startup has raised less than 2M in
								funding, you may qualify for up to 1 year of
								free Highlight usage.
							</Typography>
							<div className="flex items-center flex-grow gap-1 p-2 pl-4 mt-4 transition-colors border rounded-lg text-copy-on-dark border-copy-on-light focus-within:border-white">
								<input
									type="text"
									placeholder={'Enter your email'}
									value={email}
									onChange={(ev) =>
										setEmail(ev.currentTarget.value)
									}
									className={
										'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[14px] md:text-[17px] w-0'
									}
								/>
								<PrimaryButton
									href={`https://8fonvna4lyz.typeform.com/to/K0WXGewT#email=${
										email || 'xxxxx'
									}`}
									className="bg-white hover:bg-opacity-70 rounded-lg"
									target="_blank"
								>
									Get Started
								</PrimaryButton>
							</div>
						</div>

						<div className="flex justify-end">
							<AnimateFadeIn loaded={heroLoaded}>
								<Image
									alt=""
									src={hero}
									height="424"
									width="568"
									className="scale-75"
									onLoadingComplete={() =>
										setHeroLoaded(true)
									}
								/>
							</AnimateFadeIn>
						</div>
					</div>
				</Section>
				<Section>
					<div className="flex flex-col md:flex-row justify-center items-center w-full md:gap-16 md:mt-32">
						<div className="flex justify-end md:w-1/2">
							<Image
								alt=""
								src={swag}
								height="424"
								width="568"
								className="max-w-[425px] scale-75 md:scale-100"
							/>
						</div>
						<div className="flex flex-col justify-center md:w-1/2 gap-2">
							<h3 className="m-0">Program Benefits</h3>
							<Typography
								type="copy1"
								className="text-darker-copy-on-dark mb-3"
							>
								Apply now and receive exclusive Highlight swag!
							</Typography>

							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<HiCheckCircle className="w-5 h-5 text-color-selected-light" />
									<Typography
										type="copy2"
										className="text-copy-on-dark"
										emphasis
									>
										Free Highlight.io mug
									</Typography>
								</div>

								<div className="flex items-center gap-2">
									<HiCheckCircle className="w-5 h-5 text-color-selected-light" />
									<Typography
										type="copy2"
										className="text-copy-on-dark"
										emphasis
									>
										Free Highlight.io t-shirt
									</Typography>
								</div>
								<div className="flex items-center gap-2">
									<HiCheckCircle className="w-5 h-5 text-color-selected-light" />
									<Typography
										type="copy2"
										className="text-copy-on-dark"
										emphasis
									>
										4 Airtags
									</Typography>
								</div>
								<div className="flex items-center gap-2">
									<HiCheckCircle className="w-5 h-5 text-color-selected-light" />
									<Typography
										type="copy2"
										className="text-copy-on-dark"
										emphasis
									>
										Shared slack channel for 1:1 support
									</Typography>
								</div>
								<div className="flex items-center gap-2">
									<HiCheckCircle className="w-5 h-5 text-color-selected-light" />
									<Typography
										type="copy2"
										className="text-copy-on-dark"
										emphasis
									>
										Eternal love from the Highlight team
									</Typography>
								</div>
							</div>
						</div>
					</div>
				</Section>
				<Section>
					<div className="flex flex-col items-center text-center w-full md:mt-32">
						<h3>Startups ❤️ Highlight</h3>
						<div className="flex justify-center max-w-[600px]">
							<Typography
								type="copy1"
								className="max-w-[800px] mt-4 text-darker-copy-on-dark"
							>
								From Seed to Series C, Highlight is loved by
								Startups across the globe.
								<Link href="/customers">
									{' '}
									More about our customers →
								</Link>
							</Typography>
						</div>
					</div>
				</Section>
				<CustomerReel />
				<div className="mt-32" />
				<FooterCallToAction buttonLink="https://8fonvna4lyz.typeform.com/to/K0WXGewT#email=xxxxx" />
			</main>
			<Footer />
		</div>
	)
}

export default StartupsPage
