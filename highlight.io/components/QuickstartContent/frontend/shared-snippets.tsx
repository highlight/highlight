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
		"Check your [dashboard](https://app.highlight.io/sessions) for a new session. Don't see anything? Send us a message in [our community](https://highlight.io/community) and we can help debug.",
}

export const setupBackendSnippet: QuickStartStep = {
	title: 'Instrument your backend.',
	content: `The next step is instrumenting your backend to tie logs/errors to your frontend sessions. Read more about this in our [backend instrumentation](${backendInstrumentationLink}) section.`,
}
