import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const RubyRailsLogContent: QuickStartContent = {
	title: 'Logging from Ruby Rails',
	subtitle: 'Learn how to set up highlight.io Rails log ingestion.',
	logoUrl: siteUrl('/images/quickstart/rails.svg'),
	entries: [
		previousInstallSnippet('ruby'),
		{
			title: 'Set up the Highlight Logger.',
			content:
				'In a Rails initializer, you can replace or extend your logger with the Highlight Logger.',
			code: [
				{
					text: `require "highlight"

Highlight.init("<YOUR_PROJECT_ID>", environment: "production") do |c|
  c.service_name = "my-rails-app"
  c.service_version = "git-sha"
end

# you can replace the Rails.logger with Highlight's
Rails.logger = Highlight::Logger.new(STDOUT)

# or broadcast logs to Highlight's logger
highlight_logger = Highlight::Logger.new(nil)
Rails.logger.broadcast_to(highlight_logger)

# or if using an older version of Rails, you can extend the logger
Rails.logger.extend(ActiveSupport::Logger.broadcast(highlight_logger))`,
					language: 'ruby',
				},
			],
		},
		verifyLogs,
	],
}
