import React from 'react'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import Navbar from '../components/common/Navbar/Navbar'
import { Typography } from '../components/common/Typography/Typography'

export default function HighlightDemo() {
	const [query, setQuery] = React.useState<string>()
	const [result, setResult] = React.useState<string>()
	const [loading, setLoading] = React.useState<boolean>(false)
	return (
		<>
			<Navbar />
			<main>
				<div className="m-36 gap-4 max-w-max mx-auto">
					<div className="flex items-center flex-col gap-8">
						<Typography type="copy1">
							Search for docs to generate some logs
						</Typography>
						<input
							className="bg-blue-cta text-black px-3 py-1 rounded-lg"
							onChange={(e) => {
								console.log('set query', {
									value: e.target.value,
								})
								setQuery(e.target.value)
							}}
						/>
						<button
							className="bg-blue-cta text-black px-3 py-1 rounded-lg"
							onClick={async () => {
								setLoading(true)
								try {
									const r = await fetch(
										`/api/docs/search/${query}`,
									)
									const results = (await r.json()) as any[]
									if (results.length) {
										setResult(results[0]['title'])
									}
								} finally {
									setLoading(false)
								}
							}}
						>
							<Typography type="copy3" emphasis={true}>
								Query Docs
							</Typography>
						</button>
						{result && (
							<div>
								<Typography type="copy1">{result}</Typography>
							</div>
						)}
					</div>
				</div>
				<FooterCallToAction />
			</main>
			<Footer />
		</>
	)
}
