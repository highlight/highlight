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
	environment="production",
)`
