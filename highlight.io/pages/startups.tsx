import { useState } from 'react'
import { PrimaryButton } from '../components/common/Buttons/PrimaryButton'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import Navbar from '../components/common/Navbar/Navbar'
import { Section } from '../components/common/Section/Section'
import { Typography } from '../components/common/Typography/Typography'
import { CompaniesReel } from '../components/Home/CompaniesReel/CompaniesReel'
import { CustomerReviewTrack } from '../components/Home/CustomerReviewTrack'

const StartupsPage = () => {
	const [email, setEmail] = useState<string>('')

	return (
		<div>
			<Navbar />
			<main>
				<Section>
					<div className="flex flex-col lg:flex-row w-full justify-between">
						<div className="flex flex-col gap-4 lg:w-1/2">
							<Typography type="copy3" emphasis>
								Highlight for Startups
							</Typography>
							<h2 className="m-0">
								One app for all your{' '}
								<span className="text-color-selected-light">
									app monitoring
								</span>{' '}
								needs.
							</h2>
							<Typography
								type="copy1"
								className="text-darker-copy-on-dark"
							>
								Monitor your app more efficiently by bringing
								your developers together in Highlight&apos;s
								full-stack monitoring tool.
							</Typography>
							<div className="flex items-center flex-grow gap-1 p-2 mt-4 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light">
								<input
									type="text"
									placeholder={'Enter your email'}
									value={email}
									onChange={(ev) =>
										setEmail(ev.currentTarget.value)
									}
									className={
										'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] w-0'
									}
								/>
								<PrimaryButton
									href={`https://vfyijuriede.typeform.com/to/Sq220glZ#email=${
										email || 'xxxxx'
									}`}
									className="bg-white hover:bg-opacity-70 rounded-lg"
									target="_blank"
								>
									Get Started
								</PrimaryButton>
							</div>
							<Typography
								type="copy4"
								className="text-darker-copy-on-dark"
							>
								Maybe some subtext needed here?
							</Typography>
						</div>

						<div className="hidden lg:flex h-full w-1/3 pr-8 border-[1px] rounded-md"></div>
					</div>
				</Section>

				<Section>
					<CompaniesReel />
				</Section>
				<Section>
					<div className="flex flex-col items-center text-center w-full">
						<h3>See how startups use Highlight</h3>
						<div className="flex justify-center ">
							<Typography
								type="copy1"
								className="max-w-[800px] mt-4"
							>
								Monitor your app more efficiently by bringing
								your developers together in Highlight&apos;s
								full-stack monitoring tool.
							</Typography>
						</div>

						<div className="flex w-full items-center justify-center max-w-[800px] flex-grow gap-1 p-2 mt-8 transition-colors border rounded-lg text-copy-on-dark border-divider-on-dark focus-within:border-copy-on-light">
							<input
								type="text"
								placeholder={'Enter your email'}
								value={email}
								onChange={(ev) =>
									setEmail(ev.currentTarget.value)
								}
								className={
									'h-full flex-1 leading-none bg-transparent outline-none text-copy-on-dark text-[17px] w-0'
								}
							/>
							<PrimaryButton
								href={`https://vfyijuriede.typeform.com/to/Sq220glZ#email=${
									email || 'xxxxx'
								}`}
								target="_blank"
								className="bg-white hover:bg-opacity-70 rounded-lg"
							>
								Get Started
							</PrimaryButton>
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

export default StartupsPage
