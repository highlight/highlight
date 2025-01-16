import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	customError,
	initializeSdk,
	installSdk,
	verifyErrors,
} from './shared-snippets-monitoring'

export const RubyOtherReorganizedContent: QuickStartContent = {
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
		{
			title: 'Set up and call the Highlight Logger.',
			content:
				'Highlight::Logger can be used in place of your existing logger, and will record and send logs to Highlight.',
			code: [
				{
					text: `require "highlight"
		
		Highlight.init("<YOUR_PROJECT_ID>", environment: "production") do |c|
			c.service_name = "my-ruby-app"
			c.service_version = "git-sha"
		end
		
		logger = Highlight::Logger.new(STDOUT)
		logger.info('hello, world!')
		logger.error('oh no!')`,
					language: 'ruby',
				},
			],
		},
		verifyLogs,
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
