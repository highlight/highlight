import Navbar from '../../components/common/Navbar/Navbar'

import classNames from 'classnames'
import Link from 'next/link'
import { FaPlay } from 'react-icons/fa'
import { MdKeyboardReturn } from 'react-icons/md'
import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import { Typography } from '../../components/common/Typography/Typography'
import homeStyles from '../../components/Home/Home.module.scss'
import { Webinar, WEBINARS } from '../../components/Webinar/webinar'

import { GetStaticPaths, GetStaticProps } from 'next'

import Footer from '../../components/common/Footer/Footer'

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: Object.keys(WEBINARS).map((k: string) => ({
			params: { slug: k },
		})),
		fallback: 'blocking',
	}
}

//Gets list of products from products.ts
export const getStaticProps: GetStaticProps = async ({ params }) => {
	const slug = params?.slug as string

	// Handle event slugs which don't exist
	if (!WEBINARS[slug]) {
		return {
			notFound: true,
		}
	}

	return {
		props: {
			webinar: WEBINARS[slug],
		},
	}
}

const Webinars = ({ webinar }: { webinar: Webinar }) => {
	return (
		<div>
			<Navbar />
			<div className="hidden my-2 ml-10 md:flex">
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
				<div className="flex flex-col xl:flex-row justify-between w-screen px-8 lg:px-4 lg:py-28 ">
					<div className="flex justify-center mt-10 ml-8">
						<div className="flex flex-col max-w-4xl gap-8 text-center lg:text-left">
							<h2 className="text-white">{webinar.title}</h2>
							<Typography
								type="copy1"
								className="text-copy-on-dark"
							>
								{webinar.description}
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
								<PrimaryButton
									href={'https://app.highlight.io/demo'}
									className={classNames(
										homeStyles.hollowButton,
									)}
								>
									<div className="flex items-center gap-2">
										<FaPlay />
										<Typography
											type="copy2"
											emphasis={true}
										>
											Live demo
										</Typography>
									</div>
								</PrimaryButton>
							</div>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	)
}

export default Webinars
