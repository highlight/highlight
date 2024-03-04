import Image from 'next/legacy/image'
import Link from 'next/link'
import styles from '../../components/Blog/Blog.module.scss'
import { OPEN_ROLES } from '../../components/Careers/careers'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import { Meta } from '../../components/common/Head/Meta'
import Navbar from '../../components/common/Navbar/Navbar'
import { Section } from '../../components/common/Section/Section'
import homeStyles from '../../components/Home/Home.module.scss'
import BlueGradient from '../../public/images/bg_blue_gradient.svg'
import PurpleGradient from '../../public/images/bg_purple_gradient.svg'

const Careers = () => {
	return (
		<>
			<Meta
				title="Careers At Highlight: Build The Best Debugging Tool Ever"
				description="We're building a platform for debugging apps with extremely high precision, with the goal of helping teams better understand how their app behaves. See careers:"
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
						<h1>Highlight is Hiring</h1>
						<p className={homeStyles.bodyLarge}>
							{`At Highlight, we're building a platform for debugging apps with extremely high precision, with the goal of helping teams better understand how their app behaves.`}
						</p>
					</div>
				</Section>
				<div className={styles.blogContainer}>
					{Object.values(OPEN_ROLES).map((role, i: number) => (
						<Link
							href={`/careers/${role.slug}`}
							key={i}
							passHref
							legacyBehavior
						>
							<div>{role.title}</div>
						</Link>
					))}
				</div>
				<FooterCallToAction />
			</main>
			<Footer />
		</>
	)
}

export default Careers
