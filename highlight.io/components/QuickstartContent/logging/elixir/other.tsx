import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const ElixirOtherLogContent: QuickStartContent = {
	title: 'Logging from Elixir',
	subtitle: 'Learn how to set up highlight.io Elixir log ingestion.',
	entries: [
		{
			title: 'Set up your highlight.io SDK.',
			content: `First, make sure you've followed the [backend getting started](${siteUrl(
				'/docs/getting-started/backend-sdk/elixir/other',
			)}) guide.`,
		},
		{
			title: 'Import the Logger module.',
			content:
				'Highlight works with the Logger module to make logging easier.',
			code: [
				{
					text: 'require Logger',
					language: 'elixir',
				},
			],
		},
		{
			title: 'Call the logging facades.',
			content:
				"`Highlight.init/0` automatically installs a logging backend, so you can call any of the Logger module's functions to emit logs.",
			code: [
				{
					text: `\
Logger.debug("This is a debug!")
Logger.info("This is an info!")
Logger.notice("This is a notice!")
Logger.warning("This is a warning!")
Logger.error("This is an error!")`,
					language: 'elixir',
				},
			],
		},
		verifyLogs,
	],
}
