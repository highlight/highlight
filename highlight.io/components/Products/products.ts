//all products and snippets are defined below for the product page
//referenced in ProductDropdown and sitemap

export interface iProduct {
	type: string
	docsLink: string
	slug: string
	snippets: string[]
	title: string
	types?: string[]
}

//whitespace ensures that the two code blocks (front-end and back-end) are the same height.
const defaultFrontendSnippet: string = `

import React from 'react'
import { H } from 'highlight.run'
import { ErrorBoundary } from '@highlight-run/react'

H.init('<YOUR_PROJECT_ID>') // Get your project ID from https://app.highlight.io/setup

ReactDOM.render(
	<React.StrictMode>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</React.StrictMode>,
	document.getElementById('root'),
)
`

const htmlSnippet: string = `

<script src="https://unpkg.com/highlight.run"></script>

H.init(
    "<YOUR_PROJECT_ID>", // Get your project ID from https://app.highlight.io/setup
    networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
    },
    tracingOrigins: true // Optional configuration of Highlight features
);

`

const expressSnippet: string = `

import { Handlers } from '@highlight-run/node'

const app = express()

// define any configurations needed
const highlightOptions = {projectID: '<YOUR_PROJECT_ID>'}
const highlightHandler = Handlers.errorHandler(highlightOptions)
app.use(highlightHandler)

app.use('/error', () => {
  throw new Error('a fake failure was thrown')
})

`

const goSnippet: string = `

import (
  "github.com/highlight/highlight/sdk/highlight-go"
)

func main() {
  //...application logic...
  highlight.Start()
  defer highlight.Stop()
  //...application logic...
}




`

const nodeSnippet: string = `

import { H } from '@highlight-run/node'

const highlightOptions = {}
if (!H.isInitialized()) {
  H.init(highlightOptions)
}

const onError = (request, error) => {
	const parsed = H.parseHeaders(request.headers)
	if (parsed !== undefined) {
		H.consumeError(error, parsed.secureSessionId, parsed.requestId)
	}
}

`

const nextBackendSnippet: string = `

import { withHighlight } from '../highlight.config'

const handler = async (req, res) => {
  res.status(200).json({ name: 'Jay' })
}

export default withHighlight(handler)







`

const angularSnippet: string = `

//main.ts
import { H } from 'highlight.run';

H.init(
    "<YOUR_PROJECT_ID>", // Get your project ID from https://app.highlight.io/setup
    networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
    },
    tracingOrigins: true // Optional configuration of Highlight features
);
`

const gatsbySnippet: string = `

module.exports = {
	plugins: [
		{
			resolve: '@highlight-run/gatsby-plugin-highlight',
			options: {
				orgID: '<YOUR_PROJECT_ID>', // Get your project ID from https://app.highlight.io/setup
			},
		},
	],
}
`

const nextSnippet: string = `

import type { AppProps } from 'next/app'
import { H } from 'highlight.run'
import { ErrorBoundary } from '@highlight-run/react'

H.init('<YOUR_PROJECT_ID>') // Get your project ID from https://app.highlight.io/setup

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<ErrorBoundary>
			<Component {...pageProps} />
		</ErrorBoundary>
	)
}
export default MyApp
`

const reactSnippet: string = `

import React from 'react'
import { H } from 'highlight.run'
import { ErrorBoundary } from '@highlight-run/react'

H.init('<YOUR_PROJECT_ID>') // Get your project ID from https://app.highlight.io/setup

ReactDOM.render(
	<React.StrictMode>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</React.StrictMode>,
	document.getElementById('root'),
)
`

const vueSnippet: string = `

import { H } from 'highlight.run'
import { createApp } from 'vue'
import App from './App.vue'

H.init('<YOUR_PROJECT_ID>') // Get your project ID from https://app.highlight.io/setup

createApp(App).mount('#app')
`

const svelteSnippet: string = `

... %svelte.head%

<script src="https://cdn.jsdelivr.net/npm/highlight.run@latest"></script>
<script>
	window.H.init('<YOUR_PROJECT_ID>')
</script>

...
`

const rubySnippet: string = `

require "highlight"

Highlight.init("<YOUR_PROJECT_ID>", environment: "production") do |c|
  c.service_name = "my-rails-app"
end

Rails.logger = Highlight::Logger.new(STDOUT)

`

const honoSnippet: string = `

import { highlightMiddleware } from '@highlight-run/hono'

const app = new Hono()
app.use('*', highlightMiddleware())
`

export const PRODUCTS: { [k: string]: iProduct } = {
	react: {
		type: 'frontend',
		docsLink: '/docs/getting-started/client-sdk/reactjs',
		slug: 'react',
		title: 'React',
		snippets: [reactSnippet],
	},

	next: {
		type: 'frontend',
		docsLink: '/docs/getting-started/client-sdk/nextjs',
		slug: 'next',
		title: 'Next.js',
		types: ['Frontend', 'Backend'],
		snippets: [nextSnippet, nextBackendSnippet],
	},

	angular: {
		type: 'frontend',
		docsLink: '/docs/getting-started/client-sdk/angular',
		slug: 'angular',
		title: 'Angular',
		snippets: [angularSnippet],
	},

	gatsby: {
		type: 'frontend',
		docsLink: '/docs/getting-started/client-sdk/gatsbyjs',
		slug: 'gatsby',
		title: 'Gatsby.js',
		snippets: [angularSnippet],
	},

	svelte: {
		type: 'frontend',
		docsLink: '/docs/getting-started/client-sdk/sveltekit',
		slug: 'svelte',
		title: 'Svelte.js',
		snippets: [svelteSnippet],
	},

	vue: {
		type: 'frontend',
		docsLink: '/docs/getting-started/client-sdk/vuejs',
		slug: 'vue',
		title: 'Vue.js',
		snippets: [vueSnippet],
	},
	express: {
		type: 'backend',
		docsLink: '/docs/getting-started/backend-sdk/express',
		slug: 'express',
		title: 'Express',
		types: ['Backend', 'Frontend'],
		snippets: [expressSnippet, defaultFrontendSnippet],
	},

	go: {
		type: 'backend',
		docsLink: '/docs/getting-started/backend-sdk/go',
		slug: 'go',
		title: 'Golang',
		types: ['Backend', 'Frontend'],
		snippets: [goSnippet, defaultFrontendSnippet],
	},

	'next-backend': {
		type: 'backend',
		docsLink: '/docs/getting-started/client-sdk/nextjs',
		slug: 'next-backend',
		title: 'Next.js',
		types: ['Backend', 'Frontend'],
		snippets: [nextBackendSnippet, nextSnippet],
	},

	node: {
		type: 'backend',
		docsLink: '/docs/getting-started/backend-sdk/nodejs',
		slug: 'node',
		title: 'Node.js',
		types: ['Backend', 'Frontend'],
		snippets: [nodeSnippet, defaultFrontendSnippet],
	},

	rails: {
		type: 'backend',
		docsLink: '/docs/getting-started/backend-sdk/ruby/rails',
		slug: 'rails',
		title: 'Rails',
		types: ['Backend', 'Frontend'],
		snippets: [rubySnippet, htmlSnippet],
	},

	hono: {
		type: 'backend',
		docsLink: '/docs/getting-started/backend-sdk/js/hono',
		slug: 'hono',
		title: 'Hono',
		types: ['Backend', 'Frontend'],
		snippets: [honoSnippet, defaultFrontendSnippet],
	},
}

export const frontendProductLinks = Object.values(PRODUCTS).filter(
	(product) => {
		return product.type == 'frontend'
	},
)
export const backendProductLinks = Object.values(PRODUCTS).filter((product) => {
	return product.type == 'backend'
})
export const fullStackProductLinks = Object.values(PRODUCTS).filter(
	(product) => {
		return product.type == 'fullstack'
	},
)
