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

export const verifyErrors: QuickStartStep = {
	title: 'Verify your errors are being recorded.',
	content:
		'Verify that the backend error handling works by triggering the code that reports the error to highlight and visiting the [highlight errors portal](http://app.highlight.io/errors).',
}
