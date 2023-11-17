import { QuickStartContent } from '../QuickstartContent'
import {
	clone,
	dashboard,
	dependencies,
	start,
	troubleshoot,
} from './shared-snippets'

export const DevDeploymentContent: QuickStartContent = {
	title: 'Developer Deployment',
	subtitle:
		'Learn how to set up the dev deployment of highlight.io to start contributing.',
	entries: [
		dependencies,
		clone,
		start,
		{
			title: '(Optional) Running in different terminals.',
			content:
				'While the above instructions will hot-reload, you might want more control of parts of the stack when developing. ' +
				'Running the dev workflow manually is easy in different terminals as well.',
			code: [
				{
					key: 'infra',
					text: `# first, start the infrastructure containers
cd highlight/docker;
./start-infra.sh;`,
					language: 'bash',
				},
				{
					key: 'backend',
					text: `# start the backend. this will run make start-no-doppler in backend and block until you stop it with ctrl+c.
cd highlight/docker;
./run-backend.sh`,
					language: 'bash',
				},
				{
					key: 'frontend',
					text: `# now, start the frontend in a second terminal. this will run yarn docker:frontend in the monorepo and block until you stop it with ctrl+c.
./run-frontend.sh`,
					language: 'bash',
				},
			],
		},
		dashboard,
		{
			title: 'View your first session.',
			content:
				'After clicking around on the dashboard for a bit, you should see a session appear at https://localhost:3000/1/sessions. Click on the session to view the session details page.',
		},
		troubleshoot,
	],
}
import { QuickStartStep } from '../QuickstartContent'

export const dependencies: QuickStartStep = {
	title: 'Prerequisites',
	content:
		'Before we get started, you should install [Go](https://go.dev/) (1.20), [Node.js](https://nodejs.org/en) (18), and [yarn](https://yarnpkg.com/getting-started/install) (v3+).' +
		'You should have the latest version of [Docker](https://docs.docker.com/engine/install/) (19.03.0+) ' +
		'and [Git](https://git-scm.com/downloads) (2.13+) installed. ' +
		'We suggest [configuring docker](https://docs.docker.com/desktop/settings/mac/#resources) ' +
		'to use at least 8GB of RAM, 4 CPUs, and 64 GB of disk space.',
	code: [
		{
			language: 'bash',
			copy: 'go version',
			text: `$ go version
go version go1.20.3 darwin/arm64`,
		},
		{
			language: 'bash',
			copy: 'node --version',
			text: `$ node --version
v18.15.0`,
		},
		{
			language: 'bash',
			copy: 'yarn --version',
			text: `$ yarn --version
v3.5.0`,
		},
		{
			language: 'bash',
			copy: 'docker --version',
			text: `$ docker --version
Docker version 20.10.23, build 7155243`,
		},
		{
			language: 'bash',
			copy: 'docker compose version',
			text: `$ docker compose version
Docker Compose version v2.15.1`,
		},
	],
}

export const clone: QuickStartStep = {
	title: 'Clone the repository.',
	content:
		'Clone the [highlight.io](https://github.com/highlight/highlight) repository and make sure to checkout the submodules with the `--recurse-submodules` flag.',
	code: [
		{
			text: `git clone --recurse-submodules https://github.com/highlight/highlight`,
			language: 'bash',
		},
	],
}

export const start: QuickStartStep = {
	title: 'Start highlight.',
	content:
		'In the `highlight/docker` directory, run `./run.sh` to start the docker containers.',
	code: [
		{
			text: `cd highlight/docker;
./run.sh;`,
			language: 'bash',
		},
	],
}

export const dashboard: QuickStartStep = {
	title: 'Visit the dashboard.',
	content:
		'Visit https://localhost:3000 to view the dashboard and go through the login flow; use the password set in docker/.env variable ADMIN_PASSWORD with any valid email address.',
}

export const troubleshoot: QuickStartStep = {
	title: 'Troubleshoot the deployment.',
	content:
		"Having issues? Here's some things ot try. First run the `docker ps` command and ensure that all containers are in a 'healthy' state. " +
		'As a second step, run `docker compose logs` to see the logs for the infra containers. ' +
		'Looking at the logs, if any containers are not healthy, use the follow commands to start from scratch. ' +
		"If this doesn't help with troubleshooting, please [reach out](https://highlight.io/community).",
	code: [
		{
			text: `docker ps
docker compose logs
# delete everything in the docker compose stack
docker compose down --remove-orphans --volumes --rmi local
`,
			language: 'bash',
		},
	],
}
import { QuickStartContent } from '../QuickstartContent'
import { clone, dashboard, dependencies, troubleshoot } from './shared-snippets'

export const SelfHostContent: QuickStartContent = {
	title: 'Self-hosted (Hobby) Deployment',
	subtitle:
		'Learn how to set up the self-hosted hobby deployment of highlight.io.',
	entries: [
		dependencies,
		clone,
		{
			title: 'Configure networking.',
			content:
				'If this hobby deploy is running on a remote server, make changes to the `docker/.env` file for your deployment. ' +
				'Update the following values to your backend IP address.',
			code: [
				{
					text: `PRIVATE_GRAPH_URI=https://your-ip-address:8082/private
PUBLIC_GRAPH_URI=https://your-ip-address:8082/public
REACT_APP_PRIVATE_GRAPH_URI=https://your-ip-address:8082/private
REACT_APP_PUBLIC_GRAPH_URI=https://your-ip-address:8082/public
REACT_APP_FRONTEND_URI=https://your-ip-address:3000
`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Password auth mode.',
			content:
				'The frontend for hobby deploy now defaults to using password auth. That uses a password set in your deploeyments `docker/.env file to authenticate users`. ' +
				'Update the following environment variable to your preferred admin password. ',
			code: [
				{
					text: `ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD`,
					language: 'bash',
				},
			],
		},

		//
		{
			title: 'Start highlight.',
			content:
				'In the `highlight/docker` directory, run `./run-hobby.sh` to start the docker stack.',
			code: [
				{
					text: `cd highlight/docker;
./run-hobby.sh;`,
					language: 'bash',
				},
			],
		},
		dashboard,
		{
			title: 'Setup the snippet.',
			content:
				'In your frontend application, you should setup highlight.io as usual (see [our guides](https://highlight.io/docs/getting-started/overview#For-your-frontend)), with the exception of adding the `backendUrl` flag to your `init()` method. See the example in react to the right. ',
			code: [
				{
					text: `import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    backendUrl: 'https://localhost:8082/public',
    ...
});`,
					language: 'javascript',
				},
			],
		},
		troubleshoot,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { goGetSnippet, initializeGoSdk } from '../../backend/go/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const GoTracesContent: QuickStartContent = {
	title: 'Tracing from a Go App',
	subtitle:
		'Learn how to set up highlight.io tracing for your Go application.',
	logoUrl: siteUrl('/images/quickstart/go.svg'),
	entries: [
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Wrap your code using the Go SDK.',
			content:
				'By wrapping your code with `StartTrace` and `EndTrace`, the Highlight Go SDK will record a span. You can create more child spans using the child context or add custom attributes to each span.',
			code: [
				{
					text: `import (
	"github.com/highlight/highlight/sdk/highlight-go"
	"go.opentelemetry.io/otel/attribute"
)

func functionToTrace(ctx context.Context, input int) {
	s, childContext := highlight.StartTrace(ctx, "functionToTrace", attribute.Int("custom_property", input))
	// ...
	anotherFunction(childContext)
	// ...
	highlight.EndTrace(s)
}

func anotherFunction(ctx context.Context) {
	s, _ := highlight.StartTrace(ctx, "anotherFunction")
	// ...
	highlight.EndTrace(s)
}`,
					language: 'go',
				},
			],
		},
		verifyTraces,
	],
}
import { QuickStartStep } from '../QuickstartContent'

export const verifyTraces: QuickStartStep = {
	title: 'Verify your backend traces are being recorded.',
	content:
		'Visit the [highlight traces portal](http://app.highlight.io/traces) and check that backend traces are coming in.',
}
import { QuickStartContent } from '../QuickstartContent'
import { verifyTraces } from './shared-snippets'

export const OTLPTracesContent: QuickStartContent = {
	title: 'Tracing via the OpenTelemetry Protocol (OTLP)',
	subtitle: `Learn how to export traces to highlight.io via one of the OpenTelemetry SDKs.`,
	entries: [
		{
			title: 'Export your traces to the highlight.io collector.',
			content:
				'We host an OpenTelemetry collector endpoint at https://otel.highlight.io:4318/v1/traces. Configure your OpenTelemetry SDK to send traces via OTLP HTTPS to this endpoint. Your Highlight Project ID should be included as an attribute with the `highlight.project_id` key. This configuration will depend on which SDK you use in your app.',
			code: [
				{
					text: `import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources'
import type { Attributes } from '@opentelemetry/api'

const attributes: Attributes = {
    'highlight.project_id': '<YOUR_PROJECT_ID>'
}
const sdk = new NodeSDK({
	resource: new Resource(attributes),
	traceExporter: new OTLPTraceExporter({
		url: 'https://otel.highlight.io:4318/v1/traces'
	})
});
sdk.start();`,
					language: 'js',
				},
			],
		},
		verifyTraces,
	],
}
import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

const angularInitCodeSnippet = `// app.module.ts
    import { NgModule } from '@angular/core';
...

import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    environment: 'production',
    version: 'commit:abcdefg12345',
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
        urlBlocklist: [
            // insert full or partial urls that you don't want to record here
			// Out of the box, Highlight will not record these URLs (they can be safely removed):
			"https://www.googleapis.com/identitytoolkit",
			"https://securetoken.googleapis.com",
        ],
	},
});

@NgModule({
    ...
})
export class AppModule { }
`

export const AngularContent: QuickStartContent = {
	title: 'Angular',
	subtitle: 'Learn how to set up highlight.io with your Angular application.',
	logoUrl: siteUrl('/images/quickstart/angular.svg'),
	entries: [
		packageInstallSnippet,
		{
			...initializeSnippet,
			code: [
				{
					...initializeSnippet.code,
					text: angularInitCodeSnippet,
					language: initializeSnippet.code?.[0]?.language ?? 'js',
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	packageInstallSnippet,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

const svelteKitInitCodeSnippet = `// hooks.client.ts
...

import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
    environment: 'production',
    version: 'commit:abcdefg12345',
    tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
        urlBlocklist: [
            // insert full or partial urls that you don't want to record here
			// Out of the box, Highlight will not record these URLs (they can be safely removed):
			"https://www.googleapis.com/identitytoolkit",
			"https://securetoken.googleapis.com",
        ],
	},
});
...
`

export const SvelteKitContent: QuickStartContent = {
	title: 'SvelteKit',
	subtitle:
		'Learn how to set up highlight.io with your SvelteKit application.',
	logoUrl: siteUrl('/images/quickstart/sveltekit.svg'),
	entries: [
		packageInstallSnippet,
		{
			...initializeSnippet,
			content:
				'In SvelteKit, we recommend initializing highlight.io in the `hooks.client.js` or `hooks.client.ts` file. You can find more details about this file in the SvelteKit docs [here](https://kit.svelte.dev/docs/hooks). To get started, we recommend setting `tracingOrigins` and `networkRecording` so that we can pass a header to pair frontend and backend errors. \n\n\n' +
				`Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and pass it as the first parameter of the \`H.init()\` method.`,
			code: [
				{
					...initializeSnippet.code,
					text: svelteKitInitCodeSnippet,
					language: initializeSnippet.code?.[0]?.language ?? 'js',
				},
			],
		},
		{
			title: 'Confirm CSS is served by absolute path.',
			content:
				'SvelteKit may generate CSS paths that are relative ' +
				'which may interfere with our logic to fetch stylesheets. ' +
				'Update your `svelte.config.js` to disable relative paths. ' +
				'[See the SvelteKit docs here for more details](https://kit.svelte.dev/docs/configuration#paths).',
			code: [
				{
					language: 'js',
					text: `/** @type {import('@sveltejs/kit').Config} */
const config = {
  paths: { relative: false }
};

export default config;`,
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
import { QuickStartContent, QuickStartStep } from '../QuickstartContent'
import {
	configureSourcemapsCI,
	identifySnippet,
	packageInstallSnippet,
	sessionReplayFeaturesLink,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

import { siteUrl } from '../../../utils/urls'

const vueInitSnippet: QuickStartStep = {
	title: 'Initialize the SDK in your frontend.',
	content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and pass it as the first parameter of the \`H.init()\` method.
                    
To get started, we recommend setting \`environment\`, \`version\`, and \`networkRecording\`. Refer to our docs on [SDK configuration](${sessionReplayFeaturesLink}) to read more about these options. `,
	code: [
		{
			text: `...
import { H } from 'highlight.run';

import { createApp } from 'vue'
import App from './App.vue'

H.init('<YOUR_PROJECT_ID>', {
    environment: 'production',
    version: 'commit:abcdefg12345',
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
        urlBlocklist: [
            // insert full or partial urls that you don't want to record here
			// Out of the box, Highlight will not record these URLs (they can be safely removed):
			"https://www.googleapis.com/identitytoolkit",
			"https://securetoken.googleapis.com",
        ],
	},
});

...
createApp(App).mount('#app')

                `,
			language: 'js',
		},
	],
}

export const VueContent: QuickStartContent = {
	title: 'Vue.js',
	subtitle: 'Learn how to set up highlight.io with your React application.',
	logoUrl: siteUrl('/images/quickstart/vue.svg'),
	entries: [
		packageInstallSnippet,
		vueInitSnippet,
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
import { siteUrl } from '../../../utils/urls'
import { QuickStartContent, QuickStartStep } from '../QuickstartContent'
import {
	configureSourcemapsCI,
	identifySnippet,
	sessionReplayFeaturesLink,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

export const initializePluginSnippet: QuickStartStep = {
	title: 'Initialize the plugin in your gatsby configuration.',
	content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and set it as the \`orgID\`.
                    
To get started, we recommend setting \`environment\`, \`version\`, and \`networkRecording\`. Refer to our docs on [SDK configuration](${sessionReplayFeaturesLink}) to read more about these options. `,
	code: [
		{
			text: `module.exports = {
	plugins: [
		{
			resolve: '@highlight-run/gatsby-plugin-highlight',
			options: {
				orgID: '<YOUR_PROJECT_ID>', // Get your project ID from https://app.highlight.io/setup
			},
		},
	],
}
                `,
			language: 'js',
		},
	],
}

export const GatsbyContent: QuickStartContent = {
	title: 'Gatsby',
	subtitle: 'Learn how to set up highlight.io with your Gatsby application.',
	logoUrl: siteUrl('/images/quickstart/gatsby.svg'),
	entries: [
		{
			title: 'Install the gatsby plugin.',
			content: 'Install the npm pulugin in your terminal.',

			code: [
				{
					key: 'npm',
					text: `# with npm
npm install @highlight-run/gatsby-plugin-highlight`,
					language: 'bash',
				},
				{
					key: 'yarn',
					text: `# with yarn
yarn add @highlight-run/gatsby-plugin-highlight
    `,
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: `# with pnpm
pnpm add @highlight-run/gatsby-plugin-highlight`,
					language: 'bash',
				},
			],
		},
		initializePluginSnippet,
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
import { siteUrl } from '../../../utils/urls'
import { QuickStartStep } from '../QuickstartContent'

export const packageInstallSnippet: QuickStartStep = {
	title: 'Install the npm package & SDK.',
	content: 'Install the npm package `highlight.run` in your terminal.',
	code: [
		{
			key: 'yarn',
			text: `# with yarn
yarn add highlight.run`,
			language: 'bash',
		},
		{
			key: 'pnpm',
			text: `# with pnpm
pnpm add highlight.run`,
			language: 'bash',
		},
		{
			key: 'npm',
			text: `# with npm
npm install highlight.run`,
			language: 'bash',
		},
	],
}

export const sessionReplayFeaturesLink = siteUrl(
	'/docs/getting-started/client-sdk/replay-configuration/overview',
)
export const identifyingUsersLink = siteUrl(
	'/docs/getting-started/client-sdk/replay-configuration/identifying-sessions',
)
export const sessionSearchLink = siteUrl(
	'/docs/general/product-features/session-replay/session-search',
)
export const backendInstrumentationLink = siteUrl(
	'/docs/getting-started/overview#for-your-backend-error-monitoring',
)
export const fullstackMappingLink = siteUrl(
	'/docs/getting-started/frontend-backend-mapping',
)
export const sourceMapDetailsLink = siteUrl(
	'/docs/getting-started/client-sdk/replay-configuration/sourcemaps',
)

export const configureSourcemapsCI = (docsLink?: string): QuickStartStep => {
	return {
		title: 'Configure sourcemaps in CI. (optional)',
		content: `To get properly enhanced stacktraces of your javascript app, we recommend instrumenting sourcemaps. If you deploy public sourcemaps, you can skip this step. Refer to our docs on [sourcemaps](${
			docsLink ?? sourceMapDetailsLink
		}) to read more about this option.`,
		code: [
			{
				text: `# Upload sourcemaps to Highlight
...
npx --yes @highlight-run/sourcemap-uploader upload --apiKey $\{YOUR_ORG_API_KEY\} --path ./build
...`,
				language: 'bash',
			},
		],
	}
}

export const initializeSnippet: QuickStartStep = {
	title: 'Initialize the SDK in your frontend.',
	content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and pass it as the first parameter of the \`H.init()\` method.
                    
To get started, we recommend setting \`tracingOrigins\` and \`networkRecording\` so that we can pass a header to pair frontend and backend errors. Refer to our docs on [SDK configuration](${sessionReplayFeaturesLink}) and [Fullstack Mapping](${fullstackMappingLink}) to read more about these options.`,
	code: [
		{
			text: `...
import { H } from 'highlight.run';

H.init('<YOUR_PROJECT_ID>', {
	serviceName: "frontend-app",
	tracingOrigins: true,
	networkRecording: {
		enabled: true,
		recordHeadersAndBody: true,
		urlBlocklist: [
			// insert full or partial urls that you don't want to record here
			// Out of the box, Highlight will not record these URLs (they can be safely removed):
			"https://www.googleapis.com/identitytoolkit",
			"https://securetoken.googleapis.com",
		],
	},
});

...
// rendering code.`,
			language: 'js',
		},
	],
}

export const identifySnippet: QuickStartStep = {
	title: 'Identify users.',
	content: `Identify users after the authentication flow of your web app. We recommend doing this in any asynchronous, client-side context. \n\n\nThe first argument of \`identify\` will be searchable via the property \`identifier\`, and the second property is searchable by the key of each item in the object. \n\n\nFor more details, read about [session search](${sessionSearchLink}) or how to [identify users](${identifyingUsersLink}).`,
	code: [
		{
			text: `
import { H } from 'highlight.run';

function Login(username: string, password: string) {
	// login logic here...
	// pass the user details from your auth provider to the H.identify call
	
	H.identify('jay@highlight.io', {
		id: 'very-secure-id',
		phone: '867-5309',
		bestFriend: 'jenny'
	});
}
`,
			language: 'js',
		},
	],
}

export const verifySnippet: QuickStartStep = {
	title: 'Verify installation',
	content:
		"Check your [dashboard](https://app.highlight.io/sessions) for a new session. Make sure to remove the `Status is Completed` filter to see ongoing sessions. Don't see anything? Send us a message in [our community](https://highlight.io/community) and we can help debug.",
}

export const setupBackendSnippet: QuickStartStep = {
	title: 'Instrument your backend.',
	content: `The next step is instrumenting your backend to tie logs/errors to your frontend sessions. Read more about this in our [backend instrumentation](${backendInstrumentationLink}) section.`,
}
import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'
import {
	configureSourcemapsCI,
	identifySnippet,
	initializeSnippet,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

const ErrorBoundaryCodeSnippet = `import { ErrorBoundary } from '@highlight-run/react';

ReactDOM.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
    document.getElementById('root')
);`

export const ReactContent: QuickStartContent = {
	title: 'React.js',
	subtitle: 'Learn how to set up highlight.io with your React application.',
	logoUrl: siteUrl('/images/quickstart/react.svg'),
	entries: [
		{
			title: 'Install the npm package & SDK.',
			content:
				'Install the npm package `highlight.run` in your terminal.',
			code: [
				{
					key: 'npm',
					text: `# with npm
npm install highlight.run @highlight-run/react`,
					language: 'bash',
				},
				{
					key: 'yarn',
					text: `# with yarn
yarn add highlight.run @highlight-run/react`,
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: `# with pnpm
pnpm add highlight.run @highlight-run/react`,
					language: 'bash',
				},
			],
		},
		initializeSnippet,
		{
			title: 'Add the ErrorBoundary component. (optional)',
			content: `The ErrorBoundary component wraps your component tree and catches crashes/exceptions from your react app. When a crash happens, your users will be prompted with a modal to share details about what led up to the crash. Read more [here](https://www.highlight.io/docs/getting-started/client-sdk/replay-configuration/react-error-boundary).`,
			code: [
				{
					text: ErrorBoundaryCodeSnippet,
					language: 'js',
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
import {
	configureSourcemapsCI,
	identifySnippet,
	sessionReplayFeaturesLink,
	setupBackendSnippet,
	verifySnippet,
} from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

export const OtherContext: QuickStartContent = {
	title: 'HTML/JS',
	subtitle:
		'Learn how to set up highlight.io with any browser-based framework.',
	logoUrl: siteUrl('/images/quickstart/javascript.svg'),
	entries: [
		{
			title: 'Import the script in your index html file.',
			content:
				'Add the following script tag to the head section of your `index.html` file.',
			code: [
				{
					text: `<html>
<head>
    <script src="https://unpkg.com/highlight.run"></script>
</head>
<body>
    <!-- Your Application -->
</body>
</html>
`,
					language: 'html',
				},
			],
		},
		{
			title: 'Initialize the SDK.',
			content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and pass it as the first parameter of the \`H.init()\` method. Place this method just below the initialize script tag in the \`head\` section of your \`index.html\` file.
                    
To get started, we recommend setting \`environment\`, \`version\`, and \`networkRecording\`. Refer to our docs on [SDK configuration](${sessionReplayFeaturesLink}) to read more about these options. `,
			code: [
				{
					text: `<html>
<head>
    <script src="https://unpkg.com/highlight.run"></script>
    <script>
        H.init('<YOUR_PROJECT_ID>', { // Get your project ID from https://app.highlight.io/setup
            environment: 'production',
            version: 'commit:abcdefg12345',
            networkRecording: {
                enabled: true,
                recordHeadersAndBody: true,
                urlBlocklist: [
					// insert full or partial urls that you don't want to record here
					// Out of the box, Highlight will not record these URLs (they can be safely removed):
					"https://www.googleapis.com/identitytoolkit",
					"https://securetoken.googleapis.com",
                ],
            },
        });
    </script>
</head>
<body>
    <!-- Your Application -->
</body>
</html>
`,
					language: 'html',
				},
			],
		},
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
import {
	identifyingUsersLink,
	sessionSearchLink,
	verifySnippet,
} from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

const GUIDE_URL = siteUrl('/docs/getting-started/fullstack-frameworks/remix')

export const RemixContent: QuickStartContent = {
	title: 'Remix',
	subtitle: 'Learn how to set up highlight.io with your Remix application.',
	logoUrl: siteUrl('/images/quickstart/remix.png'),
	entries: [
		{
			title: 'Install the npm package & SDK.',
			content:
				'Install the `@highlight-run/remix` npm package in your terminal.',
			code: [
				{
					key: 'npm',
					text: `
# with npm
npm install @highlight-run/remix
					`,
					language: 'bash',
				},
				{
					key: 'yarn',
					text: `
# with yarn
yarn add @highlight-run/remix
				`,
					language: 'bash',
				},
				{
					key: 'pnpm',
					text: `
# with pnpm
pnpm add @highlight-run/remix
				`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Initialize the client SDK.',
			content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), inject it into your client application using the \`loader\` export from your \`root.tsx\` file, and set the \`projectID\` in the \`<HighlightInit/>\` component.
			`,
			code: [
				{
					text: `
// app/root.tsx
import { useLoaderData } from '@remix-run/react'

import { HighlightInit } from '@highlight-run/remix/client'
import { json } from '@remix-run/node'


export async function loader() {
	return json({
		ENV: {
			HIGHLIGHT_PROJECT_ID: process.env.HIGHLIGHT_PROJECT_ID,
		},
	})
}

export default function App() {
	const { ENV } = useLoaderData()

	return (
		<html lang="en">
			<HighlightInit
				projectId={ENV.HIGHLIGHT_PROJECT_ID}
				serviceName="my-remix-frontend"
				tracingOrigins
				networkRecording={{ enabled: true, recordHeadersAndBody: true }}
			/>

			{/* Render head, body, <Outlet />, etc. */}
		</html>
	)
}
				`,
					language: 'js',
				},
			],
		},
		{
			title: 'Export a custom ErrorBoundary handler (optional)',
			content: `The \`ErrorBoundary\` component wraps your component tree and catches crashes/exceptions from your react app. When a crash happens, your users will be prompted with a modal to share details about what led up to the crash. Read more [here](${siteUrl(
				'/docs/getting-started/client-sdk/replay-configuration',
			)}).`,
			code: [
				{
					text: `
// app/components/error-boundary.tsx
import { isRouteErrorResponse, useRouteError } from '@remix-run/react'
import { ReportDialog } from '@highlight-run/remix/report-dialog'

export function ErrorBoundary() {
	const error = useRouteError()

	if (isRouteErrorResponse(error)) {
		return (
			<div>
				<h1>
					{error.status} {error.statusText}
				</h1>
				<p>{error.data}</p>
			</div>
		)
	} else if (error instanceof Error) {
		return (
			<div>
				<script src="https://unpkg.com/highlight.run"></script>
				<script
					dangerouslySetInnerHTML={{
						__html: \`
							H.init('\${process.env.HIGHLIGHT_PROJECT_ID}');
						\`,
					}}
				/>
				<h1>Error</h1>
				<p>{error.message}</p>
				<p>The stack trace is:</p>
				<pre>{error.stack}</pre>

				<ReportDialog />
			</div>
		)
	} else {
		return <h1>Unknown Error</h1>
	}
}
			`,
					language: 'js',
				},
				{
					text: `
// app/root.tsx
export { ErrorBoundary } from '~/components/error-boundary'
}
			`,
					language: 'js',
				},
			],
		},
		{
			title: 'Identify users.',
			content: `Identify users after the authentication flow of your web app. We recommend doing this in a \`useEffect\` call or in any asynchronous, client-side context. \n\n\nThe first argument of \`identify\` will be searchable via the property \`identifier\`, and the second property is searchable by the key of each item in the object. \n\n\nFor more details, read about [session search](${sessionSearchLink}) or how to [identify users](${identifyingUsersLink}).`,
			code: [
				{
					text: `
import { H } from '@highlight-run/remix/client';

function RenderFunction() {

	useEffect(() => {
		// login logic...
		
		H.identify('jay@highlight.io', {
			id: 'very-secure-id',
			phone: '867-5309',
			bestFriend: 'jenny'
		});
	}, [])

	return null; // Or your app's rendering code.
}
		`,
					language: 'js',
				},
			],
		},
		{
			title: 'Initialize the server SDK.',
			content: `Send errors to Highlight from your Remix server using the \`entry.server.tsx\` file.`,
			code: [
				{
					text: `
// app/entry.server.tsx
import { H, HandleError } from '@highlight-run/remix/server'

const nodeOptions = { projectID: process.env.HIGHLIGHT_PROJECT_ID }

export const handleError = HandleError(nodeOptions)

// Handle server requests				
				`,
					language: 'js',
				},
			],
		},
		verifySnippet,
		{
			title: 'More Remix features?',
			content: `See our [fullstack Remix guide](${GUIDE_URL}) for more information on how to use Highlight with Remix.`,
		},
	],
}
import { verifySnippet } from './shared-snippets'

import { siteUrl } from '../../../utils/urls'
import { QuickStartContent } from '../QuickstartContent'

const GUIDE_URL = siteUrl('/docs/getting-started/fullstack-frameworks/next-js')

export const NextContent: QuickStartContent = {
	title: 'Next.js',
	subtitle:
		'Learn how to set up highlight.io with your Next (frontend) application.',
	logoUrl: siteUrl('/images/quickstart/nextjs.svg'),
	entries: [
		{
			title: 'Install the npm package & SDK.',
			content:
				'Install the npm package `@highlight-run/next` in your terminal.',
			code: [
				{
					key: 'npm',
					text: `
# with npm
npm install @highlight-run/next
					`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Initialize the client SDK.',
			content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup), and set it as the \`projectID\` in the \`<HighlightInit/>\` component.
			
If you're using the original Next.js Page router, drop \`<HighlightInit />\` in your \`_app.tsx\` file. For the App Router, add it to your top-level \`layout.tsx\` file.`,
			code: [
				{
					text: `
// src/app/layout.tsx
import { HighlightInit } from '@highlight-run/next/client'

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<HighlightInit
				projectId={'<YOUR_PROJECT_ID>'}
				serviceName="my-nextjs-frontend"
				tracingOrigins
				networkRecording={{
					enabled: true,
					recordHeadersAndBody: true,
					urlBlocklist: [],
				}}
			/>

			<html lang="en">
				<body>{children}</body>
			</html>
		</>
	)
}
				`,
					language: 'js',
				},
			],
		},

		verifySnippet,

		{
			title: 'More Next.js features?',
			content: `See our [fullstack Next.js guide](${GUIDE_URL}) for more information on how to use Highlight with Next.js.`,
		},
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyGoErrors,
} from './shared-snippets'

export const GoEchoContent: QuickStartContent = {
	title: 'Go Echo',
	subtitle: 'Learn how to set up highlight.io on your Go Echo backend.',
	logoUrl: siteUrl('/images/quickstart/echo.svg'),
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight Echo error handler.',
			content:
				'`highlightEcho.Middleware()` provides a [Go Echo](https://github.com/labstack/echo) middleware to automatically record and send errors to Highlight.',
			code: [
				{
					text: `import (
  highlightEcho "github.com/highlight/highlight/sdk/highlight-go/middleware/echo"
)

func main() {
  // ...
  e := echo.New()
  e.Use(highlightEcho.Middleware())
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyGoErrors,
		setUpLogging('echo'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartStep } from '../../QuickstartContent'

export const goGetSnippet: QuickStartStep = {
	title: 'Install the Highlight Go SDK.',
	content: 'Install the `highlight-go` package with `go get`.',
	code: [
		{
			text: `go get -u github.com/highlight/highlight/sdk/highlight-go`,
			language: 'bash',
		},
	],
}

export const initializeGoSdk: QuickStartStep = {
	title: 'Initialize the Highlight Go SDK.',
	content:
		"`highlight.Start` starts a goroutine for recording and sending backend traces and errors. Setting your project id lets Highlight record errors for background tasks and processes that aren't associated with a frontend session.",
	code: [
		{
			text: `import (
  "github.com/highlight/highlight/sdk/highlight-go"
)

func main() {
  // ...
  highlight.SetProjectID("<YOUR_PROJECT_ID>")
  highlight.Start(
	highlight.WithServiceName("my-app"),
	highlight.WithServiceVersion("git-sha"),
  )
  defer highlight.Stop()
  // ...
}`,
			language: 'go',
		},
	],
}

export const customGoError: QuickStartStep = {
	title: 'Record custom errors. (optional)',
	content:
		'If you want to explicitly send an error to Highlight, you can use the `highlight.RecordError` method.',
	code: [
		{
			text: `highlight.RecordError(ctx, err, attribute.String("key", "value"))`,
			language: 'go',
		},
	],
}

export const verifyGoErrors: QuickStartStep = {
	title: 'Verify your errors are being recorded.',
	content:
		"Now that you've set up the Middleware, verify that the backend error handling works by consuming an error from your handler. This is as easy as having a route handler return an error.",
}

export const verifyCustomError: QuickStartStep = {
	title: 'Verify your errors are being recorded.',
	content:
		'Make a call to `highlight.RecordError` to see the resulting error in Highlight.',
	code: [
		{
			text: `func TestErrorHandler(w http.ResponseWriter, r *http.Request) {
  highlight.RecordError(r.Context(), errors.New("a test error is being thrown!"))
}`,
			language: 'go',
		},
	],
}

export const setUpLogging: (slug: string) => QuickStartStep = (slug) => ({
	title: 'Set up logging.',
	content: `Start sending logs to Highlight! Follow the [logging setup guide](${siteUrl(
		'/docs/getting-started/backend-logging/go/overview',
	)}) to get started.`,
})
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyGoErrors,
} from './shared-snippets'

export const GoFiberContent: QuickStartContent = {
	title: 'Go Fiber',
	subtitle: 'Learn how to set up highlight.io on your Go Fiber backend.',
	logoUrl: siteUrl('/images/quickstart/fiber.svg'),
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight Fiber error handler.',
			content:
				'`highlightFiber.Middleware()` provides a [Go Fiber](https://github.com/gofiber/fiber) middleware to automatically record and send errors to Highlight.',
			code: [
				{
					text: `import (
  highlightFiber "github.com/highlight/highlight/sdk/highlight-go/middleware/fiber"
)

func main() {
  // ...
  app := fiber.New()
  app.Use(highlightFiber.Middleware())
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyGoErrors,
		setUpLogging('fiber'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyCustomError,
} from './shared-snippets'

export const GoMuxContent: QuickStartContent = {
	title: 'Go Mux',
	subtitle: 'Learn how to set up highlight.io on your Go gqlgen backend.',
	logoUrl: siteUrl('/images/quickstart/mux.svg'),
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight gqlgen error handler.',
			content:
				'`H.NewGraphqlTracer` provides a middleware you can add to your [Golang Mux](https://github.com/gorilla/mux) handler to automatically record and send GraphQL resolver errors to Highlight.',
			code: [
				{
					text: `import (
  highlightGorillaMux "github.com/highlight/highlight/sdk/highlight-go/middleware/gorillamux"
)

func main() {
  // ...
  r := mux.NewRouter()
  r.Use(highlightGorillaMux.Middleware)
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyCustomError,
		setUpLogging('mux'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyGoErrors,
} from './shared-snippets'

export const GoGqlgenContent: QuickStartContent = {
	title: 'Go Gqlgen',
	subtitle: 'Learn how to set up highlight.io on your Go gqlgen backend.',
	logoUrl: siteUrl('/images/quickstart/gqlgen.svg'),
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight gqlgen error handler.',
			content:
				'`highlight.NewGraphqlTracer` provides a middleware you can add to your [GraphQL](https://gqlgen.com/getting-started/) handler to automatically record and send GraphQL resolver errors to Highlight. ' +
				'Calling `.WithRequestFieldLogging()` will also emit highlight logs for each graphql operation, giving you a way' +
				'to search across all graphql requests to your backend.',
			code: [
				{
					text: `import (
  "github.com/highlight/highlight/sdk/highlight-go"
)

func main() {
  // ...
  server := handler.New(...)
  // call with WithRequestFieldLogging() to emit highlight logs for each graphql operation
  // useful for tracing which graphql operations are called as part of which frontend sessions
  server.Use(highlight.NewGraphqlTracer("your-backend-service-name").WithRequestFieldLogging())
  // capture panics emitted by graphql handlers in highlight
  server.SetRecoverFunc(highlight.GraphQLRecoverFunc())
  // format logs on errors thrown by your graphql handlers
  server.SetErrorPresenter(highlight.GraphQLErrorPresenter("my-gql-service"))
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyGoErrors,
		setUpLogging('gqlgen'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyCustomError,
} from './shared-snippets'

export const GoChiContent: QuickStartContent = {
	title: 'Go Chi',
	subtitle: 'Learn how to set up highlight.io on your Go chi backend.',
	logoUrl: siteUrl('/images/quickstart/chi.svg'),
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight middleware.',
			content:
				'`highlightChi.Middleware` is a [Go Chi](https://github.com/go-chi/chi) compatible middleware.',
			code: [
				{
					text: `import (
  highlightChi "github.com/highlight/highlight/sdk/highlight-go/middleware/chi"
)

func main() {
  // ...
  r := chi.NewRouter()
  r.Use(highlightChi.Middleware)
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyCustomError,
		setUpLogging('chi'),
	],
}
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customGoError,
	goGetSnippet,
	initializeGoSdk,
	setUpLogging,
	verifyCustomError,
} from './shared-snippets'

export const GoGinContent: QuickStartContent = {
	title: 'Go Gin',
	subtitle: 'Learn how to set up highlight.io on your Go gqlgen backend.',
	entries: [
		frontendInstallSnippet,
		goGetSnippet,
		initializeGoSdk,
		{
			title: 'Add the Highlight middleware.',
			content:
				'`highlightGin.Middleware()` provides is a [Go Gin](https://github.com/gin-gonic/gin) compatible middleware.',
			code: [
				{
					text: `import (
  highlightGin "github.com/highlight/highlight/sdk/highlight-go/middleware/gin"
)

func main() {
  // ...
  r := gin.Default()
  r.Use(highlightGin.Middleware())
  // ...
}`,
					language: 'go',
				},
			],
		},
		customGoError,
		verifyCustomError,
		setUpLogging('gin'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonFlaskContext: QuickStartContent = {
	title: 'Python Flask',
	subtitle:
		'Learn how to set up highlight.io on your Python Flask backend API.',
	logoUrl: siteUrl('/images/quickstart/flask.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet('Flask'),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK to with the Flask integration.',
			code: [
				{
					text: `from flask import Flask

import highlight_io
from highlight_io.integrations.flask import FlaskIntegration

app = Flask(__name__)

# \`instrument_logging=True\` sets up logging instrumentation.
# if you do not want to send logs or are using \`loguru\`, pass \`instrument_logging=False\`
H = highlight_io.H(
	"<YOUR_PROJECT_ID>",
	integrations=[FlaskIntegration()],
	instrument_logging=True,
	service_name="my-flask-app",
	service_version="git-sha",
)`,
					language: 'python',
				},
			],
		},
		{
			title: 'Instrument manual error handlers.',
			content:
				'If you have existing error handlers, you need to instrument them manually to capture errors.',
			code: [
				{
					text: `# you may have a custom error handler that formats an error response
# make sure to report the error to highlight to capture it
@app.errorhandler(Exception)
def handle_general_exception(exc: Exception):
	highlight_io.H.get_instance().record_exception(exc)
	return jsonify(error="internal error", message=str(exc), trace=traceback.format_exc()), 503`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Add the following code to your Flask app and start the Flask server. ' +
				'Visit http://127.0.0.1:5000/hello in your browser. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import logging
import random
import time

from flask import Flask

import highlight_io
from highlight_io.integrations.flask import FlaskIntegration

app = Flask(__name__)

# \`instrument_logging=True\` sets up logging instrumentation.
# if you do not want to send logs or are using \`loguru\`, pass \`instrument_logging=False\`
H = highlight_io.H(
	"<YOUR_PROJECT_ID>",
	integrations=[FlaskIntegration()],
	instrument_logging=True,
	service_name="my-flask-app",
	service_version="git-sha",
)


@app.route("/hello")
def hello():
    return f"<h1>bad idea { 5/0 }</h1>"


if __name__ == "__main__":
    app.run()`,
					language: 'python',
				},
			],
		},
		setupLogging('flask'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonAWSContext: QuickStartContent = {
	title: 'Logging from Python AWS Lambda',
	subtitle: 'Learn how to set up highlight.io on AWS Lambda.',
	logoUrl: siteUrl('/images/quickstart/aws-lambda.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK. Add the `@observe_handler` decorator to your lambdas.',
			code: [
				{
					text: `import highlight_io
from highlight_io.integrations.aws import observe_handler

${init}


@observe_handler
def lambda_handler(event, context):
    return {
        "statusCode": 200,
        "body": f"Hello, {name}. This HTTP triggered function executed successfully.",
    }
`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Add an operation that raises an exception to your lambda handler. ' +
				'Setup an HTTP trigger and visit your lambda on the internet. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import highlight_io
from highlight_io.integrations.aws import observe_handler

${init}


@observe_handler
def lambda_handler(event, context):
    return {
        "body": f"Returning this is a bad idea: {5 / 0}.",
    }`,
					language: 'python',
				},
			],
		},
		setupLogging('aws'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { fullstackMappingLink } from '../../frontend/shared-snippets'
import { QuickStartStep } from '../../QuickstartContent'

export const setupFrontendSnippet: QuickStartStep = {
	title: 'Setup your frontend Highlight snippet with tracingOrigins.',
	content: `Make sure that you followed the [fullstack mapping guide](${fullstackMappingLink}#How-can-I-start-using-this).`,
	code: [
		{
			text: `H.init("<YOUR_PROJECT_ID>", {
  tracingOrigins: ['localhost', 'example.myapp.com/backend'],
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
});`,
			language: 'js',
		},
	],
}

export const downloadSnippet = (variant?: string): QuickStartStep => {
	return {
		title: 'Install the highlight-io python package.',
		content:
			'Download the package from pypi and save it to your requirements. ' +
			'If you use a zip or s3 file upload to publish your function, you will want to make sure ' +
			'`highlight-io` is part of the build.',
		code: [
			{
				key: 'poetry',
				text: `poetry add highlight-io${
					variant ? '[' + variant + ']' : ''
				}`,
				language: 'bash',
			},
			{
				key: 'pip',
				text: `# or with pip
pip install highlight-io${variant ? '[' + variant + ']' : ''}`,
				language: 'bash',
			},
		],
	}
}

export const setupLogging: (slug: string) => QuickStartStep = (slug) => ({
	title: 'Set up logging.',
	content: `With the Python SDK, your logs are reported automatically from builtin logging methods. See the Python [logging setup guide](${siteUrl(
		'/docs/getting-started/backend-logging/python/overview',
	)}) for more details.`,
})

export const init = `# \`instrument_logging=True\` sets up logging instrumentation.
# if you do not want to send logs or are using \`loguru\`, pass \`instrument_logging=False\`
H = highlight_io.H(
	"<YOUR_PROJECT_ID>",
	instrument_logging=True,
	service_name="my-app",
	service_version="git-sha",
)`
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonGCPContext: QuickStartContent = {
	title: 'Python Google Cloud Functions',
	subtitle: 'Learn how to set up highlight.io on Google Cloud Functions.',
	logoUrl: siteUrl('/images/quickstart/google-cloud.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK. Add the `@observe_handler` decorator to your functions.',
			code: [
				{
					text: `import logging
import random
from datetime import datetime

import functions_framework

import highlight_io
from highlight_io.integrations.gcp import observe_handler

${init}


@observe_handler
@functions_framework.http
def hello_http(request):
    return "Hello {}!".format(name)
`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Add an operation that raises an exception to your function. ' +
				'Setup an HTTP trigger and visit your function on the internet. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import logging
import random
from datetime import datetime

import functions_framework

import highlight_io
from highlight_io.integrations.gcp import observe_handler

${init}


@observe_handler
@functions_framework.http
def hello_http(request):
    return f"This might be a bad idea: {5/0}"
`,
					language: 'python',
				},
			],
		},
		setupLogging('gcp'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonDjangoContext: QuickStartContent = {
	title: 'Python Django',
	subtitle:
		'Learn how to set up highlight.io on your Python Django backend API.',
	logoUrl: siteUrl('/images/quickstart/django.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet('Django'),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Add Highlight with the Django integration to your `settings.py` file.',
			code: [
				{
					text: `import highlight_io
from highlight_io.integrations.django import DjangoIntegration

# \`instrument_logging=True\` sets up logging instrumentation.
# if you do not want to send logs or are using \`loguru\`, pass \`instrument_logging=False\`
H = highlight_io.H(
	"<YOUR_PROJECT_ID>",
	integrations=[DjangoIntegration()],
	instrument_logging=True,
	service_name="my-django-app",
	service_version="git-sha",
)`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Change one of your Django views to the following code which will throw an exception. ' +
				'Access the Django route in your browser. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import logging
import random

from django.http import HttpResponse, HttpRequest


def index(request: HttpRequest):
    return HttpResponse(f"This might not go well. result is {2 / 0}")
`,
					language: 'python',
				},
			],
		},
		setupLogging('django'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonOtherContext: QuickStartContent = {
	title: 'Python',
	subtitle: 'Learn how to set up highlight.io in your Python app.',
	logoUrl: siteUrl('/images/quickstart/python.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK.',
			code: [
				{
					text: `import highlight_io

${init}`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Try raising an exception somewhere in your code. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import logging
import random
import time

import highlight_io

${init}


def main():
    with H.trace():
        logging.info('hello, world!', {'favorite_number': 7})
        return f"<h1>bad idea { 5/0 }</h1>"


if __name__ == "__main__":
    main()`,
					language: 'python',
				},
			],
		},
		setupLogging('other'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonFastAPIContext: QuickStartContent = {
	title: 'Python FastAPI',
	subtitle:
		'Learn how to set up highlight.io on your Python FastAPI backend API.',
	logoUrl: siteUrl('/images/quickstart/fastapi.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet('FastAPI'),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK to with the FastAPI integration.',
			code: [
				{
					text: `from fastapi import FastAPI, Request

import highlight_io
from highlight_io.integrations.fastapi import FastAPIMiddleware

${init}

app = FastAPI()
app.add_middleware(FastAPIMiddleware)`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Add the following code to your FastAPI app and start the FastAPI server. ' +
				'Visit http://127.0.0.1:5000/hello in your browser. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `from fastapi import FastAPI, Request

import highlight_io
from highlight_io.integrations.fastapi import FastAPIMiddleware

${init}

app = FastAPI()
app.add_middleware(FastAPIMiddleware)


@app.get("/")
async def root(request: Request):
    return {"message": f"This might not be a great idea {5 / 0}"}
`,
					language: 'python',
				},
			],
		},
		setupLogging('fastapi'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	downloadSnippet,
	init,
	setupFrontendSnippet,
	setupLogging,
} from './shared-snippets'

export const PythonAzureContext: QuickStartContent = {
	title: 'Python Azure Functions',
	subtitle: 'Learn how to set up highlight.io with Azure Functions.',
	logoUrl: siteUrl('/images/quickstart/azure.svg'),
	entries: [
		setupFrontendSnippet,
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK. Add the `@observe_handler` decorator to your azure functions.',
			code: [
				{
					text: `import azure.functions as func

import highlight_io
from highlight_io.integrations.azure import observe_handler

${init}


@observe_handler
def main(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        "This HTTP triggered function executed successfully.",
        status_code=200,
    )
`,
					language: 'python',
				},
			],
		},
		{
			title: 'Verify your installation.',
			content:
				'Check that your installation is valid by throwing an error. ' +
				'Add an operation that raises an exception to your azure function. ' +
				'Setup an HTTP trigger and visit your azure function on the internet. ' +
				'You should see a `DivideByZero` error in the [Highlight errors page](https://app.highlight.io/errors) ' +
				'within a few moments.',
			code: [
				{
					text: `import azure.functions as func

import highlight_io
from highlight_io.integrations.azure import observe_handler

${init}


@observe_handler
def main(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        f"Not a good idea: {5 / 0}.",
    )
`,
					language: 'python',
				},
			],
		},
		setupLogging('azure'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { tsconfig } from '../../shared-snippets'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	addIntegrationContent,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSCloudflareContent: QuickStartContent = {
	title: 'Cloudflare Workers',
	subtitle: 'Learn how to set up highlight.io in Cloudflare Workers.',
	logoUrl: siteUrl('/images/quickstart/cloudflare.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['cloudflare']),
		{
			title: `Add the Cloudflare Worker Highlight integration.`,
			content:
				addIntegrationContent('Cloudflare Worker SDK', 'cloudflare') +
				' ' +
				'The `sendResponse` method traces successful requests while `consumeError` reports exceptions. ' +
				'All Highlight data submission uses [waitUntil](https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#waituntil) to make sure that we have no impact on request handling performance.',
			code: [
				{
					text: `import { H } from '@highlight-run/cloudflare'

async function doRequest() {
  return new Response('hello!')
}

export default {
  async fetch(request: Request, env: {}, ctx: ExecutionContext) {
    H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
    console.log('starting some work...')
    try {
      const response = await doRequest()
      H.sendResponse(response)
      return response
    } catch (e: any) {
      H.consumeError(e)
      throw e
    }
  },
}`,
					language: `js`,
				},
			],
		},
		verifyError(
			'cloudflare',
			`export default {
  async fetch(request: Request, env: {}, ctx: ExecutionContext) {
    H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
    H.consumeError(new Error('example error!'))
  },
}`,
		),
		tsconfig,
		setupLogging('cloudflare'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartStep } from '../../QuickstartContent'

export const jsGetSnippet: (slugs: string[]) => QuickStartStep = (slugs) => {
	const packages = slugs.map((slug) => `@highlight-run/${slug}`).join(' ')
	const linkedPackages = slugs
		.map(
			(slug) =>
				`[@highlight-run/${slug}](https://www.npmjs.com/package/@highlight-run/${slug})`,
		)
		.join(', ')
	return {
		title: 'Install the relevant Highlight SDK(s).',
		content: `Install ${linkedPackages} with your package manager.`,
		code: [
			{
				key: 'npm',
				text: `# with npm
npm install --save ${packages}`,
				language: 'bash',
			},
			{
				key: 'yarn',
				text: `# with yarn
yarn add ${packages}`,
				language: 'bash',
			},
			{
				key: 'pnpm',
				text: `# with pnpm
pnpm add ${packages}`,
				language: 'bash',
			},
		],
	}
}

export const initializeNodeSDK: (slug: string) => QuickStartStep = (slug) => ({
	title: 'Initialize the Highlight JS SDK.',
	content: `Initialize the [Highlight JS SDK](${siteUrl(
		'/docs/sdk/nodejs',
	)}) with your project ID.`,
	code: [
		{
			text: `import { H } from '@highlight-run/${slug}'

H.init({projectID: '<YOUR_PROJECT_ID>'})`,
			language: 'js',
		},
	],
})

export const verifyError: (name: string, code?: string) => QuickStartStep = (
	name,
	code,
) => ({
	title: 'Verify that your SDK is reporting errors.',
	content:
		`You'll want to throw an exception in one of your ${name} handlers. ` +
		`Access the API handler and make sure the error shows up in [Highlight](https://app.highlight.io/errors).`,
	...(code
		? {
				code: [
					{
						text: code,
						language: `js`,
					},
				],
		  }
		: []),
})

export const manualError = {
	title: 'Optionally, report manual errors in your app.',
	content: `If you need to report exceptions outside of a handler, use the Highlight SDK.`,
	code: [
		{
			text: `const parsed = H.parseHeaders(request.headers)
H.consumeError(error, parsed?.secureSessionId, parsed?.requestId)`,
			language: 'js',
		},
	],
}

export const setupLogging: (slug: string) => QuickStartStep = (slug) => ({
	title: 'Set up logging.',
	content: `With the JS SDKs, your logs are reported automatically from console methods. See the JS [logging setup guide](${siteUrl(
		'/docs/getting-started/backend-logging/js/overview',
	)}) for more details.`,
})

export const addIntegrationContent = (name: string, slug: string) =>
	`Use the [${name}](${siteUrl(
		`/docs/sdk/${slug}`,
	)}) in your response handler.`
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSExpressContent: QuickStartContent = {
	title: 'Express.js',
	subtitle: 'Learn how to set up highlight.io in Express.js.',
	logoUrl: siteUrl('/images/quickstart/express.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: `Add the Express.js Highlight integration.`,
			content: addIntegrationContent('Node Highlight SDK', 'nodejs'),
			code: [
				{
					text: `import { H, Handlers } from '@highlight-run/node'
// or like this with commonjs
// const { H, Highlight } = require('@highlight-run/node')

const app = express()

const highlightConfig = {
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: 'my-express-app',
	serviceVersion: 'git-sha'
}
H.init(highlightConfig)

// This should be before any controllers (route definitions)
app.use(Handlers.middleware(highlightConfig))

app.get('/', (req, res) => {
  res.send(\`Hello World! ${Math.random()}\`)
})

// This should be before any other error middleware and after all controllers (route definitions)
app.use(Handlers.errorHandler(highlightConfig))

app.listen(8080, () => {
  console.log(\`Example app listening on port 8080\`)
})`,
					language: `js`,
				},
			],
		},
		{
			title: `Try/catch an error manually (without middleware).`,
			content:
				'If you are using express.js async handlers, you will need your own try/catch block that directly calls the highlight SDK to report an error. ' +
				'This is because express.js async handlers do not invoke error middleware.',
			code: [
				{
					text: `app.get('/sync', (req: Request, res: Response) => {
	// do something dangerous...
	throw new Error('oh no! this is a synchronous error');
});

app.get('/async', async (req: Request, res: Response) => {
  try {
    // do something dangerous...
    throw new Error('oh no!');
  } catch (error) {
    const { secureSessionId, requestId } = H.parseHeaders(req.headers);
    H.consumeError(
      error as Error,
      secureSessionId,
      requestId
    );
  } finally {
    res.status(200).json({hello: 'world'});
  }
});`,
					language: `js`,
				},
			],
		},
		verifyError(
			'express.js',
			`app.get('/', (req, res) => {
  throw new Error('sample error!')
  res.send(\`Hello World! ${Math.random()}\`)
})`,
		),
		setupLogging('express'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSFirebaseContent: QuickStartContent = {
	title: 'Firebase',
	subtitle: 'Learn how to set up highlight.io in Firebase Cloud Functions.',
	logoUrl: siteUrl('/images/quickstart/firebase.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: `Add the Firebase Highlight integration.`,
			content: addIntegrationContent('Node Highlight SDK', 'nodejs'),
			code: [
				{
					text: `const highlightNode = require('@highlight-run/node')

// Callable function wrapper
exports.exampleCallable = functions.https.onCall(
  highlightNode.Handlers.firebaseCallableFunctionHandler(
    (data, context) => {
      // ... your handler code here
      return { result: 'useful result!' }
    },
    { projectID: '<YOUR_PROJECT_ID>', serviceName: 'my-firebase-app', serviceVersion: 'git-sha' },
  ),
)

// Http function wrapper
exports.exampleHttp = functions.https.onRequest(
  highlightNode.Handlers.firebaseHttpFunctionHandler(
    (req, res) => {
      // ... your handler code here
      res.json({ result: 'useful result!' })
    },
    { projectID: '<YOUR_PROJECT_ID>' },
  ),
)`,
					language: `js`,
				},
			],
		},
		verifyError(
			'Firebase',
			`exports.exampleCallable = functions.https.onCall(
  highlightNode.Handlers.firebaseCallableFunctionHandler(
    (data, context) => {
      throw new Error('example error!')
      return { result: 'useful result!' }
    },
    { projectID: '<YOUR_PROJECT_ID>', serviceName: 'my-firebase-app', serviceVersion: 'git-sha' },
  ),
)`,
		),
		setupLogging('firebase'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	initializeNodeSDK,
	jsGetSnippet,
	manualError,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSApolloContent: QuickStartContent = {
	title: 'Apollo',
	subtitle: 'Learn how to set up highlight.io on your Apollo Server backend.',
	logoUrl: siteUrl('/images/quickstart/apollo.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node', 'apollo']),
		initializeNodeSDK('node'),
		{
			title: `Add the Apollo Server integration.`,
			content:
				'`ApolloServerHighlightPlugin` is an [Apollo Server](https://www.apollographql.com/docs/apollo-server/) plugin to capture errors in your graphql handlers.',
			code: [
				{
					text: `import { ApolloServer } from '@apollo/server'
import { ApolloServerHighlightPlugin } from '@highlight-run/apollo'
// on legacy Apollo V3, use the following import 
// import { ApolloServerV3HighlightPlugin as ApolloServerHighlightPlugin } from '@highlight-run/apollo'

// ...

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerHighlightPlugin({ projectID: '<YOUR_PROJECT_ID>', serviceName: 'my-apollo-app', serviceVersion: 'git-sha' })],
})`,
					language: `js`,
				},
			],
		},
		manualError,
		verifyError(
			'apollo',
			`const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      books: () => {
        throw new Error('a sample error!');
      },
    },
  },
});`,
		),
		setupLogging('apollo'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JStRPCContent: QuickStartContent = {
	title: 'tRPC',
	subtitle: 'Learn how to set up highlight.io in tRPC.',
	logoUrl: siteUrl('/images/quickstart/javascript.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add the tRPC Highlight integration.',
			content: addIntegrationContent('Node Highlight SDK', 'nodejs'),
			code: [
				{
					text: `import { createNextApiHandler } from '@trpc/server/adapters/next'
import { Handlers } from '@highlight-run/node'

export default createNextApiHandler({
  // ... your config
  onError: ({ error, req }) => {
    // ... your own error handling logic here
    Handlers.trpcOnError({ error, req }, { projectID: '<YOUR_PROJECT_ID>', serviceName: 'my-trpc-app', serviceVersion: 'git-sha' })
  },
})
`,
					language: 'js',
				},
			],
		},
		verifyError('tRPC'),
		setupLogging('trpc'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	initializeNodeSDK,
	jsGetSnippet,
	manualError,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSNodeContent: QuickStartContent = {
	title: 'Node.js',
	subtitle: 'Learn how to set up highlight.io in Node.js.',
	logoUrl: siteUrl('/images/quickstart/node.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		manualError,
		verifyError(
			'Node.js',
			`const onError = (request, error) => {
  const parsed = H.parseHeaders(request.headers)
  H.consumeError(error, parsed.secureSessionId, parsed.requestId)
}

const main = () => {
  try {
    throw new Error('example error!')
  } catch (e) {
    onError(e)
  }
}

`,
		),
		setupLogging('nodejs'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	addIntegrationContent,
	initializeNodeSDK,
	jsGetSnippet,
	setupLogging,
	verifyError,
} from './shared-snippets'

export const JSAWSLambdaContent: QuickStartContent = {
	title: 'Error Handling from Python AWS Lambda',
	subtitle: 'Learn how to set up highlight.io on AWS Lambda.',
	logoUrl: siteUrl('/images/quickstart/aws-lambda.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Add the AWS Lambda Node.js Highlight integration.',
			content: addIntegrationContent('Node Highlight SDK', 'nodejs'),
			code: [
				{
					text: `import type { APIGatewayEvent } from 'aws-lambda'
import { H, Handlers } from '@highlight-run/node'

// setup console log recording
H.init({ projectID: '<YOUR_PROJECT_ID>' })
// wrap your lambda with an error handler
export const handler = Handlers.serverlessFunction(
  (event?: APIGatewayEvent) => {
    console.log('hello, world!', {queryString: event?.queryStringParameters});
    return {statusCode: 200};
  },
  { projectID: '<YOUR_PROJECT_ID>', serviceName: 'my-lambda-function', serviceVersion: 'git-sha' },
)
`,
					language: 'js',
				},
			],
		},
		verifyError('AWS Lambda'),
		setupLogging('aws'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import { jsGetSnippet, manualError, verifyError } from './shared-snippets'

export const JSNestContent: QuickStartContent = {
	title: 'Nest.js',
	subtitle: 'Learn how to set up highlight.io in Nest.js.',
	logoUrl: siteUrl('/images/quickstart/nestjs.svg'),
	entries: [
		frontendInstallSnippet,
		jsGetSnippet(['nest']),
		{
			title: 'Add the @highlight-run/nest app middleware.',
			content:
				'Use the `HighlightErrorFilter` middleware to capture backend errors.',
			code: [
				{
					text: `import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HighlightInterceptor } from '@highlight-run/nest'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalInterceptors(
    new HighlightInterceptor({
      projectID: '<YOUR_PROJECT_ID>',
      serviceName: 'my-nestjs-app',
      serviceVersion: 'git-sha'
    })
  )
  await app.listen(3000)
}
bootstrap()
`,
					language: 'js',
				},
			],
		},
		manualError,
		verifyError(
			'Nest.js',
			`import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    console.log('hello, world!')
    console.warn('whoa there! ', Math.random())
    if (Math.random() < 0.2) {
      // error will be caught by the HighlightErrorFilter
      throw new Error(\`a random error occurred! ${Math.random()}\`)
    }
    return 'Hello World!'
  }
}
`,
		),
		{
			title: 'Set up logging.',
			content: `Start sending logs to Highlight! Follow the [logging setup guide](${siteUrl(
				'/docs/getting-started/backend-logging/js/nestjs',
			)}) to get started.`,
		},
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartStep } from '../../QuickstartContent'

export const installSdk: QuickStartStep = {
	title: 'Install the Highlight Java SDK.',
	content: 'Add Highlight to your maven pom file.',
	code: [
		{
			text: `<dependency>
	<groupId>io.highlight</groupId>
	<artifactId>highlight-sdk</artifactId>
	<version>latest</version>
</dependency>`,
			language: 'text',
		},
	],
}

export const initializeSdk: QuickStartStep = {
	title: 'Initialize the Highlight Java SDK.',
	content: '`Highlight.init()` initializes the Highlight backend SDK.',
	code: [
		{
			text: `HighlightOptions options = HighlightOptions.builder("<YOUR_PROJECT_ID>")
	.version("1.0.0")
	.environment("development")
	.build();
	
	Highlight.init(options);`,
			language: 'java',
		},
	],
}

export const customError: QuickStartStep = {
	title: 'Record custom errors. (optional)',
	content:
		'If you want to explicitly send an error to Highlight, you can use the `Highlight.captureException()` method.',
	code: [
		{
			text: `try {
} catch (Exception ex) {
	Highlight.captureException(exception);
}`,
			language: 'java',
		},
	],
}

export const verifyErrors: QuickStartStep = {
	title: 'Verify your errors are being recorded.',
	content:
		"Now that you've set up the Middleware, verify that the backend error handling works by consuming an error from traced code.",
}

export const sessionUsage: QuickStartStep = {
	title: 'Using sessions',
	content:
		'When everything is finished and working, you can try to use sessions. You can find more information about the `SESSION_ID` here [parseHeaders](https://www.highlight.io/docs/sdk/nodejs#HparseHeaders)',
	code: [
		{
			text: `HighlightSession session = new HighlightSession("SESSION_ID");
	session.captureException(new NullPointerException("This shouldn't happen"));
	session.captureLog(Severity.INFO, "Just another message");
	session.captureRecord(HighlightRecord.log()
		.severity(Severity.warn("Internal", Priority.HIGH))
		.message("Just another message")
		.requestId("REQUEST_ID")
		.attributes(attributes -> attributes.put("application.user.name", "NgLoader"))
		.build());`,
			language: 'java',
		},
	],
}

export const setUpLogging: (slug: string) => QuickStartStep = (slug) => ({
	title: 'Set up logging.',
	content: `Start sending logs to Highlight! Follow the [logging setup guide](${siteUrl(
		`/docs/getting-started/backend-logging/java/overview`,
	)}) to get started.`,
})
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	customError,
	installSdk,
	initializeSdk,
	setUpLogging,
	verifyErrors,
	sessionUsage,
} from './shared-snippets'

export const JavaOtherContent: QuickStartContent = {
	title: 'Java',
	subtitle: 'Learn how to set up highlight.io on your Java backend.',
	logoUrl: siteUrl('/images/quickstart/java.svg'),
	entries: [
		installSdk,
		initializeSdk,
		{
			title: 'Add Highlight logger.',
			content:
				'errors will automatically record raised exceptions and send them to Highlight.',
			code: [
				{
					text: `Coming soon`,
					language: 'java',
				},
			],
		},
		verifyErrors,
		customError,
		sessionUsage,
		setUpLogging('other'),
	],
}
import { fullstackMappingLink } from '../frontend/shared-snippets'
import { QuickStartStep } from '../QuickstartContent'

export const frontendInstallSnippet: QuickStartStep = {
	title: 'Add `tracingOrigins` to your client Highlight snippet.',
	content: `This backend SDK requires one of the Highlight frontend SDKs to be installed, so please make sure you've followed the [fullstack mapping guide](${fullstackMappingLink}#How-can-I-start-using-this) first.`,
	code: [
		{
			text: `H.init("<YOUR_PROJECT_ID>", {
  tracingOrigins: ['localhost', 'example.myapp.com/backend'],
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
});`,
			language: 'js',
		},
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartStep } from '../../QuickstartContent'

export const installSdk: QuickStartStep = {
	title: 'Install the Highlight Ruby SDK.',
	content: 'Add Highlight to your Gemfile and install with Bundler.',
	code: [
		{
			text: `gem "highlight_io"

bundle install`,
			language: 'bash',
		},
	],
}

export const initializeSdk: QuickStartStep = {
	title: 'Initialize the Highlight Ruby SDK.',
	content:
		"`Highlight::H.new` initializes the SDK and allows you to call the singleton `Highlight::H.instance`. Setting your project id also lets Highlight record errors for background tasks and processes that aren't associated with a frontend session.",
	code: [
		{
			text: `require "highlight"

Highlight::H.new("<YOUR_PROJECT_ID>") do |c|
  c.service_name = "my-app"
  c.service_version = "1.0.0"
end`,
			language: 'ruby',
		},
	],
}

export const customError: QuickStartStep = {
	title: 'Record custom errors. (optional)',
	content:
		'If you want to explicitly send an error to Highlight, you can use the `record_exception` method within traced code.',
	code: [
		{
			text: `Highlight::H.instance.record_exception(e)`,
			language: 'ruby',
		},
	],
}

export const verifyErrors: QuickStartStep = {
	title: 'Verify your errors are being recorded.',
	content:
		"Now that you've set up the Middleware, verify that the backend error handling works by consuming an error from traced code.",
}

export const setUpLogging: (slug: string) => QuickStartStep = (slug) => ({
	title: 'Set up logging.',
	content: `Start sending logs to Highlight! Follow the [logging setup guide](${siteUrl(
		`/docs/getting-started/backend-logging/ruby/${slug}`,
	)}) to get started.`,
})
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customError,
	initializeSdk,
	installSdk,
	setUpLogging,
	verifyErrors,
} from './shared-snippets'

export const RubyOtherContent: QuickStartContent = {
	title: 'Ruby',
	subtitle:
		'Learn how to set up highlight.io on your non-Rails Ruby backend.',
	logoUrl: siteUrl('/images/quickstart/ruby.svg'),
	entries: [
		frontendInstallSnippet,
		installSdk,
		initializeSdk,
		{
			title: 'Add Highlight tracing.',
			content:
				'`trace` will automatically record raised exceptions and send them to Highlight.',
			code: [
				{
					text: `require "highlight"

Highlight::H.instance.trace(nil, nil) do
  # your code here
end`,
					language: 'ruby',
				},
			],
		},
		verifyErrors,
		customError,
		setUpLogging('other'),
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customError,
	initializeSdk,
	installSdk,
	setUpLogging,
} from './shared-snippets'

export const RubyRailsContent: QuickStartContent = {
	title: 'Rails',
	subtitle: 'Learn how to set up highlight.io on your Rails backend.',
	logoUrl: siteUrl('/images/quickstart/rails.svg'),
	entries: [
		frontendInstallSnippet,
		installSdk,
		initializeSdk,
		{
			title: 'Add the Highlight middleware.',
			content:
				'`with_highlight_context` can be used as a Rails `around_action` to wrap any controller actions to automatically record errors.',
			code: [
				{
					text: `require "highlight"

class ApplicationController < ActionController::Base
  include Highlight::Integrations::Rails

  around_action :with_highlight_context
end`,
					language: 'ruby',
				},
			],
		},
		{
			title: 'Verify your errors are being recorded.',
			content:
				"Now that you've set up the Middleware, you can verify that the backend error handling works by throwing an error in a controller. Visit the [highlight errors page](http://app.highlight.io/errors) and check that backend errors are coming in.",
			code: [
				{
					text: `class ArticlesController < ApplicationController
  def index
    1/0
  end
end`,
					language: 'ruby',
				},
			],
		},
		customError,
		setUpLogging('rails'),
	],
}
export const tsconfig = {
	title: 'Having TypeScript issues?',
	content:
		'Using our library requires setting skipLibCheck because of one of our dependencies that references node types. ' +
		'At runtime, this does not cause issues because of dynamic imports and other polyfilling done to ensure the sdk works in the cloud flare worker runtime, but the types are still referenced.\n',
	code: [
		{
			text: `{
  /* ... your other options ... */
  "compilerOptions": {
    /* required due to our sdk's usage of 'opentelemetry-sdk-workers'
       which works around node syntax in its dependencies by dynamically replacing
       the imported javascript bundle, but does not replace the '@types/node' dependency */
    "skipLibCheck": true,
    "types": ["@cloudflare/workers-types"]
  },
}
`,
			language: `json`,
		},
	],
}
import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets'

export const DockerContent: QuickStartContent = {
	title: 'Logging in Docker or Docker Compose',
	subtitle: 'Ship docker logs to highlight using the fluentd log driver.',
	entries: [
		{
			title: 'Setup the fluentd log driver.',
			content:
				'Use the [Fluentd logging driver](https://docs.docker.com/config/containers/logging/fluentd/) to route logs to highlight.',
			code: [
				{
					text: `docker run --log-driver=fluentd --log-opt fluentd-address=otel.highlight.io:24224 --log-opt tag=highlight.project_id=<YOUR_PROJECT_ID> -t ubuntu echo "Testing a log message"`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Setup the fluentd log driver in docker compose.',
			content:
				'Use the following syntax if you are using [docker compose](https://docs.docker.com/config/containers/logging/configure/).',
			code: [
				{
					text: `x-logging:
  &highlight-logging
    driver: fluentd
    options:
        fluentd-address: "otel.highlight.io:24224"
        fluentd-async: "true"
        fluentd-sub-second-precision: "true"
        tag: "highlight.project_id=<YOUR_PROJECT_ID>"
services:
    example:
        logging: *highlight-logging
        image: ubuntu
        container_name: ubuntu
        command:
            - echo
            - "hello, highlight.io!"
`,
					language: 'yaml',
				},
			],
		},
		verifyLogs,
	],
}
import { QuickStartStep } from '../../QuickstartContent'

export const logrusExample: (
	ctx: string,
	detailedEx?: string,
) => QuickStartStep[] = (ctx, detailedEx) => [
	{
		title: 'Call logrus methods while passing the request context.',
		content: `The request context allows highlight to associate logs with the incoming frontend session and network request.`,
		code: [
			{
				text: `logrus.WithContext(${ctx}).WithField("user", "bob").Infof("hello, %s!", "world")`,
				language: 'go',
			},
		],
	},
	...(detailedEx
		? [
				{
					title: 'Call the Highlight logging SDK.',
					content:
						'Use our SDK to configure [logrus](https://pkg.go.dev/github.com/sirupsen/logrus), and use it as normal.',
					code: [
						{
							text: detailedEx,
							language: 'go',
						},
					],
				},
		  ]
		: []),
]
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'
import { logrusExample } from './shared-snippets'

export const GoFiberLogContent: QuickStartContent = {
	title: 'Logging from a Go Fiber App',
	subtitle: 'Learn how to set up highlight.io Go log ingestion with fiber.',
	logoUrl: siteUrl('/images/quickstart/go.svg'),
	entries: [
		previousInstallSnippet('go'),
		...logrusExample(
			'c.Context()',
			`package main

import (
  "context"
  "github.com/highlight/highlight/sdk/highlight-go"
  "github.com/highlight/highlight/sdk/highlight-go/log"
  "github.com/sirupsen/logrus"
)

func main() {
  // setup the highlight SDK
  highlight.SetProjectID("<YOUR_PROJECT_ID>")
  highlight.Start(
    highlight.WithServiceName("my-fiber-app"),
    highlight.WithServiceVersion("git-sha"),
  )
  defer highlight.Stop()

  // setup highlight logrus hook
  hlog.Init()
  // if you don't want to get stdout / stderr output, add the following uncommented
  // hlog.DisableOutput()

  app := fiber.New()
  app.Use(logger.New())
  // setup go fiber to use the highlight middleware for header parsing
  app.Use(highlightFiber.Middleware())

  app.Get("/", func(c *fiber.Ctx) error {
  	// in handlers, use logrus with the UserContext to associate logs with the frontend session.
	logrus.WithContext(c.Context()).Infof("hello from highlight.io")
	return c.SendString("Hello, World!")
  })

  logrus.Fatal(app.Listen(":3456"))
}`,
		),
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'
import { logrusExample } from './shared-snippets'

export const GoOtherLogContent: QuickStartContent = {
	title: 'Logging from a Go App',
	subtitle: 'Learn how to set up highlight.io Go log ingestion with logrus.',
	logoUrl: siteUrl('/images/quickstart/go.svg'),
	entries: [
		previousInstallSnippet('go'),
		...logrusExample(
			'ctx',
			`package main

import (
  "context"
  "github.com/highlight/highlight/sdk/highlight-go"
  "github.com/highlight/highlight/sdk/highlight-go/log"
  "github.com/sirupsen/logrus"
)

func main() {
  // setup the highlight SDK
  highlight.SetProjectID("<YOUR_PROJECT_ID>")
  highlight.Start(
    highlight.WithServiceName("my-app"),
    highlight.WithServiceVersion("git-sha"),
  )
  defer highlight.Stop()

  // setup highlight logrus hook
  hlog.Init()
  // if you don't want to get stdout / stderr output, add the following uncommented
  // hlog.DisableOutput()

  // if in a request, provide context to associate logs with frontend sessions
  ctx := context.TODO()
  // send logs
  logrus.WithContext(ctx).WithField("hello", "world").Info("welcome to highlight.io")
  // send logs with a string message severity
  lvl, _ := logrus.ParseLevel("warn")
  logrus.WithContext(ctx).Log(lvl, "whoa there")
}`,
		),
		verifyLogs,
	],
}
import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets'

export const FluentForwardContent: QuickStartContent = {
	title: 'Shipping logs with Fluent Forward',
	subtitle:
		'Set up highlight.io log ingestion via Fluent Forward (fluentd / fluentbit protocol).',
	entries: [
		{
			title: 'Setup fluentd / fluent bit ingest.',
			content:
				'Route your [fluentd / fluent bit](https://docs.fluentbit.io/manual/pipeline/outputs/forward/) to forward://otel.highlight.io:24224. ' +
				'Regardless of the  way you are using fluentbit, configure the tag to `highlight.project_id=YOUR_PROJECT_ID` to route the logs to the given highlight project',
			code: [
				{
					text: `bin/fluent-bit -i cpu -t highlight.project_id=YOUR_PROJECT_ID -o forward://otel.highlight.io:24224`,
					language: 'bash',
				},
			],
		},
		{
			title: 'Running the fluent agent.',
			content:
				'You may be running a fluent agent locally or [in docker](https://hub.docker.com/r/fluent/fluent-bit/). In that case, you would use the fluent-bit.conf',
			code: [
				{
					text: `[INPUT]
    name                tail
    tag                 <YOUR_PROJECT_ID>
    path                /var/log/your_log_file.log
    path_key            file_path

[INPUT]
    name                tail
    tag                 <YOUR_PROJECT_ID>
    path                /var/log/nginx/another_log_file.txt
    path_key            file_path

[FILTER]
    Name                record_modifier
    Match               *
    Record              hostname my-hostname

[OUTPUT]
    Name                forward
    Match               *
    Host                otel.highlight.io
    Port                24224
`,
					language: 'yaml',
				},
			],
		},
		{
			title: 'Setting up for AWS ECS?',
			content:
				'If you are setting up for AWS Elastic Container Services, check out our dedicated [docs for AWS ECS.](/docs/getting-started/backend-logging/hosting/aws#aws-ecs-containers) .',
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { downloadSnippet } from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const PythonLoguruLogContent: QuickStartContent = {
	title: 'Logging from Python with Loguru',
	subtitle: 'Learn how to set up highlight.io with logs from Python Loguru.',
	logoUrl: siteUrl('/images/quickstart/python-loguru.png'),
	entries: [
		previousInstallSnippet('python'),
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content:
				'Setup the SDK with `instrument_logging` disabled, while passing the highlight logging handler to [loguru](https://github.com/Delgan/loguru#readme). ' +
				'`instrument_logging=False` must be passed to make sure the loguru handler does not collide with built-in `logging` instrumentation.',
			code: [
				{
					text: `import highlight_io

H = highlight_io.H("<YOUR_PROJECT_ID>", instrument_logging=False)`,
					language: 'python',
				},
			],
		},
		{
			title: 'Use loguru!',
			content:
				'Logs are reported automatically from loguru logging methods. ' +
				'Visit the [highlight logs portal](http://app.highlight.io/logs) and check that backend logs are coming in.',
			code: [
				{
					text: `import highlight_io
from loguru import logger

H = highlight_io.H(
	"<YOUR_PROJECT_ID>",
	instrument_logging=False,
	service_name="my-app",
	service_version="git-sha",
)

logger.add(
	H.logging_handler,
	format="{message}",
	level="INFO",
	backtrace=True,
	serialize=True,
)

def main():
    logger.debug("That's it, beautiful and simple logging!", nice="one")
    context_logger = logger.bind(ip="192.168.0.1", user="someone")
	context_logger.info("Contextualize your logger easily")
`,
					language: 'python',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { downloadSnippet } from '../../backend/python/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const PythonOtherLogContent: QuickStartContent = {
	title: 'Logging from a Python App',
	subtitle:
		'Learn how to set up highlight.io Python log ingestion without a logging library.',
	logoUrl: siteUrl('/images/quickstart/python.svg'),
	entries: [
		previousInstallSnippet('python'),
		downloadSnippet(),
		{
			title: 'Initialize the Highlight SDK.',
			content: 'Setup the SDK with `instrument_logging` enabled.',
			code: [
				{
					text: `import highlight_io

H = highlight_io.H("<YOUR_PROJECT_ID>", instrument_logging=True)`,
					language: 'python',
				},
			],
		},
		{
			title: 'Call the built-in Python logging library.',
			content:
				'Logs are reported automatically from the builtin logging methods (as long as `instrument_logging=True` is provided to the `highlight_io.H` constructor). ' +
				'Visit the [highlight logs portal](http://app.highlight.io/logs) and check that backend logs are coming in. ' +
				'Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `import logging

def main():
    logging.info('hello, world!')
    logging.warn('whoa there', {'key': 'value'})
`,
					language: 'python',
				},
			],
		},
		verifyLogs,
	],
}
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'
import { jsGetSnippet } from '../../backend/js/shared-snippets'

export const JSPinoHTTPJSONLogContent: QuickStartContent = {
	title: 'Logging with Pino.JS',
	subtitle: 'Learn how to set up highlight.io log ingestion for Pino.JS.',
	entries: [
		previousInstallSnippet('nodejs'),
		jsGetSnippet(['pino']),
		{
			title: 'Setup the Pino HTTP transport.',
			content:
				'The Pino HTTP transport will send JSON logs to highlight.io. ' +
				'Make sure to set the `project` and `service` query string parameters.',
			code: [
				{
					text: `import pino from 'pino'

const logger = pino({
    level: 'info',
    transport: {
        targets: [
            {
                target: '@highlight-run/pino',
                options: {
                    projectID: '<YOUR_PROJECT_ID>',
                },
                level: 'info',
            },
        ],
    },
})

logger.info({ key: 'my-value' }, 'hello, highlight.io!')`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { tsconfig } from '../../shared-snippets'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSCloudflareLoggingContent: QuickStartContent = {
	title: 'Logging in Cloudflare Workers',
	subtitle:
		'Learn how to set up highlight.io log ingestion in Cloudflare Workers.',
	logoUrl: siteUrl('/images/quickstart/cloudflare.svg'),
	entries: [
		previousInstallSnippet('cloudflare'),
		{
			title: `Add the Cloudflare Worker Highlight integration.`,
			content:
				'All you need to start recording your console methods is call `H.init`. ' +
				'All Highlight data submission uses [waitUntil](https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#waituntil) to make sure that we have no impact on request handling performance.',
			code: [
				{
					text: `import { H } from '@highlight-run/cloudflare'

export default {
  async fetch(request: Request, env: {}, ctx: ExecutionContext) {
    H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
    console.log('starting some work...')
    // ...
  },
}`,
					language: `js`,
				},
			],
		},
		tsconfig,
		verifyLogs,
	],
}
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSWinstonHTTPJSONLogContent: QuickStartContent = {
	title: 'Logging with Winston.JS',
	subtitle: 'Learn how to set up highlight.io log ingestion for Winston JS.',
	entries: [
		previousInstallSnippet('nodejs'),
		{
			title: 'Setup the Winston HTTP transport.',
			content:
				'The Winston HTTP transport will send JSON logs to highlight.io',
			code: [
				{
					text: `import {createLogger, format, transports} from 'winston';


const highlightTransport = new transports.Http({
    host: 'pub.highlight.run',
    path: "/v1/logs/json",
    ssl: true,
    headers: {
        'x-highlight-project': '<YOUR_PROJECT_ID>',
        'x-highlight-service': 'EXAMPLE_NODEJS_SERVICE',
    },
})

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.json(),
        format.errors({ stack: true }),
        format.timestamp(),
        format.prettyPrint(),
    ),
    transports: [new transports.Console(), highlightTransport],
})`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import {
	initializeNodeSDK,
	jsGetSnippet,
} from '../../backend/js/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSOtherLogContent: QuickStartContent = {
	title: 'Logging in a JS App',
	subtitle:
		'Learn how to set up highlight.io JS log ingestion without a logging library.',
	logoUrl: siteUrl('/images/quickstart/javascript.svg'),
	entries: [
		previousInstallSnippet('js'),
		jsGetSnippet(['node']),
		initializeNodeSDK('node'),
		{
			title: 'Call built-in console methods.',
			content:
				'Logs are automatically recorded by the highlight SDK. Arguments passed as a dictionary as the second parameter will be interpreted as structured key-value pairs that logs can be easily searched by.',
			code: [
				{
					text: `module.exports = function() {
    console.log('hey there!');
    console.warn('whoa there', {'key': 'value'});
}`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSNestLogContent: QuickStartContent = {
	title: 'Logging from Nest.js',
	subtitle: 'Learn how to set up highlight.io log ingestion in Nest.js.',
	logoUrl: siteUrl('/images/quickstart/nestjs.svg'),
	entries: [
		previousInstallSnippet('nestjs'),
		{
			title: 'Add the @highlight-run/nest app middleware.',
			content:
				'Use the `HighlightLogger` middleware to record backend logs in highlight.io',
			code: [
				{
					text: `import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HighlightLogger } from '@highlight-run/nest'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useLogger(
    new HighlightLogger({
      projectID: '<YOUR_PROJECT_ID>',
      serviceName: 'my-nestjs-app',
      serviceVersion: 'git-sha'
    })
  )
  await app.listen(3000)
}
bootstrap()
`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}
import { QuickStartContent } from '../QuickstartContent'
import { curlExample, curlExampleRaw, verifyLogs } from './shared-snippets'

export const HTTPContent: QuickStartContent = {
	title: 'Shipping logs over HTTPS with curl',
	subtitle: 'Set up highlight.io log ingestion over HTTPS.',
	entries: [curlExampleRaw, curlExample, verifyLogs],
}
import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets'

export const FileContent: QuickStartContent = {
	title: 'Logging from a file',
	subtitle:
		'Set up log ingestion using an OpenTelemetry collector with the filelog receiver.',
	entries: [
		{
			title: 'Define your OpenTelemetry configuration.',
			content:
				'Setup the following OpenTelemetry collector. Check out our [example here](https://github.com/highlight/highlight/tree/main/e2e/opentelemetry/filelog).',
			code: [
				{
					text: `receivers:
    filelog:
        include: [/watch.log]
        start_at: beginning
exporters:
    otlp/highlight:
        endpoint: 'https://otel.highlight.io:4317'
processors:
    attributes/highlight-project:
        actions:
            - key: highlight.project_id
              value: '<YOUR_PROJECT_ID>'
              action: insert
    batch:
service:
    pipelines:
        logs:
            receivers: [filelog]
            processors: [attributes/highlight-project, batch]
            exporters: [otlp/highlight]
`,
					language: 'yaml',
				},
			],
		},
		{
			title: 'Run the collector',
			content:
				'Run the [OpenTelemetry collector](https://opentelemetry.io/docs/collector/getting-started/) to start streaming the file to highlight.',
			code: [
				{
					text: `docker run -v /my/file/to/watch.log:/watch.log -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml otel/opentelemetry-collector-contrib`,
					language: 'bash',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JavaOtherLogContent: QuickStartContent = {
	title: 'Java',
	subtitle: 'Learn how to set up highlight.io Java log ingestion.',
	logoUrl: siteUrl('/images/quickstart/java.svg'),
	entries: [
		previousInstallSnippet('java'),
		{
			title: 'Install the Highlight Java SDK.',
			content: 'Add Highlight to your maven pom file.',
			code: [
				{
					text: `<dependency>
	<groupId>io.highlight</groupId>
	<artifactId>highlight-sdk</artifactId>
	<version>latest</version>
</dependency>`,
					language: 'text',
				},
			],
		},
		{
			title: 'Initialize the Highlight Java SDK.',
			content:
				'`Highlight.init()` initializes the Highlight backend SDK.',
			code: [
				{
					text: `HighlightOptions options = HighlightOptions.builder("<YOUR_PROJECT_ID>")
			.version("1.0.0")
			.environment("development")
			.build();
			
			Highlight.init(options);`,
					language: 'java',
				},
			],
		},
		{
			title: 'Set up and call the Highlight Logger.',
			content:
				'Highlight.captureLog() will record and send logs to Highlight.',
			code: [
				{
					text: `Highlight.captureLog(Severity.INFO, "Just another message");`,
					language: 'java',
				},
			],
		},
		{
			title: 'Set up and call the Highlight custom records.',
			content:
				'Highlight.captureRecord() will send custom defined logs to Highlight.',
			code: [
				{
					text: `Highlight.captureRecord(HighlightRecord.log()
  .severity(Severity.warn("Internal", Priority.HIGH))
  .message("Just another message")
  .requestId("REQUEST_ID")
  .attributes(attributes -> attributes.put("application.user.name", "NgLoader"))
  .build());`,
					language: 'java',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../utils/urls'
import { QuickStartStep } from '../QuickstartContent'

export const previousInstallSnippet: (slug: string) => QuickStartStep = (
	slug,
) => ({
	title: 'Set up your frontend highlight.io integration.',
	content: `First, make sure you've followed the [frontend getting started](${siteUrl(
		'/docs/getting-started/overview',
	)}) guide.`,
})

export const verifyLogs: QuickStartStep = {
	title: 'Verify your backend logs are being recorded.',
	content:
		'Visit the [highlight logs portal](http://app.highlight.io/logs) and check that backend logs are coming in.',
}

export const curlExample: QuickStartStep = {
	title: 'Send structured logs from curl via the OTLP HTTPS protocol.',
	content:
		'Get started quickly with logs transmitted over the OTLP HTTPS protocol.',
	code: [
		{
			text: `curl -X POST https://otel.highlight.io:4318/v1/logs \\
-H 'Content-Type: application/json' \\
-d '{
      "resourceLogs": [
        {
          "resource": {
            "attributes": [
              {
                  "key": "service.name",
                  "value": {
                      "stringValue": "my-service"
                  }
              }
          ]
          },
          "scopeLogs": [
            {
              "scope": {},
              "logRecords": [
                {
                  "timeUnixNano": "'$(date +%s000000000)'",
                  "severityNumber": 9,
                  "severityText": "Info",
                  "name": "logA",
                  "body": {
                    "stringValue": "Hello, world! This is sent from a curl command."
                  },
                  "attributes": [
                    {
                      "key": "highlight.project_id",
                      "value": {
                        "stringValue": "<YOUR_PROJECT_ID>"
                      }
                    },
                    {
                      "key": "foo",
                      "value": {
                        "stringValue": "bar"
                      }
                    }
                  ],
                  "traceId": "08040201000000000000000000000000",
                  "spanId": "0102040800000000"
                }
              ]
            }
          ]
        }
      ]
    }'`,
			language: 'bash',
		},
	],
}

export const curlExampleRaw: QuickStartStep = {
	title: 'Send raw logs over HTTPS via curl.',
	content: 'Get started quickly with logs transmitted over HTTPS.',
	code: [
		{
			text: `curl -X POST https://pub.highlight.io/v1/logs/raw?project=YOUR_PROJECT_ID&service=my-backend \\
-d 'hello, world! this is the log message'`,
			language: 'bash',
		},
	],
}
import { QuickStartContent } from '../QuickstartContent'
import { curlExample, curlExampleRaw, verifyLogs } from './shared-snippets'

export const SyslogContent: QuickStartContent = {
	title: 'Shipping Syslog Structured Logs',
	subtitle:
		'Configure Syslog to ship logs to highlight, formatted in RFC5424.',
	entries: [
		{
			title: 'Send syslog logs.',
			content: 'Send syslog logs over TLS to syslog.highlight.io:34302.',
			code: [
				{
					text: `echo "<0>1 2021-03-31T16:00:00-08:00 test-service cron-12345 74440 cron-12345 - hello this is a test" | ncat --ssl syslog.highlight.io 34302`,
					language: 'bash',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const HostingFlyIOLogContent: QuickStartContent = {
	title: 'Logging with the Fly.io Log Shipper',
	subtitle:
		'Learn how to setup Highlight log ingestion on [Fly.io](https://fly.io/blog/shipping-logs/). ' +
		'As a prerequisite, we assume you already have an application ' +
		'deployed on Fly.io and `flyctl` configured locally.',
	logoUrl: siteUrl('/images/quickstart/fly-io.svg'),
	entries: [
		{
			title: 'Configure and launch the fly.io logs shipper, configured for the highlight log drain.',
			content:
				'No other work is needed on the side of your application, ' +
				'as fly apps are already sending monitoring information ' +
				'back to fly which we can read. ' +
				'Check out the `README.md` for more details.',
			code: [
				{
					text: `# spin up the fly log shipper image
fly launch --image ghcr.io/superfly/fly-log-shipper:latest`,
					language: 'bash',
				},
				{
					text: `# set the org for your deployment
fly secrets set ORG=personal`,
					language: 'bash',
				},
				{
					text: `# give the logs shipper access to other containers' logs
fly secrets set ACCESS_TOKEN=$(fly auth token)`,
					language: 'bash',
				},
				{
					text: `# set to configure your highlight project. 
# this tells to log shipper to send data to highlight.
fly secrets set HIGHLIGHT_PROJECT_ID=<YOUR_PROJECT_ID>`,
					language: 'bash',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const HostingRenderLogContent: QuickStartContent = {
	title: 'Logging with Render',
	subtitle:
		'Learn how to setup Highlight log ingestion on Render as a log stream. ' +
		'As a prerequisite, we assume you already have an application ' +
		'deployed on Render.',
	logoUrl: siteUrl('/images/quickstart/render.png'),
	entries: [
		{
			title: 'Visit your Render settings and find the Log Streams tab.',
			content:
				'Visit your [Dashboard](https://dashboard.render.com), then click `Settings` ' +
				'under your account dropdown in the top right corner. ' +
				'Then click the `Log Streams` tab on the left.',
		},
		{
			title: 'Click Add Log Stream and configure the endpoint.',
			content:
				'Enter `syslog.highlight.io:34302` for the [Log Stream](https://render.com/docs/log-streams) endpoint and your [highlight project ID](https://app.highlight.io/setup) for the token.',
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const HostingVercelLogContent: QuickStartContent = {
	title: 'Logging with the Vercel Log Drain',
	subtitle: 'Learn how to setup Highlight log ingestion on Vercel.',
	logoUrl: siteUrl('/images/quickstart/vercel.svg'),
	entries: [
		{
			title: 'Setup the Highlight Vercel integration.',
			content:
				'Visit the [Vercel Highlight Integration page](https://vercel.com/integrations/highlight) to install it in your account. ' +
				'A log drain will automatically be created for all projects you grant access to.',
		},
		verifyLogs,
	],
}
import { QuickStartContent } from '../QuickstartContent'
import { verifyLogs } from './shared-snippets'

export const SystemdContent: QuickStartContent = {
	title: 'Shipping Systemd Structured Logs',
	subtitle: 'Configure Systemd to ship logs to highlight.',
	entries: [
		{
			title: 'Install OpenTelemetry Collector Contrib locally',
			content:
				'[See here](https://opentelemetry.io/docs/collector/getting-started/#linux-packaging) for instructions on installing the collector. ' +
				'We assume that systemd/systemctl are already set up. ' +
				'Check out the following [OpenTelemetry journald receiver docs](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/189a64b21cfd67998b334228a423595591dedae0/receiver/journaldreceiver#setup-and-deployment) ' +
				'that provide additional guidance on installation.',
		},
		{
			title: 'Define your OpenTelemetry configuration.',
			content:
				'Setup the Contrib OpenTelemetry collector. Check out our [example here](https://github.com/highlight/highlight/tree/main/e2e/opentelemetry/journald). ' +
				'Make sure that the journald directory is correct for your systemd/systemctl setup.',
			code: [
				{
					text: `receivers:
    journald:
        directory: /var/log/journal
exporters:
    logging:
        sampling_initial: 10
        sampling_thereafter: 1000
    otlp/highlight:
        endpoint: 'https://otel.highlight.io:4317'
processors:
    attributes/highlight-project:
        actions:
            - key: highlight.project_id
              value: '<YOUR_PROJECT_ID>'
              action: insert
    batch:
service:
    pipelines:
        logs:
            receivers: [journald]
            processors: [attributes/highlight-project, batch]
            exporters: [otlp/highlight, logging]
`,
					language: 'yaml',
				},
			],
		},
		{
			title: 'Run the collector',
			content:
				'Run the [OpenTelemetry collector](https://opentelemetry.io/docs/collector/getting-started/) to start streaming the logs to highlight.',
			code: [
				{
					text: `./otelcol-contrib --config=config.yaml`,
					language: 'bash',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const RubyOtherLogContent: QuickStartContent = {
	title: 'Logging from Ruby',
	subtitle: 'Learn how to set up highlight.io Ruby log ingestion.',
	logoUrl: siteUrl('/images/quickstart/ruby.svg'),
	entries: [
		previousInstallSnippet('ruby'),
		{
			title: 'Set up and call the Highlight Logger.',
			content:
				'Highlight::Logger can be used in place of your existing logger, and will record and send logs to Highlight.',
			code: [
				{
					text: `require "highlight"

Highlight::H.new("<YOUR_PROJECT_ID>") do |c|
  c.service_name = "my-ruby-app"
  c.service_version = "git-sha"
end

logger = Highlight::Logger.new(STDOUT)
logger.info('hello, world!')
logger.error('oh no!')`,
					language: 'ruby',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const RubyRailsLogContent: QuickStartContent = {
	title: 'Logging from Ruby Rails',
	subtitle: 'Learn how to set up highlight.io Rails log ingestion.',
	logoUrl: siteUrl('/images/quickstart/rails.svg'),
	entries: [
		previousInstallSnippet('ruby'),
		{
			title: 'Set up the Highlight Logger.',
			content:
				'In a Rails initializer, you can replace or extend your logger with the Highlight Logger.',
			code: [
				{
					text: `require "highlight"

Highlight::H.new("<YOUR_PROJECT_ID>") do |c|
  c.service_name = "my-rails-app"
  c.service_version = "git-sha"
end

# you can replace the Rails.logger with Highlight's
Rails.logger = Highlight::Logger.new(STDOUT)

# or alternatively extend it to log with both
highlightLogger = Highlight::Logger.new(nil)
Rails.logger.extend(ActiveSupport::Logger.broadcast(highlightLogger))`,
					language: 'ruby',
				},
			],
		},
		verifyLogs,
	],
}
import { siteUrl } from '../../utils/urls'
import { GoChiContent } from './backend/go/chi'
import { GoEchoContent } from './backend/go/echo'
import { GoFiberContent } from './backend/go/fiber'
import { GoGinContent } from './backend/go/gin'
import { GoGqlgenContent } from './backend/go/go-gqlgen'
import { GoMuxContent } from './backend/go/mux'
import { JavaOtherContent } from './backend/java/other'
import { JSApolloContent } from './backend/js/apollo'
import { JSCloudflareContent } from './backend/js/cloudflare'
import { JSExpressContent } from './backend/js/express'
import { JSFirebaseContent } from './backend/js/firebase'
import { JSNestContent } from './backend/js/nestjs'
import { JSNodeContent } from './backend/js/nodejs'
import { JStRPCContent } from './backend/js/trpc'
import { PythonAWSContext } from './backend/python/aws'
import { PythonAzureContext } from './backend/python/azure'
import { PythonDjangoContext } from './backend/python/django'
import { PythonFastAPIContext } from './backend/python/fastapi'
import { PythonFlaskContext } from './backend/python/flask'
import { PythonGCPContext } from './backend/python/gcp'
import { PythonOtherContext } from './backend/python/other'
import { RubyOtherContent } from './backend/ruby/other'
import { RubyRailsContent } from './backend/ruby/rails'
import { AngularContent } from './frontend/angular'
import { GatsbyContent } from './frontend/gatsby'
import { NextContent } from './frontend/next'
import { OtherContext } from './frontend/other'
import { ReactContent } from './frontend/react'
import { RemixContent } from './frontend/remix'
import { SvelteKitContent } from './frontend/sveltekit'
import { VueContent } from './frontend/vue'
import { GoFiberLogContent } from './logging/go/fiber'
import { GoOtherLogContent } from './logging/go/other'
import { HostingVercelLogContent } from './logging/hosting/vercel'
import { HTTPContent } from './logging/http'
import { JSNestLogContent } from './logging/js/nestjs'
import { JSOtherLogContent } from './logging/js/other'

import { JSAWSLambdaContent } from './backend/js/aws-lambda'
import { DockerContent } from './logging/docker'
import { FileContent } from './logging/file'
import { FluentForwardContent } from './logging/fluentd'
import { HostingFlyIOLogContent } from './logging/hosting/fly-io'
import { HostingRenderLogContent } from './logging/hosting/render'
import { JavaOtherLogContent } from './logging/java/other'
import { JSCloudflareLoggingContent } from './logging/js/cloudflare'
import { JSPinoHTTPJSONLogContent } from './logging/js/pino'
import { JSWinstonHTTPJSONLogContent } from './logging/js/winston'
import { PythonLoguruLogContent } from './logging/python/loguru'
import { PythonOtherLogContent } from './logging/python/other'
import { RubyOtherLogContent } from './logging/ruby/other'
import { RubyRailsLogContent } from './logging/ruby/rails'
import { SyslogContent } from './logging/syslog'
import { SystemdContent } from './logging/systemd'
import { DevDeploymentContent } from './self-host/dev-deploy'
import { SelfHostContent } from './self-host/self-host'
import { GoTracesContent } from './traces/go/go'
import { OTLPTracesContent } from './traces/otlp'

export type QuickStartOptions = {
	title: string
	subtitle: string
	logoUrl: string
} & {
	[key: string]: QuickStartContent
}

export type QuickStartContent = {
	title: string
	subtitle: string
	logoUrl?: string
	entries: Array<QuickStartStep>
}

export type QuickStartCodeBlock = {
	key?: string
	text: string
	language: string
	copy?: string
}

export type QuickStartStep = {
	title: string
	content: string
	code?: QuickStartCodeBlock[]
	hidden?: true
}

export enum QuickStartType {
	Angular = 'angular',
	React = 'react',
	Remix = 'remix',
	SvelteKit = 'svelte-kit',
	Next = 'next',
	Vue = 'vue',
	Gatsby = 'gatsby',
	SelfHost = 'self-host',
	DevDeploy = 'dev-deploy',
	Other = 'other',
	PythonFlask = 'flask',
	PythonDjango = 'django',
	PythonFastAPI = 'fastapi',
	PythonLoguru = 'loguru',
	PythonOther = 'other',
	PythonAWSFn = 'aws-lambda-python',
	PythonAzureFn = 'azure-functions',
	PythonGCPFn = 'google-cloud-functions',
	GoGqlgen = 'gqlgen',
	GoFiber = 'fiber',
	GoChi = 'chi',
	GoEcho = 'echo',
	GoMux = 'mux',
	GoGin = 'gin',
	GoLogrus = 'logrus',
	GoOther = 'other',
	JSApollo = 'apollo',
	JSAWSFn = 'aws-lambda-node',
	JSCloudflare = 'cloudflare',
	JSExpress = 'express',
	JSFirebase = 'firebase',
	JSNodejs = 'nodejs',
	JSNestjs = 'nestjs',
	JSWinston = 'winston',
	JSPino = 'pino',
	JStRPC = 'trpc',
	HTTPOTLP = 'curl',
	Syslog = 'syslog',
	Systemd = 'systemd',
	FluentForward = 'fluent-forward',
	Docker = 'docker',
	File = 'file',
	RubyOther = 'other',
	RubyRails = 'rails',
	JavaOther = 'other',
	HostingVercel = 'vercel',
	HostingFlyIO = 'fly-io',
	HostingRender = 'render',
	OTLP = 'otlp',
}

export const quickStartContent = {
	client: {
		title: 'Client SDKs',
		subtitle: 'Select a client SDK to get started.',
		logoUrl: siteUrl('/images/quickstart/javascript.svg'),
		js: {
			title: 'Select your client framework',
			subtitle:
				'Select a client SDK to install session replay, error monitoring, and logging for your frontend application.',
			logoUrl: siteUrl('/images/quickstart/javascript.svg'),
			[QuickStartType.React]: ReactContent,
			[QuickStartType.Angular]: AngularContent,
			[QuickStartType.Next]: NextContent,
			[QuickStartType.Remix]: RemixContent,
			[QuickStartType.Vue]: VueContent,
			[QuickStartType.SvelteKit]: SvelteKitContent,
			[QuickStartType.Gatsby]: GatsbyContent,
			[QuickStartType.Other]: OtherContext,
		},
	},
	backend: {
		title: 'Select your backend language',
		subtitle:
			'Select a backend language to see the SDKs available for setting up error monitoring and logging for your application.',
		python: {
			title: 'Python',
			subtitle:
				'Select your Python framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/python.svg'),
			[QuickStartType.PythonFlask]: PythonFlaskContext,
			[QuickStartType.PythonDjango]: PythonDjangoContext,
			[QuickStartType.PythonFastAPI]: PythonFastAPIContext,
			[QuickStartType.PythonOther]: PythonOtherContext,
			[QuickStartType.PythonAWSFn]: PythonAWSContext,
			[QuickStartType.PythonAzureFn]: PythonAzureContext,
			[QuickStartType.PythonGCPFn]: PythonGCPContext,
		},
		go: {
			title: 'Go',
			subtitle:
				'Select your Go framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/go.svg'),
			[QuickStartType.GoGqlgen]: GoGqlgenContent,
			[QuickStartType.GoFiber]: GoFiberContent,
			[QuickStartType.GoEcho]: GoEchoContent,
			[QuickStartType.GoChi]: GoChiContent,
			[QuickStartType.GoMux]: GoMuxContent,
			[QuickStartType.GoGin]: GoGinContent,
		},
		js: {
			title: 'JavaScript',
			subtitle:
				'Select your JavaScript framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/javascript.svg'),
			[QuickStartType.JSApollo]: JSApolloContent,
			[QuickStartType.JSAWSFn]: JSAWSLambdaContent,
			[QuickStartType.JSCloudflare]: JSCloudflareContent,
			[QuickStartType.JSExpress]: JSExpressContent,
			[QuickStartType.JSFirebase]: JSFirebaseContent,
			[QuickStartType.JSNodejs]: JSNodeContent,
			[QuickStartType.JSNestjs]: JSNestContent,
			[QuickStartType.JStRPC]: JStRPCContent,
		},
		ruby: {
			title: 'Ruby',
			subtitle:
				'Select your Ruby framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/ruby.svg'),
			[QuickStartType.RubyRails]: RubyRailsContent,
			[QuickStartType.RubyOther]: RubyOtherContent,
		},
		java: {
			title: 'Java',
			subtitle:
				'Select your Java framework to install error monitoring for your application.',
			logoUrl: siteUrl('/images/quickstart/java.svg'),
			[QuickStartType.JavaOther]: JavaOtherContent,
		},
	},
	'backend-logging': {
		title: 'Select your language',
		subtitle:
			'Select your backend language to install logging in your application.',
		python: {
			title: 'Python',
			subtitle:
				'Select your Python framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/python.svg'),
			[QuickStartType.PythonLoguru]: PythonLoguruLogContent,
			[QuickStartType.PythonOther]: PythonOtherLogContent,
		},
		go: {
			title: 'Go',
			subtitle:
				'Select your Go framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/go.svg'),
			[QuickStartType.GoLogrus]: GoOtherLogContent,
			[QuickStartType.GoOther]: GoOtherLogContent,
			[QuickStartType.GoFiber]: GoFiberLogContent,
		},
		js: {
			title: 'JavaScript',
			subtitle:
				'Select your JavaScript framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/javascript.svg'),
			[QuickStartType.JSNodejs]: JSOtherLogContent,
			[QuickStartType.JSNestjs]: JSNestLogContent,
			[QuickStartType.JSWinston]: JSWinstonHTTPJSONLogContent,
			[QuickStartType.JSPino]: JSPinoHTTPJSONLogContent,
			[QuickStartType.JSCloudflare]: JSCloudflareLoggingContent,
		},
		other: {
			title: 'Infrastructure / Other',
			subtitle:
				'Get started with logging in your application via HTTP or OTLP.',
			[QuickStartType.FluentForward]: FluentForwardContent,
			[QuickStartType.File]: FileContent,
			[QuickStartType.Docker]: DockerContent,
			[QuickStartType.HTTPOTLP]: HTTPContent,
			[QuickStartType.Syslog]: SyslogContent,
			[QuickStartType.Systemd]: SystemdContent,
		},
		ruby: {
			title: 'Ruby',
			subtitle:
				'Select your Ruby framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/ruby.svg'),
			[QuickStartType.RubyRails]: RubyRailsLogContent,
			[QuickStartType.RubyOther]: RubyOtherLogContent,
		},
		java: {
			title: 'Java',
			subtitle:
				'Select your Java framework to install logging in your application.',
			logoUrl: siteUrl('/images/quickstart/java.svg'),
			[QuickStartType.JavaOther]: JavaOtherLogContent,
		},
		hosting: {
			title: 'Cloud Hosting Provider',
			subtitle:
				'Select your Hosting provider to setup the Highlight integration and stream logs.',
			[QuickStartType.HostingVercel]: HostingVercelLogContent,
			[QuickStartType.HostingFlyIO]: HostingFlyIOLogContent,
			[QuickStartType.HostingRender]: HostingRenderLogContent,
		},
	},
	traces: {
		title: 'Select your language',
		subtitle:
			'Tracing is supported with the Highlight Go SDK or via the OpenTelemetry protocol (OTLP).',
		go: {
			title: 'Go',
			subtitle: 'Install tracing in your Go application.',
			logoUrl: siteUrl('/images/quickstart/go.svg'),
			[QuickStartType.GoOther]: GoTracesContent,
		},
		otlp: {
			title: 'OpenTelemetry Protocol (OTLP)',
			[QuickStartType.OTLP]: OTLPTracesContent,
		},
	},
	other: {
		[QuickStartType.SelfHost]: SelfHostContent,
		[QuickStartType.DevDeploy]: DevDeploymentContent,
	},
} as const
