import {
	browserGettingStartedLink,
	fullstackMappingLink,
} from '../frontend/shared-snippets'
import { QuickStartStep } from '../QuickstartContent'

export const frontendInstallSnippet: QuickStartStep = {
	title: 'Configure client-side Highlight. (optional)',
	content: `If you're using Highlight on the frontend for your application, make sure you've [initialized it correctly](${browserGettingStartedLink}#for-your-frontend) and followed the [fullstack mapping guide](${fullstackMappingLink}#How-can-I-start-using-this).`,
}

export const verifyErrors: QuickStartStep = {
	title: 'Verify your errors are being recorded.',
	content:
		'Verify that the backend error handling works by triggering the code that reports the error to highlight and visiting the [highlight errors portal](https://app.highlight.io/errors).',
}
