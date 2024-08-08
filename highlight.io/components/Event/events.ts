export type Event = {
	title: string
	description: string
	date: string
	slug: string
	image?: string
}

export const EVENTS: { [k: string]: Event } = {
	'tracing-in-next': {
		title: 'Tracing in Next.js',
		description:
			'Learn about how you can get tracing working in your Next application with several microservices.',
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
