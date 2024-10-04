import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { frontendInstallSnippet } from '../shared-snippets'
import {
	customError,
	customTrace,
	initializeSdk,
	installSdk,
	setUpLogging,
} from './shared-snippets'

export const RubyRailsContent: QuickStartContent = {
	title: 'Rails',
	subtitle: 'Learn how to set up highlight.io on your Rails backend.',
	logoUrl: siteUrl('/images/quickstart/rails.svg'),
	entries: [
		frontendInstallSnippet,
		installSdk,
		initializeSdk,
		{
			title: 'Verify your errors are being recorded.',
			content:
				"Now that you've set up the Middleware, you can verify that the backend error handling works by throwing an error in a controller. Visit the [highlight errors page](http://app.highlight.io/errors) and check that backend errors are coming in.",
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
		customTrace,
		setUpLogging('rails'),
	],
}
