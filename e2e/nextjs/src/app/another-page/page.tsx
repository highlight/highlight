import logger from '@/highlight.logger'
import Link from 'next/link'

export default function AnotherPage() {
	logger.info({}, `another page!`)
	return (
		<div>
			<h1>Another page</h1>
			<Link href="/">Go To Your Home</Link>
		</div>
	)
}
