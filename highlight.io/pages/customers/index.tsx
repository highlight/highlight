import { gql } from 'graphql-request'
import { GetStaticProps } from 'next'
import Image from 'next/legacy/image'
import { useState } from 'react'
import { AnimateFadeIn } from '../../components/Animate'
import { Author } from '../../components/Blog/BlogPost/BlogPost'
import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import Navbar from '../../components/common/Navbar/Navbar'
import { Typography } from '../../components/common/Typography/Typography'
import styles from '../../components/Customers/CustomersList.module.scss'
import { GraphQLRequest } from '../../utils/graphql'

interface Customer {
	slug: string
	image?: {
		url: string
	}
	companyLogo?: {
		url: string
	}
	primaryQuote: {
		id: string
		body: string
		author: Author
	}
	hidden: boolean
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	// Hides the page in production and renders it in dev. More info:
	// https://linear.app/highlight/issue/HIG-2510/temporarily-update-customers-functionality
	// if (process.env.NODE_ENV === 'production') {
	//   return { notFound: true };
	// }

	const QUERY = gql`
      query GetCustomers() {
          customers(where: { hidden: false }, orderBy: createdAt_DESC) {
              slug
              image {
                  url
              }
              companyLogo {
                  url
              }
              primaryQuote {
                  body
                  author {
                      firstName
                      lastName
                      title
                      profilePhoto {
                          url
                      }
                  }
              }
              hidden
          }
      }
  `

	const data = await GraphQLRequest<{ customers: Customer[] }>(QUERY)

	return {
		props: {
			customers: data.customers,
		},
		revalidate: 60 * 60, // Cache response for 1 hour (60 seconds * 60 minutes)
	}
}

const Customers = ({ customers }: { customers: Customer[] }) => {
	const expandedCustomers = customers.slice(0, 6)
	const allCustomersLogos = [
		'pipe',
		'portal',
		'dripos',
		'knock',
		'hightouch',
		'basedash',
		'impira',
		'mage',
		'airplane',
		'examedi',
		'guruhotel',
		'hotplate',
		'writesonic',
		'tributi',
		'superpowered',
		'sunsama',
		'cabal',
	]

	return (
		<>
			<Navbar />
			<main>
				<div className={styles.caseListLayout}>
					<div className={styles.caseListTitle}>
						<h1>
							What{' '}
							<span className={styles.limeAccent}>
								our customers
							</span>{' '}
							have to say.
						</h1>
						<PrimaryButton>Get started for free</PrimaryButton>
					</div>
					<div className={styles.caseList}>
						{expandedCustomers.map((c) => (
							<CustomerCaseCard
								logo={c.companyLogo?.url}
								author={`${c.primaryQuote.author.firstName} ${c.primaryQuote.author.lastName}`}
								quote={c.primaryQuote.body}
								role={c.primaryQuote.author.title}
								slug={c.slug}
								thumbnail={c.image?.url ?? ''}
								key={c.slug}
							/>
						))}
					</div>
					<h2>See all our customers</h2>
					<div className={styles.allCustomersGrid}>
						{allCustomersLogos.map((name, i) => (
							<CompanyLogo name={name} key={i} />
						))}
					</div>
				</div>
				<FooterCallToAction />
			</main>
			<Footer />
		</>
	)
}

const CompanyLogo = ({ name }: { name: string }) => {
	return (
		<div className={styles.allCustomersLogo}>
			<Image
				src={`/images/companies/white-logos/${name}.png`}
				alt={`${name} logo`}
				layout="fill"
				objectFit="contain"
			/>
		</div>
	)
}

const CustomerCaseCard = ({
	thumbnail,
	logo,
	quote,
	author,
	role,
	slug,
}: {
	thumbnail: string
	logo?: string
	quote: string
	author: string
	role: string
	slug: string
}) => {
	const [loaded, setLoaded] = useState(false)

	return (
		<div className={styles.caseCard}>
			<div className={styles.thumbnail}>
				<AnimateFadeIn loaded={loaded}>
					<Image
						src={thumbnail}
						layout="fill"
						objectFit="cover"
						alt="Case thumbnail"
						onLoadingComplete={() => setLoaded(true)}
						priority
					/>
				</AnimateFadeIn>
			</div>
			<div className={styles.caseDetails}>
				<div>
					{logo && (
						<div className={styles.companyCaseLogo}>
							<Image
								src={logo}
								alt="Company logo"
								layout="fill"
								objectFit="contain"
								objectPosition="left"
							/>
						</div>
					)}
					<div className={styles.caseCardQuote}>
						<blockquote>
							<h4 className={styles.leftQuote}>“</h4>
							<Typography type="copy2" onDark>
								{quote}
							</Typography>
							<h4 className={styles.rightQuote}>”</h4>
						</blockquote>
						<span>
							<Typography type="copy2" emphasis>
								{author},
							</Typography>{' '}
							<Typography type="copy2">{role}</Typography>
						</span>
					</div>
				</div>
				<PrimaryButton
					href={`/customers/${slug}`}
					className={styles.cardReadCaseButton}
				>
					Read case study
				</PrimaryButton>
			</div>
		</div>
	)
}

export default Customers
