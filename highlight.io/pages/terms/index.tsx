import { FooterCallToAction } from '../../components/common/CallToAction/FooterCallToAction'
import Footer from '../../components/common/Footer/Footer'
import { Meta } from '../../components/common/Head/Meta'
import Navbar from '../../components/common/Navbar/Navbar'
import { Section } from '../../components/common/Section/Section'

import fs from 'fs'
import path from 'path'
import { MarkdownRender } from '../../components/MarkdownRender/MarkdownRender'

export async function getStaticProps() {
	const fileContents = fs.readFileSync(
		path.join(process.cwd(), 'content', 'terms.md'),
	)
	return { props: { content: fileContents.toString() } }
}

const Terms = ({ content }: { content: string }) => {
	return (
		<>
			<Meta
				title={'Highlight: Terms of Service'}
				description={'Highlight Terms of Service'}
			/>
			<Navbar />
			<main>
				<Section>
					<MarkdownRender content={content} />
				</Section>

				<FooterCallToAction />
			</main>
			<Footer />
		</>
	)
}

export default Terms
