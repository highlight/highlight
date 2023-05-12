import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import Navbar from '../components/common/Navbar/Navbar'
import { Typography } from '../components/common/Typography/Typography'

export default function DemoConfirmation() {
	return (
		<>
			<Navbar />
			<main>
				<div className="gap-4 mx-auto m-36 max-w-max">
					<div className="flex flex-col items-center gap-4">
						<Typography type="copy1">
							Thank you for scheduling a demo. See you soon!
						</Typography>
					</div>
				</div>
				<FooterCallToAction />
			</main>
			<Footer />
		</>
	)
}
