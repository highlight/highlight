import Image from 'next/legacy/image'
import BlueGradient from '../../public/images/bg_blue_gradient.svg'
import PurpleGradient from '../../public/images/bg_purple_gradient.svg'
import homeStyles from '../../components/Home/Home.module.scss'
import styles from '../../components/Blog/Blog.module.scss'
import Navbar from '../../components/common/Navbar/Navbar'
import { Section } from '../../components/common/Section/Section'
import Footer from '../../components/common/Footer/Footer'
import { gql } from 'graphql-request'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import { useEffect, useState } from 'react'
import Paginate from '../../components/common/Paginate/Paginate'
import {
	ChangelogEntry,
	Entry,
} from '../../components/Changelog/ChangelogEntry/ChangelogEntry'
import { GetStaticProps } from 'next/types'
import { Meta } from '../../components/common/Head/Meta'
import { GraphQLRequest } from '../../utils/graphql'

const ITEMS_PER_PAGE = 25

export const getStaticProps: GetStaticProps = async () => {
	const QUERY = gql`
		query GetChangelogs {
			changelogs(orderBy: createdAt_DESC) {
				slug
				title
				createdAt
				content
			}
		}
	`

	// @ts-ignore
	const { changelogs } = await GraphQLRequest(QUERY)

	return {
		props: {
			changelogs,
		},
	}
}

const Changelog = ({ changelogs }: { changelogs: Array<never> }) => {
	const [currentItems, setCurrentItems] = useState([])
	const [pageCount] = useState(Math.ceil(changelogs.length / ITEMS_PER_PAGE))
	const [currentPage, setCurrentPage] = useState(1)

	useEffect(() => {
		setCurrentItems(
			changelogs.slice(
				ITEMS_PER_PAGE * (currentPage - 1),
				Math.min(ITEMS_PER_PAGE * currentPage, changelogs.length),
			),
		)
	}, [currentPage, changelogs])

	return (
		<>
			<Meta
				title={'Highlight Changelog'}
				description={'Stop debugging in the dark.'}
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
						<h1>Changelog</h1>
					</div>
				</Section>
				<div className={styles.blogContainer}>
					{currentItems.map((p: Entry, i: number) => (
						<ChangelogEntry {...p} key={i} />
					))}
					<Paginate
						currentPage={currentPage}
						onPageChange={setCurrentPage}
						pageRangeDisplayed={5}
						pageCount={pageCount}
					/>
				</div>
				<FooterCallToAction />
			</main>
			<Footer />
		</>
	)
}

export default Changelog
