import Link from 'next/link'
import { useState } from 'react'
import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import Navbar from '../components/common/Navbar/Navbar'
import { Section } from '../components/common/Section/Section'
import { Typography } from '../components/common/Typography/Typography'
import { CompaniesReel } from '../components/Home/CompaniesReel/CompaniesReel'
import { CustomerReviewTrack } from '../components/Home/CustomerReviewTrack'
import styles from '../components/Home/Home.module.scss'
import { INTEGRATIONS } from '../components/Integrations/integration'
import IntegrationCard from '../components/Integrations/IntegrationCard'
import WideCard from '../components/Integrations/WideCard'

const IntegrationsPage = () => {
	const [copy, setCopy] = useState(false)

	function handleCopy(str: string) {
		navigator.clipboard.writeText(
			'https://highlight.io/integrations#' + str,
		)

		setCopy(true)
		setTimeout(() => {
			setCopy(false)
		}, 1000)
	}

	return (
		<div>
			<Navbar />
			<main>
				<div className="flex flex-col gap-2 mt-20 text-center px-8">
					<h2>
						Find the{' '}
						<span className="text-color-selected-light">
							integration
						</span>{' '}
						you need.
					</h2>
					<Typography type="copy1" className="text-copy-on-dark">
						Use your favorite tools with highlight.io.
					</Typography>
				</div>
				<div className="my-12 mx-auto max-w-[1250px] px-8">
					{Object.entries(INTEGRATIONS).map(([category, items]) => (
						<div
							className="pt-12"
							key={category}
							id={category.toLowerCase()}
						>
							<div
								onClick={() =>
									handleCopy(category.toLowerCase())
								}
								className="group flex items-center gap-2 cursor-pointer"
							>
								<Typography type="copy1" emphasis>
									{category}
								</Typography>
								{!copy && (
									<AiOutlineLink className="text-copy-on-light h-5 w-5 invisible group-hover:visible" />
								)}
								{copy && (
									<AiFillCheckCircle className="text-copy-on-light h-5 w-5 invisible group-hover:visible" />
								)}
							</div>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-5 mx-auto">
								{items.map((item) => (
									<IntegrationCard
										key={item.name}
										name={item.name}
										image={item.image || ''}
										description={item.description}
										link={item.link}
									/>
								))}
							</div>
						</div>
					))}
					<div className="mt-16">
						<WideCard
							title="Are we missing anything?"
							desc="Reach out if you want support for another integration!"
							primaryLink="https://discord.gg/yxaXEAqgwN"
							primaryLinkText="Get in Touch"
						/>
					</div>
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

export default IntegrationsPage
