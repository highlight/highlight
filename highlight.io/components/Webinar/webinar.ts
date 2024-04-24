export type Webinar = {
	title: string
	description: string
	date: string
	slug: string
	image?: string
}

export const WEBINARS: { [k: string]: Webinar } = {
	'tracing-in-next': {
		title: 'Tracing in Next.js',
		description: 'This is the first event',
		date: '2021-01-01',
		slug: 'tracing-in-next',
		image: '/images/webinars/tracing-in-next.png',
	},
	'tracing-in-react': {
		title: 'Webinar 2',
		description: 'This is the second webinar',
		date: '2021-01-01',
		slug: 'tracing-in-react',
		image: '/images/webinars/tracing-in-next.png',
	},
}
