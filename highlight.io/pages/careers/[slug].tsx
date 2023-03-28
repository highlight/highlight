import Image from 'next/legacy/image'
import BlueGradient from '../../public/images/bg_blue_gradient.svg'
import PurpleGradient from '../../public/images/bg_purple_gradient.svg'
import homeStyles from '../../components/Home/Home.module.scss'
import styles from '../../components/Blog/Blog.module.scss'
import Navbar from '../../components/common/Navbar/Navbar'
import { Section } from '../../components/common/Section/Section'
import Footer from '../../components/common/Footer/Footer'
import classNames from 'classnames'
import { GetStaticPaths, GetStaticProps } from 'next/types'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import { OPEN_ROLES } from '../../components/Careers/careers'
import ReactMarkdown from 'react-markdown'
import { Meta } from '../../components/common/Head/Meta'

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: Object.keys(OPEN_ROLES).map((k: string) => ({
			params: { slug: k },
		})),
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const slug = params?.slug as string

	// Handle event slugs which don't exist
	if (!OPEN_ROLES[slug]) {
		return {
			notFound: true,
		}
	}

	return {
		props: {
			role: OPEN_ROLES[slug],
		},
	}
}

const CareerPage = ({ role }: { role: any }) => {
	return (
		<>
			<Meta
				title="Highlight Careers: Joining the Team"
				description="Stop debugging in the dark. Join the team that makes it happen!"
			/>
			<div className={homeStyles.bgPosition}>
				<div className={homeStyles.purpleDiv}>
					<Image src={PurpleGradient} alt="" />
				</div>
				<div className={homeStyles.blueDiv}>
					<Image src={BlueGradient} alt="" />
				</div>
			</div>
			<Navbar />
			<main>
				<Section>
					<div className={homeStyles.anchorTitle}>
						<h1>{role.title}</h1>
					</div>
				</Section>
				<Section>
					<div
						className={classNames(
							homeStyles.anchorTitle,
							styles.postBody,
						)}
					>
						<ReactMarkdown>{role.content}</ReactMarkdown>
					</div>
				</Section>
				<FooterCallToAction />
			</main>
			<Footer />
		</>
	)
}

export default CareerPage
