import { Integration } from '../Integrations/integration'

export const FRAMEWORKS: {
	[key: string]: Integration[]
} = {
	Frameworks: [
		{
			name: 'React.js',
			description: 'Set up highlight.io with your React application.',
			link: '/docs/getting-started/client-sdk/reactjs',
			image: '/images/companies/icons/amplitude.png',
		},
		{
			name: 'Next.js',
			description: 'Set up highlight.io with your Next application.',
			link: '/docs/getting-started/client-sdk/nextjs',
			image: '/images/companies/icons/mixpanel.png',
		},
		{
			name: 'Vue.js',
			description: 'Set up highlight.io with your Vue application.',
			link: '/docs/getting-started/client-sdk/vuejs',
			image: '/images/companies/icons/segment.png',
		},
		{
			name: 'Angular',
			description: 'Set up highlight.io with your Angular application.',
			link: '/docs/getting-started/client-sdk/angular',
			image: '/images/companies/icons/segment.png',
		},
		{
			name: 'Gatsby.js',
			description: 'Set up highlight.io with your Gatsby application.',
			link: '/docs/getting-started/client-sdk/gatsbyjs',
			image: '/images/companies/icons/segment.png',
		},
		{
			name: 'SvelteKit',
			description: 'Set up highlight.io with your SvelteKit application.',
			link: '/docs/getting-started/client-sdk/sveltekit',
			image: '/images/companies/icons/segment.png',
		},
	],
	'Backend: Error Monitoring': [
		{
			name: 'Go',
			description:
				'Set up error monitoring in Go with Chi, Fiber, and more.',
			link: '/docs/getting-started/backend-sdk/go/overview',
			image: '/images/companies/icons/discord.png',
		},
		{
			name: 'Javascript',
			description:
				'Set up error monitoring in JS with Express, Node, and more.',
			link: '/docs/getting-started/backend-sdk/js/overview',
			image: '/images/companies/icons/front.png',
		},
		{
			name: 'Python',
			description:
				'Set up error monitoring in Python with Django, Flask, and more.',
			link: '/docs/getting-started/backend-sdk/python/overview',
			image: '/images/companies/icons/intercom.png',
		},
		{
			name: 'Ruby',
			description: 'Set up error monitoring in Ruby on Rails.',
			link: 'https://www.highlight.io/docs/getting-started/backend-sdk/ruby/overview',
			image: '/images/companies/icons/slack.png',
		},
	],
	'Backend: Logging': [
		{
			name: 'Go',
			description: 'Set up logging in Go with Fiber, Logrus, and more.',
			link: 'https://www.highlight.io/docs/getting-started/backend-logging/go/overview',
			image: '/images/companies/icons/discord.png',
		},
		{
			name: 'Javascript',
			description: 'Set up logging in JS with Nest, Winston, and more.',
			link: 'https://www.highlight.io/docs/getting-started/backend-logging/js/overview',
			image: '/images/companies/icons/front.png',
		},
		{
			name: 'Python',
			description: 'Set up logging in Python with Loguru.',
			link: 'https://www.highlight.io/docs/getting-started/backend-logging/python/overview',
			image: '/images/companies/icons/intercom.png',
		},
		{
			name: 'Ruby',
			description: 'Set up logging in Ruby on Rails.',
			link: 'https://www.highlight.io/docs/getting-started/backend-logging/ruby/overview',
			image: '/images/companies/icons/slack.png',
		},
	],
	Protocols: [
		{
			name: 'cURL',
			description: 'Set up highlight.io log ingestion over HTTPS.',
			link: '/docs/getting-started/backend-logging/http',
			image: '/images/companies/icons/vercel.png',
		},
		{
			name: 'File',
			description:
				'Set up log ingestion using an OpenTelemetry collector with the filelog receiver.',
			link: '/docs/getting-started/backend-logging/file',
			image: '/images/companies/icons/vercel.png',
		},
		{
			name: 'Fluent Forward',
			description:
				'Set up highlight.io log ingestion via Fluent Forward.',
			link: '/docs/getting-started/backend-logging/fluentforward',
			image: '/images/companies/icons/aws.png',
		},
	],
}
