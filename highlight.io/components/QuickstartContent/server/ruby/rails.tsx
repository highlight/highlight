import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets-logging'
import { frontendInstallSnippet } from '../shared-snippets-monitoring'
import { verifyTraces } from '../shared-snippets-tracing'
import {
	customError,
	customTrace,
	initializeSdk,
	installSdk,
	verifyErrors,
} from './shared-snippets-monitoring'

export const RubyRailsReorganizedContent: QuickStartContent = {
	title: 'Rails',
	subtitle: 'Learn how to set up highlight.io on your Rails backend.',
	logoUrl: siteUrl('/images/quickstart/rails.svg'),
	products: ['Errors', 'Logs', 'Traces'],
	entries: [
		frontendInstallSnippet,
		installSdk,
		initializeSdk,
		{
			title: 'Verify your errors are being recorded.',
			content:
				"Now that you've set up the Middleware, you can verify that the backend error handling works by throwing an error in a controller. Visit the [highlight errors page](https://app.highlight.io/errors) and check that backend errors are coming in.",
			code: [
				{
					text: `class ArticlesController < ApplicationController
  def index
    1/0
  end
end`,
					language: 'ruby',
				},
			],
		},
		customError,
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
		verifyErrors,
		verifyLogs,
		customTrace,
		verifyTraces,
	],
}
