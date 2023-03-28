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
	content: `Grab your project ID from [app.highlight.io/setup](https://app.highlight.io/setup) and insert it in place of \`<YOUR_PROJECT_ID>\`.
                    To get started, we recommend setting \`environment\`, \`version\`, and \`networkRecording\`. Refer to our docs on [SDK configuration](${sessionReplayFeaturesLink}) to read more about these options. `,
	code: {
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
}

export const GatsbyContent: QuickStartContent = {
	title: 'Gatsby',
	subtitle: 'Learn how to set up highlight.io with your Gatsby application.',
	logoUrl: siteUrl('/images/quickstart/gatsby.svg'),
	entries: [
		{
			title: 'Install the gatsby plugin.',
			content: 'Install the npm pulugin in your terminal.',

			code: {
				text: `# with npm
npm install @highlight-run/gatsby-plugin-highlight

# with yarn
yarn add @highlight-run/gatsby-plugin-highlight
    `,
				language: 'bash',
			},
		},
		initializePluginSnippet,
		identifySnippet,
		verifySnippet,
		configureSourcemapsCI(),
		setupBackendSnippet,
	],
}
