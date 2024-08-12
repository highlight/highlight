import { RichText } from '@graphcms/rich-text-react-renderer'
import { gql } from 'graphql-request'
import Image from 'next/legacy/image'
import Link from 'next/link'
import { GetStaticPaths, GetStaticProps } from 'next/types'
import { Author } from '../../components/Blog/BlogPost/BlogPost'
import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import { Meta } from '../../components/common/Head/Meta'
import Navbar from '../../components/common/Navbar/Navbar'
import { Typography } from '../../components/common/Typography/Typography'
import { CustomerQuote } from '../../components/Customers/CustomerQuote/CustomerQuote'
import style from '../../components/Customers/Customers.module.scss'
import ReturnIcon from '../../public/images/ReturnIcon'
import { GraphQLRequest } from '../../utils/graphql'

interface Customer {
	id: string
	slug: string
	image?: {
		url: string
	}
	companyLogo?: {
		url: string
	}
	name: string
	about: string
	founded: string
	usingHighlightSince: string
	caseStudy: {
		markdown: string
		raw: { children: any[] }
		references: {
			id: string
			body: string
			author: Author
		}[]
	}
	quote: {
		id: string
		body: string
		author: Author
	}
	primaryQuote: {
		id: string
		body: string
		author: Author
	}
}

type Case = { slug: string; companyLogo?: { url: string } } | null

export const getStaticPaths: GetStaticPaths = async () => {
	const QUERY = gql`
		{
			customers {
				slug
			}
		}
	`
	const { customers } = await GraphQLRequest<{ customers: Customer[] }>(QUERY)

	return {
		paths: customers.map((p: { slug: string }) => ({
			params: { slug: p.slug },
		})),
		fallback: 'blocking',
	}
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const slug = params?.slug as string

	const QUERY = gql`
		query GetCustomer($slug: String!) {
			customer(where: { slug: $slug }) {
				id
				slug
				about
				founded
				usingHighlightSince
				image {
					url
				}
				companyLogo {
					url
				}
				name
				caseStudy {
					raw
					markdown
					references {
						... on Quote {
							id
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
					}
				}
				primaryQuote {
					body
					author {
						firstName
						lastName
						title
						twitterLink
						linkedInLink
						githubLink
						personalWebsiteLink
						profilePhoto {
							url
						}
					}
				}
			}
		}
	`

	const data = await GraphQLRequest<{ customer: Customer }>(QUERY, {
		slug: slug,
	})

	// Handle event slugs which don't exist in our CMS
	if (!data.customer) {
		return {
			notFound: true,
		}
	}

	// Pagination
	const PAGES_QUERY = gql`
		query GetPages($id: String!) {
			previousCase: customers(last: 1, before: $id) {
				slug
				companyLogo {
					url
				}
			}
			nextCase: customers(first: 1, after: $id) {
				slug
				companyLogo {
					url
				}
			}
		}
	`

	const pageData = await GraphQLRequest<{
		previousCase: Case[]
		nextCase: Case[]
	}>(PAGES_QUERY, {
		id: data.customer.id,
	})

	return {
		props: {
			customer: data.customer,
			previousCase: pageData.previousCase.shift() ?? null,
			nextCase: pageData.nextCase.shift() ?? null,
		},
		revalidate: 60 * 60, // Cache response for 1 hour (60 seconds * 60 minutes)
	}
}

const CustomerPage = ({
	customer,
	previousCase,
	nextCase,
}: {
	customer: Customer
	previousCase: { slug: string; companyLogo?: { url: string } } | null
	nextCase: { slug: string; companyLogo?: { url: string } } | null
}) => {
	let markdown = customer.caseStudy.markdown
	const titleRegex = /^#\s+(.+)/

	// Extract the title
	const match = markdown.match(titleRegex)
	const title = match
		? match[1]
		: 'Learn how different companies use Highlight'

	const params = new URLSearchParams()
	params.set('title', title)
	params.set('fname', customer.primaryQuote.author.firstName)
	params.set('lname', customer.primaryQuote.author.lastName)
	params.set('role', customer.primaryQuote.author.title)

	const metaImageURL = `https://${
		process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
	}/api/og/customer/${customer.slug}?${params.toString()}`

	return (
		<>
			<Meta
				title={title}
				description={'Learn how different companies use Highlight'}
				absoluteImageUrl={metaImageURL}
				canonical={`/customers/${customer.slug}`}
			/>
			<Navbar />
			<main>
				<div className={style.detailsLayout}>
					<div className={style.caseBackLink}>
						<Link href="/customers">
							<ReturnIcon />
							All customers
						</Link>
					</div>
					<div className={style.caseContent}>
						<div className={style.caseTitle}>
							<span className={style.caseOverline}>
								Customer Case Study
							</span>
						</div>
						<RichText
							content={customer.caseStudy.raw}
							references={customer.caseStudy.references}
							renderers={{
								embed: {
									Quote(props) {
										const { id, body, author } =
											props as Customer['quote']
										return (
											<CustomerQuote
												key={id}
												content={body}
												author={`${author.firstName} ${author.lastName}`}
												role={author.title}
												authorAvatar={
													author.profilePhoto?.url ||
													''
												}
											/>
										)
									},
								},
							}}
						/>

						<div className={style.casePageLinks}>
							{previousCase ? (
								<PageLink
									label="Previous Customer"
									slug={previousCase.slug}
									logo={previousCase.companyLogo?.url}
								/>
							) : (
								<div />
							)}
							{nextCase && (
								<PageLink
									label="Next Customer"
									slug={nextCase.slug}
									logo={nextCase.companyLogo?.url}
								/>
							)}
						</div>
					</div>
					<div className={style.caseCustomerDetails}>
						<div className={style.caseDetailsLogo}>
							{customer.companyLogo?.url && (
								<Image
									src={customer.companyLogo.url}
									layout="fill"
									objectFit="contain"
									objectPosition="left"
									alt="Company Logo"
								/>
							)}
						</div>
						<div className={style.caseDetailsBody}>
							<CustomerDetailsSection
								label="About the company"
								body={customer.about}
							/>
							<CustomerDetailsSection
								label="Founded"
								body={new Date(customer.founded)
									.getFullYear()
									.toString()}
							/>
							<CustomerDetailsSection
								label="Using Highlight since"
								body={new Date(
									customer.usingHighlightSince,
								).toLocaleDateString(undefined, {
									month: 'short',
									year: 'numeric',
								})}
							/>
						</div>
					</div>
				</div>
			</main>
			<FooterCallToAction />
			<Footer />
		</>
	)
}

const PageLink = ({
	label,
	slug,
	logo,
}: {
	label: string
	slug: string
	logo?: string
}) => (
	<Link href={`/customers/${slug}`}>
		<div className={style.casePageLink}>
			<Typography type="copy2" emphasis>
				{label}
			</Typography>
			{logo && (
				<Image
					src={logo}
					width={187}
					height={32}
					objectFit="contain"
					objectPosition="left"
					alt={`${slug} logo`}
				/>
			)}
		</div>
	</Link>
)

const CustomerDetailsSection = ({
	label,
	body,
}: {
	label: string
	body: string
}) => (
	<div className={style.caseDetailsBlock}>
		<Typography type="copy3" emphasis>
			{label}
		</Typography>
		<Typography type="copy3">
			<span className={style.caseDetailsSecitonText}>{body}</span>
		</Typography>
	</div>
)

export default CustomerPage
