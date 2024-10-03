import { siteUrl } from '../../../../utils/urls'
import { initializeSdk, installSdk } from '../../backend/ruby/shared-snippets'
import { frontendInstallSnippet } from '../../backend/shared-snippets'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyTraces } from '../shared-snippets'

export const RubyOtherTracesContent: QuickStartContent = {
	title: 'Ruby',
	subtitle: 'Learn how to set up highlight.io tracing for Ruby applications.',
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
		verifyTraces,
	],
}
