import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import Navbar from '../components/common/Navbar/Navbar'
import { Typography } from '../components/common/Typography/Typography'
import { INTEGRATIONS } from '../components/Integrations/integration'
import IntegrationCard from '../components/Integrations/IntegrationCard'

const IntegrationsPage = () => {
	return (
		<div>
			<Navbar />
			<main>
				<div className="flex flex-col gap-2 mt-20 text-center">
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
				<div className="my-24 mx-auto max-w-[1250px] px-8">
					{Object.entries(INTEGRATIONS).map(([category, items]) => (
						<div className="my-12" key={category}>
							<Typography type="copy1" emphasis>
								{category}
							</Typography>
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
				</div>
				<FooterCallToAction />
			</main>
			<Footer />
		</div>
	)
}

export default IntegrationsPage
