import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { setUpLogging } from './shared-snippets'

export const ElixirOtherContent: QuickStartContent = {
	title: 'Elixir',
	subtitle: 'Learn how to set up highlight.io without a framework.',
	logoUrl: siteUrl('/images/quickstart/elixir.svg'),
	entries: [
		{
			title: 'Install the Highlight Elixir SDK.',
			content: 'Add Highlight to your mix.exs file.',
			code: [
				{
					text: `\
defp deps do
	[
    	...
    	{:highlight, "~> 0.1"}
  	]
end`,
					language: 'elixir',
				},
			],
		},
		{
			title: 'Initialize the Highlight Elixir SDK.',
			content: '`Highlight.init/0` initializes the SDK.',
			code: [
				{
					text: `Highlight.init()`,
					language: 'elixir',
				},
			],
		},
		{
			title: 'Record exceptions.',
			content:
				'`Highlight.record_exception/4` can be used to explicitly record any exception.',
			code: [
				{
					text: `\
try do
	# some code that may raise an error
rescue
  	exception ->
	    Highlight.record_exception(exception, %Highlight.Config{
	      	project_id: "your_project_id",
	      	service_name: "your_service_name",
	      	service_version: "1.0.0"
	    }, "session_12345", "request_67890")
end`,
					language: 'elixir',
				},
			],
		},
		{
			title: 'Verify your errors are being recorded.',
			content:
				"Now that you've set up the SDK, you can verify that the backend error handling works by sending an error in. Visit the [highlight errors page](http://app.highlight.io/errors) and check that backend errors are coming in.",
		},
		setUpLogging('other'),
	],
}
