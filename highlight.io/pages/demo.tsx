import Navbar from '../components/common/Navbar/Navbar'
import { FooterCallToAction } from '../components/common/CallToAction/FooterCallToAction'
import Footer from '../components/common/Footer/Footer'
import React from 'react'
import { Typography } from '../components/common/Typography/Typography'
import { Button, Input } from 'antd'

export default function Highlight404() {
	const [query, setQuery] = React.useState<string>()
	const [result, setResult] = React.useState<string>()
	const [loading, setLoading] = React.useState<boolean>(false)
	return (
		<>
			<Navbar />
			<main>
				<div className="m-36 gap-4 max-w-max mx-auto">
					<div className="flex items-center flex-col gap-4">
						<Typography type="copy1">
							Try query our backend to generate some logs
						</Typography>
						<Input
							value={query}
							onChange={(e) => {
								console.log('vadim', { e })
								setQuery(e.target.value)
							}}
						/>
						<Button
							loading={loading}
							className="bg-blue-cta text-black px-3 py-1 rounded-lg"
							size={'small'}
							onClick={async () => {
								setLoading(true)
								try {
									const r = await fetch(
										`/api/docs/search/${query}`,
									)
									setResult(await r.text())
								} finally {
									setLoading(false)
								}
							}}
						>
							<Typography type="copy3" emphasis={true}>
								Query Sitemap
							</Typography>
						</Button>
					</div>
					{result && (
						<div>
							<Typography type="copy1">{result}</Typography>
						</div>
					)}
				</div>
				<FooterCallToAction />
			</main>
			<Footer />
		</>
	)
}
