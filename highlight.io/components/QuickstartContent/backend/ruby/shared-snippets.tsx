import { siteUrl } from '../../../../utils/urls'
import { QuickStartStep } from '../../QuickstartContent'

export const installSdk: QuickStartStep = {
	title: 'Install the Highlight Ruby SDK.',
	content: 'Add Highlight to your Gemfile and install with Bundler.',
	code: [
		{
			text: `gem "highlight_io"

bundle install`,
			language: 'bash',
		},
	],
}

export const initializeSdk: QuickStartStep = {
	title: 'Initialize the Highlight Ruby SDK.',
	content:
		"`Highlight.init` initializes the SDK. Setting your project ID also lets Highlight record errors for background tasks and processes that aren't associated with a frontend session.",
	code: [
		{
			text: `require "highlight"

Highlight.init("<YOUR_PROJECT_ID>", environment: "production") do |c|
  c.service_name = "my-app"
  c.service_version = "1.0.0"
end`,
			language: 'ruby',
		},
	],
}

export const customError: QuickStartStep = {
	title: 'Record custom errors. (optional)',
	content:
		'If you want to explicitly send an error to Highlight, you can use the `error` method within traced code.',
	code: [
		{
			text: `Highlight.exception(e)`,
			language: 'ruby',
		},
	],
}

export const customTrace: QuickStartStep = {
	title: 'Record custom traces. (optional)',
	content:
		'If you want to explicitly send a trace to Highlight, you can use the `start_span` method to wrap any code you want to trace.',
	code: [
		{
			text: `Highlight.start_span('my-span') do |span|
	# ...
end`,
			language: 'ruby',
		},
	],
}

export const verifyErrors: QuickStartStep = {
	title: 'Verify your errors are being recorded.',
	content:
		"Now that you've set up the Middleware, verify that the backend error handling works by consuming an error from traced code.",
}

export const setUpLogging: (slug: string) => QuickStartStep = (slug) => ({
	title: 'Set up logging.',
	content: `Start sending logs to Highlight! Follow the [logging setup guide](${siteUrl(
		`/docs/getting-started/backend-logging/ruby/${slug}`,
	)}) to get started.`,
})
