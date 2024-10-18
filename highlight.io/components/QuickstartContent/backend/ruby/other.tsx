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
		verifyErrors,
		customError,
		setUpLogging('other'),
	],
}
