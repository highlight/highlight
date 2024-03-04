import Link from 'next/link'
import logger from '@/highlight.logger'

export default function AnotherPage() {
	logger.info({}, `another page!`)
	return (
		<div>
			<h1>Another page</h1>
			<Link href="/">Go To Your Home</Link>
		</div>
	)
}
