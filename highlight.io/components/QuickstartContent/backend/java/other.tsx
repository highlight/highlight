import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import {
	customError,
	initializeSdk,
	installSdk,
	sessionUsage,
	setUpLogging,
	verifyErrors,
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
