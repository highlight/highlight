import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const RubyOtherLogContent: QuickStartContent = {
	title: 'Logging from Ruby',
	subtitle: 'Learn how to set up highlight.io Ruby log ingestion.',
	logoUrl: siteUrl('/images/quickstart/ruby.svg'),
	entries: [
		previousInstallSnippet('ruby'),
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
	],
}
