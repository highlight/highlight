import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customError,
	customTrace,
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
				'`start_span` will automatically record raised exceptions and send them to Highlight.',
			code: [
				{
					text: `require "highlight"

Highlight.start_span('my-span') do
  span.add_attribute({ key: "value" })
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
