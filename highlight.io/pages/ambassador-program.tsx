import { NextPage } from 'next'
import Head from 'next/head'
import { Typography } from '../components/common/Typography/Typography'
import { PrimaryButton } from '../components/common/Buttons/PrimaryButton'
import Navbar from '../components/common/Navbar/Navbar'
import Footer from '../components/common/Footer/Footer'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'

const AmbassadorProgram: NextPage = () => {
	return (
		<>
			<Head>
				<title>Highlight Ambassador Program</title>
				<meta
					name="description"
					content="Join the Highlight Ambassador Program and help spread the word about our open-source observability platform."
				/>
			</Head>
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<main className="flex-grow">
					<div className="mx-auto max-w-3xl px-4 md:px-8 mb-28">
						<section className="flex flex-col items-center py-8 gap-4 text-center">
							<h1 className="text-4xl md:text-5xl font-bold mb-4">
								The Highlight Ambassador Program
							</h1>

							<Typography type="copy1" className="mb-6">
								Join our community of enthusiasts and experts
								committed to spreading the word about our
								open-source observability platform.
							</Typography>

							<PrimaryButton
								href="https://share.hsforms.com/104ZqOWo7SCOfHsnmdj3f3Ac6tsk"
								className="text-lg w-[260px] py-3 text-center"
							>
								Apply Now
							</PrimaryButton>
						</section>

						<hr className="w-full h-px my-8 bg-gray-500 border-0 rounded" />

						<section className="mb-12 flex flex-col gap-2 py-8">
							<Typography
								type="copyHeader"
								className="text-2xl font-bold"
							>
								What You&apos;ll Do
							</Typography>

							<ul className="list-disc pl-5 space-y-2 text-xl">
								<li>
									Educate others about Highlight and
									OpenTelemetry
								</li>
								<li>
									Create content and participate in events
								</li>
								<li>
									Build relationships within the developer
									community
								</li>
								<li>
									Collaborate with the Highlight team on
									initiatives
								</li>
							</ul>
						</section>

						<section className="mb-12 flex flex-col gap-2">
							<Typography
								type="copyHeader"
								className="text-2xl font-bold"
							>
								Ambassador Perks
							</Typography>
							<ul className="list-disc pl-5 space-y-2 text-xl">
								<li>
									Exclusive access to early releases and beta
									features
								</li>
								<li>
									Official swag and recognition as a community
									leader
								</li>
								<li>Opportunities to feature your content</li>
								<li>Connect with like-minded developers</li>
								<li>
									Conference tickets for promoting Highlight
								</li>
							</ul>
						</section>

						<section className="flex flex-col gap-4">
							<Typography
								type="copyHeader"
								className="text-2xl font-bold"
							>
								Who Can Apply
							</Typography>

							<Typography type="copy1" className="text-xl">
								We&apos;re looking for developers, DevOps
								engineers, content creators, and anyone
								passionate about observability and the
								open-source community.
							</Typography>
							<Typography type="copy1" className="text-xl mb-4">
								Whether you&apos;re experienced or just
								starting, if you believe in Highlight&apos;s
								mission, we want to hear from you!
							</Typography>

							<PrimaryButton
								href="https://share.hsforms.com/104ZqOWo7SCOfHsnmdj3f3Ac6tsk"
								className="text-lg w-[260px] py-3 block mx-auto text-center"
							>
								Apply Now
							</PrimaryButton>
						</section>
					</div>

					<FooterCallToAction />
				</main>
				<Footer />
			</div>
		</>
	)
}

export default AmbassadorProgram
