import { Integration } from '../Integrations/integration'

export const FRAMEWORKS: {
	[key: string]: Integration[]
} = {
	Frameworks: [
		{
			name: 'React.js',
			description: 'Set up highlight.io with your React application.',
			link: '/docs/getting-started/client-sdk/reactjs',
			image: '/images/companies/icons/react.svg',
		},
		{
			name: 'Next.js',
			description: 'Set up highlight.io with your Next application.',
			link: '/docs/getting-started/client-sdk/nextjs',
			image: '/images/companies/icons/nextjs.svg',
		},
		{
			name: 'Remix',
			description: 'Set up highlight.io with your Remix application.',
			link: '/docs/getting-started/client-sdk/remix',
			image: '/images/companies/icons/remix.png',
		},
		{
			name: 'Vue.js',
			description: 'Set up highlight.io with your Vue application.',
			link: '/docs/getting-started/client-sdk/vuejs',
			image: '/images/companies/icons/vuejs.svg',
		},
		{
			name: 'Angular',
			description: 'Set up highlight.io with your Angular application.',
			link: '/docs/getting-started/client-sdk/angular',
			image: '/images/companies/icons/angularjs.svg',
		},
		{
			name: 'Gatsby.js',
			description: 'Set up highlight.io with your Gatsby application.',
			link: '/docs/getting-started/client-sdk/gatsbyjs',
			image: '/images/companies/icons/gatsby.svg',
		},
		{
			name: 'SvelteKit',
			description: 'Set up highlight.io with your SvelteKit application.',
			link: '/docs/getting-started/client-sdk/sveltekit',
			image: '/images/companies/icons/sveltekit.svg',
		},
	],
	'Error Monitoring': [
		{
			name: 'Go',
			description:
				'Set up error monitoring in Go with Chi, Fiber, and more.',
			link: '/docs/getting-started/backend-sdk/go/overview',
			image: '/images/companies/icons/go.svg',
		},
		{
			name: 'Javascript',
			description:
				'Set up error monitoring in JS with Express, Node, and more.',
			link: '/docs/getting-started/backend-sdk/js/overview',
			image: '/images/companies/icons/js.svg',
		},
		{
			name: 'Python',
			description:
				'Set up error monitoring in Python with Django, Flask, and more.',
			link: '/docs/getting-started/backend-sdk/python/overview',
			image: '/images/companies/icons/python.svg',
		},
		{
			name: 'Ruby',
			description: 'Set up error monitoring in Ruby on Rails.',
			link: '/docs/getting-started/backend-sdk/ruby/overview',
			image: '/images/companies/icons/rails.svg',
		},
		{
			name: 'Rust',
			description: 'Set up error monitoring in Rust.',
			link: '/docs/getting-started/backend-sdk/rust/overview',
			image: '/images/companies/icons/rust.svg',
		},
	],
	Logging: [
		{
			name: 'Go',
			description: 'Set up logging in Go with Fiber, Logrus, and more.',
			link: '/docs/getting-started/backend-logging/go/overview',
			image: '/images/companies/icons/go.svg',
		},
		{
			name: 'Javascript',
			description: 'Set up logging in JS with Nest, Winston, and more.',
			link: '/docs/getting-started/backend-logging/js/overview',
			image: '/images/companies/icons/js.svg',
		},
		{
			name: 'Python',
			description: 'Set up logging in Python with Loguru.',
			link: '/docs/getting-started/backend-logging/python/overview',
			image: '/images/companies/icons/python.svg',
		},
		{
			name: 'Ruby',
			description: 'Set up logging in Ruby on Rails.',
			link: '/docs/getting-started/backend-logging/ruby/overview',
			image: '/images/companies/icons/rails.svg',
		},
		{
			name: 'Rust',
			description: 'Set up logging in Rust.',
			link: '/docs/getting-started/backend-logging/rust/overview',
			image: '/images/companies/icons/rust.svg',
		},
	],
	Protocols: [
		{
			name: 'cURL',
			description: 'Set up highlight.io log ingestion over HTTPS.',
			link: '/docs/getting-started/backend-logging/http',
			image: '/images/companies/icons/curl.svg',
		},
		{
			name: 'File',
			description:
				'Set up log ingestion using an OpenTelemetry collector with the filelog receiver.',
			link: '/docs/getting-started/backend-logging/file',
			image: '/images/companies/icons/file.svg',
		},
		{
			name: 'Fluent Forward',
			description:
				'Set up highlight.io log ingestion via Fluent Forward.',
			link: '/docs/getting-started/backend-logging/fluentforward',
			image: '/images/companies/icons/fluent.svg',
		},
	],
}
