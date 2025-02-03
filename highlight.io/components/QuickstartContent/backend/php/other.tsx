import { QuickStartContent } from '../../QuickstartContent'
import {
	customError,
	initializeSdk,
	installSdk,
	setUpLogging,
	verifyErrors,
} from './shared-snippets'

export const PHPOtherContent: QuickStartContent = {
	title: 'PHP',
	subtitle: 'Learn how to set up highlight.io on your PHP backend.',
	entries: [
		installSdk,
		initializeSdk,
		verifyErrors,
		customError,
		setUpLogging('other'),
	],
}
