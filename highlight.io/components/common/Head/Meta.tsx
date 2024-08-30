import Head from 'next/head'
import MetaImage from '../../../public/images/meta-image.jpg'

export const Meta = ({
	title,
	description,
	absoluteImageUrl,
	canonical,
}: {
	title: string
	description: string
	absoluteImageUrl?: string
	canonical?: string
}) => {
	const img =
		absoluteImageUrl ||
		`https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}${MetaImage.src}`
	return (
		<Head>
			<title>{title}</title>
			<meta name="description" content={description} key="description" />
			{/* Twitter */}
			<meta
				name="twitter:card"
				content="summary_large_image"
				key="twcard"
			/>
			<meta name="twitter:site" content="@highlightrun" key="twsite" />
			<meta
				name="twitter:creator"
				content="@highlightrun"
				key="twcreator"
			/>
			<meta name="twitter:image" content={img} key="twimage" />
			<meta name="twitter:title" content={title} key="twtitle" />
			{/* Open Graph */}
			<meta property="og:url" content="highlight.io" key="ogurl" />
			<meta property="og:type" content="website" key="ogtype" />
			<meta property="og:image" content={img} key="ogimage" />
			<meta
				property="og:site_name"
				content="Highlight"
				key="ogsitename"
			/>
			<meta property="og:title" content={title} key="ogtitle" />
			<meta
				property="og:description"
				content={description}
				key="ogdesc"
			/>
			{canonical && (
				<link
					rel="canonical"
					href={`https://www.highlight.io${canonical}`}
				/>
			)}
		</Head>
	)
}
