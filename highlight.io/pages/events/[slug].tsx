import Navbar from '../../components/common/Navbar/Navbar'

import classNames from 'classnames'
import Link from 'next/link'
import { MdKeyboardReturn } from 'react-icons/md'
import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import { Typography } from '../../components/common/Typography/Typography'
import { EventForm } from '../../components/Event/EventForm'
import { Event, EVENTS } from '../../components/Event/events'
import homeStyles from '../../components/Home/Home.module.scss'

import { GetStaticPaths, GetStaticProps } from 'next'

import Footer from '../../components/common/Footer/Footer'

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: Object.keys(EVENTS).map((k: string) => ({
			params: { slug: k },
		})),
		fallback: 'blocking',
	}
}

//Gets list of products from products.ts
export const getStaticProps: GetStaticProps = async ({ params }) => {
	const slug = params?.slug as string

	// Handle event slugs which don't exist
	if (!EVENTS[slug]) {
		return {
			notFound: true,
		}
	}

	return {
		props: {
			event: EVENTS[slug],
		},
	}
}

const Events = ({ event }: { event: Event }) => {
	return (
		<div>
			<Navbar />
			<div className="hidden my-2 ml-10 md:flex">
				<Link href="/">
					<Typography type="copy3" emphasis={true}>
						<div className="flex items-center justify-start gap-2">
							<MdKeyboardReturn className="h-5" />
							Explore highlight.io
						</div>
					</Typography>
				</Link>
			</div>
			<main>
				<div className="flex flex-col lg:flex-row justify-between items-center w-screen px-8 mt-8 gap-8 mx-auto lg:px-4 lg:py-28 max-w-[1200px] 2xl:max-w-[1400px]">
					<div className="flex justify-center lg:w-1/2">
						<div className="flex flex-col max-w-4xl gap-8 text-center lg:text-left">
							<h2 className="text-white">{event.title}</h2>
							<Typography
								type="copy1"
								className="text-copy-on-dark"
							>
								{event.description}
							</Typography>
							<div className="flex flex-col justify-start w-full gap-4 lg:flex-row lg:w-auto">
								<PrimaryButton
									className={classNames(
										homeStyles.solidButton,
										'min-w-[180px]',
									)}
									href="https://app.highlight.io/?sign_up=1"
								>
									<Typography type="copy2" emphasis={true}>
										Get started
									</Typography>
								</PrimaryButton>
							</div>
						</div>
					</div>
					<div className="w-full lg:w-1/3">
						<EventForm />
					</div>
				</div>
			</main>
			<Footer />
		</div>
	)
}

export default Events
