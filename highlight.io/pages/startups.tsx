import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { HiCheckCircle } from 'react-icons/hi'
import { PrimaryButton } from '../components/common/Buttons/PrimaryButton'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import Navbar from '../components/common/Navbar/Navbar'
import { Section } from '../components/common/Section/Section'
import { Typography } from '../components/common/Typography/Typography'
import { CustomerReel } from '../components/Home/CompaniesReel/CustomerReel'
import swag from '../public/images/highlightswag.svg'
import hero from '../public/images/startupshero.svg'

const StartupsPage = () => {
	const [email, setEmail] = useState<string>('')

	return (
		<div>
			<Navbar />
			<main>
				<Section>
					<div className="flex flex-col lg:flex-row w-full justify-between items-center">
						<div className="flex flex-col gap-4 lg:w-1/2">
							<Typography type="copy3" emphasis>
								Highlight for Startups
							</Typography>
							<h2 className="m-0">Highlight for Startups</h2>
							<Typography
								type="copy2"
								className="text-darker-copy-on-dark"
							>
								If you&apos;re a startup with less than 2M in
								funding, apply for $5k worth of credits and some
								Highlight swag!
							</Typography>
							<div className="flex items-center flex-grow gap-1 p-2 pl-4 mt-4 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light">
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
							<Image
								alt=""
								src={hero}
								height="424"
								width="568"
								className="scale-75"
							/>
						</div>
					</div>
				</Section>
				<Section>
					<div className="flex justify-center items-center w-full gap-16">
						<div className="flex justify-end w-1/2">
							<Image
								alt=""
								src={swag}
								height="424"
								width="568"
								className="max-w-[425px]"
							/>
						</div>
						<div className="flex flex-col justify-center w-1/2 gap-2">
							<h3>Program Benefits</h3>
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
										Free Highlight.io Mug
									</Typography>
								</div>

								<div className="flex items-center gap-2">
									<HiCheckCircle className="w-5 h-5 text-color-selected-light" />
									<Typography
										type="copy2"
										className="text-copy-on-dark"
										emphasis
									>
										Free Highlight.io T-shirt
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
							</div>
						</div>
					</div>
				</Section>
				<Section>
					<div className="flex flex-col items-center text-center w-full">
						<h3>Startups ❤️ Highlight</h3>
						<div className="flex justify-center ">
							<Typography
								type="copy1"
								className="max-w-[800px] mt-4 text-darker-copy-on-dark"
							>
								From Series D to garage startups, Highlight is
								leveraged by many different types of startups.
								<Link href="/customers">
									{' '}
									Find out more about our customers →
								</Link>
							</Typography>
						</div>
					</div>
				</Section>
				<CustomerReel />
				<Section>
					<div className="flex flex-col items-center text-center w-full">
						<h3>We cover all your observability needs.</h3>
						<div className="flex justify-center ">
							<Typography
								type="copy1"
								className="max-w-[800px] mt-4 text-darker-copy-on-dark"
							>
								Monitor your app more efficiently by bringing
								your developers together in Highlight&apos;s
								full-stack monitoring tool.
							</Typography>
						</div>
						<div className="flex flex-col md:flex-row justify-center gap-8 mt-8">
							<div className="text-start max-w-[300px]">
								<div className="aspect-square w-full border border-divider-on-dark rounded-md"></div>
								<h5 className="text-darker-copy-on-dark">
									Error Monitoring
								</h5>
								<Typography
									type="copy2"
									className="mt-6 text-darker-copy-on-dark"
								>
									Monitor your app more efficiently by
									bringing your developers together in
									Highlight&apos;s full-stack monitoring tool.
								</Typography>
							</div>{' '}
							<div className="text-start max-w-[300px]">
								<div className="aspect-square w-full border border-divider-on-dark rounded-md"></div>
								<h5 className="text-darker-copy-on-dark">
									Session Replay
								</h5>
								<Typography
									type="copy2"
									className="mt-6 text-darker-copy-on-dark"
								>
									Monitor your app more efficiently by
									bringing your developers together in
									Highlight&apos;s full-stack monitoring tool.
								</Typography>
							</div>{' '}
							<div className="text-start max-w-[300px]">
								<div className="aspect-square w-full border border-divider-on-dark rounded-md"></div>
								<h5 className="text-darker-copy-on-dark">
									Logging
								</h5>
								<Typography
									type="copy2"
									className="mt-6 text-darker-copy-on-dark"
								>
									Monitor your app more efficiently by
									bringing your developers together in
									Highlight&apos;s full-stack monitoring tool.
								</Typography>
							</div>{' '}
						</div>
					</div>
				</Section>
				<FooterCallToAction buttonLink="https://8fonvna4lyz.typeform.com/to/K0WXGewT#email=xxxxx" />
			</main>
			<Footer />
		</div>
	)
}

export default StartupsPage
