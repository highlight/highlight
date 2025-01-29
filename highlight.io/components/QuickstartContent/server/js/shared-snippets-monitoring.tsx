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
				text: `npm install --save ${packages}`,
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

H.init({
	projectID: '<YOUR_PROJECT_ID>',
	serviceName: '<YOUR_SERVICE_NAME>',
	environment: 'production',
})`,
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
